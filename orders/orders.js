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

app.post('/processorder',  (req,res) => {
  const UserID = req.body.UserID;
  if(!UserID){
    return res.send("Please send user ID");
  }
  let temp = 0;
  db.query('SELECT * FROM cart WHERE UserID = ?', [UserID],
    async (error, results) =>{
      if(error){
        console.log(error);
      }else{
        if(results.length > 0){
          //cart has items
          console.log("results = " + results);
          for(i = 0; i<results.length;i++){
            //console.log(results[i].ProductID);
            await db.query('SELECT * FROM product WHERE ProductID = ?' ,[results[i].ProductID],
              (errorp,resultp) => {
                if(errorp){
                  console.log(errorp);
                }else{
                  temp = resultp[0].ProductStock;
                  console.log("Product stock = " + resultp[0].ProductStock);
                  console.log("temp 1 = " + temp);
                }
              }
            )
            console.log("__");
            console.log("temp 2 = " + temp);
            //console.log(parseInt(initquant) - parseInt(results[i].Quantity));
            var final = parseInt(temp) - parseInt(results[i].Quantity);
            console.log(final);
            db.query('UPDATE product SET ProductStock = ? WHERE ProductID = ?', [final, results[i].ProductID],
              (errorx, resultsx) => {
                if(errorx){
                  //console.log(errorx);
                }else{
                  //res.send("Quantity updated");
                }
              }
            )
          }
          return res.send("Okay");
        }else{
          //cart has no items
          return res.send("cart empty");
        }
      }
    }
  )
})

app.listen(4549, ()=>{
  console.log("Order Service Up and Running on 4549");
})
