const express = require('express')
const bodyparser = require('body-parser')
const app = express()
const mysql = require('mysql')
const dotenv = require('dotenv')
app.use(bodyparser.json())

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

app.post('/addcartitem', (req,res) => {
  //UserID will be gotten from the session variable, taking value as argument rn
  try{
    const UserID = req.body.UserID;
    const ProductID = req.body.ProductID;
    const Quantity = req.body.Quantity;
    if(!UserID || !ProductID){
      return res.send("Please provide all details about cart");
    }

    db.query('SELECT * FROM cart WHERE UserID = ? AND ProductID = ?', [UserID, ProductID],
    (error, results) => {
      if(error){
        console.log(error);
      }else{
        if(results.length > 0){
          var newquant = parseInt(results[0].Quantity) + parseInt(Quantity);
          db.query('UPDATE cart SET Quantity = ? WHERE ProductID = ? AND UserID = ?', [newquant,ProductID,UserID],
            (error, results) => {
              if(error){
                console.log(error);
              }else{
                return res.send("Cart updated for product ID = " + ProductID);
              }
          })
        }else{
          db.query('INSERT INTO cart SET ?', {UserID: UserID, ProductID: ProductID, Quantity: Quantity},
          (error, results) => {
            if(error){
              console.log(error);
            }else{
              res.send("cart item added");
            }
          })
        }
      }
    })

  }catch(e){
    if(e){
      throw e;
    }
  }
})

app.get('/getcartitems/:id', (req,res)=>{
  db.query('SELECT * FROM cart WHERE UserID = ?', [req.params.id],
  (error, results) => {
    if(error){
      console.log(error);
    }
    if(results.length>0){
      return res.json(results);
    }else{
      return res.send("UserID doesnt exist");
    }
  })
})

app.listen(4547, ()=>{
  console.log("Cart Service Up and Running on port 4547");
})
