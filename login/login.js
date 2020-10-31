const express = require('express')
const bodyparser = require('body-parser')
const app = express()
const bcrypt = require('bcryptjs')
const passport = require('passport')
const mysql = require('mysql')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nodejs-table'
})

dotenv.config({
  path :'./.env'
})

db.connect((error)=>{
  if(error){
    console.log(error)
  }else{
    console.log("DB Connected successfully")
  }
})

app.use(bodyparser.json())

app.post('/login', (req,res) => {
  try{
    const email = req.body.UserEmail;
    const password = req.body.UserPassword;

    if(!email || !password){
      return res.send("Please provide both email and password");
    }

    db.query('SELECT * FROM login WHERE UserEmail = ?', [email],
    async (error, results) => {
      console.log(results);
      if(!results || !(await bcrypt.compare(password, results[0].UserPassword)) ){
        res.send("Invalid Credentials");
      }else{
        const id = results[0].id;
          const token = jwt.sign({id: id, email:results[0].UserEmail, phoneno:results[0].UserPhoneNumber}, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN
        })

        console.log("Token created on login");

        const coookieOptions = {
          expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
          ),
          httpOnly: true
        }
        res.cookie('jwt', token, coookieOptions);
        return res.send("User logged in");
      }
    })

  }catch(err){
    if(err){
      throw err;
    }
  }
})

app.post('/register', (req, res) => {
  console.log(req.body);

  const email = req.body.UserEmail;
  const password = req.body.UserPassword;
  const passwordconfirm = req.body.ConfirmUserPassword;
  const phoneno = req.body.UserPhoneNumber;
  let hashedpassword;

  db.query('SELECT UserEmail FROM login WHERE UserEmail = ?', [email],
    async (error, results) => {
      if (error) {
        console.log(error);
      }
      if (results.length > 0) {
        return res.send("Email already in use");
      }else if(password !== passwordconfirm) {
        console.log("NO MATCH");
        return res.send("Passwords dont match");
      }
      console.log("????");
      try{
        hashedpassword = await bcrypt.hash(password, 8);
        console.log(hashedpassword);
      }catch(e){
        console.log(error);
      }

      db.query('INSERT INTO login SET ?', {UserEmail: email, UserPhoneNumber: phoneno, UserPassword: hashedpassword},
        (error, results) => {
          if(error){
            console.log(error);
          }else{

            db.query('SELECT * FROM login WHERE UserEmail = ?', [email],
            async (error, results)=>{
              if(results.length>0){
                console.log("-----------");
                const resultid = results[0].UserID;
                console.log(resultid);
                db.query('INSERT INTO user SET ?', {UserID: resultid, UserPhoneNumber: phoneno},
                  (error, results) => {
                    if(error){
                      console.log(error);
                    }else{
                      console.log("User table also updated");
                    }
                })
              }else{
                console.log("Email doesnt exist");
                return res.json({message: "Doesn't Exist"});
              }
            })
            return res.send("User registered");
          }

      })

    })
})

app.listen(4545, ()=>{
  console.log("Login Service Up and Running on port 4545");
})
