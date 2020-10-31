const express = require('express')
const bodyparser = require('body-parser')
const app = express()
const mysql = require('mysql')
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

//Adding desc for new product, NOT UPDATING
app.post('/adddescription', (req,res)=>{
  try{
    const DescriptionTitle = req.body.DescriptionTitle;
    const DescriptionText = req.body.DescriptionText;
    const ProductID = req.body.ProductID;
    if(!DescriptionTitle || !DescriptionText || !ProductID){
      return res.send("Please provide all details to add new description");
    }

    db.query('SELECT * FROM product WHERE ProductID = ?', [ProductID],
      (error,results) => {
        if(error){
          console.log(error);
        }else{
          if(results.length == 0){
            return res.send("Product doesnt exist for ID = " + ProductID);
          }else{
            db.query('INSERT INTO description SET ?', {DescriptionTitle: DescriptionTitle, DescriptionText: DescriptionText, ProductID: ProductID},
              (error, results) => {
                if(error){
                  console.log(error);
                }else{
                  return res.send("Description added for product ID = " + ProductID);
                }
            })
          }
        }
      }
    )


  }catch(e){
    if(e){
      throw e;
    }
  }
})

//Updating desc for new product
app.post('/updatedescription', (req,res)=>{
  try{
    const DescriptionTitle = req.body.DescriptionTitle;
    const DescriptionText = req.body.DescriptionText;
    const ProductID = req.body.ProductID;
    if(!DescriptionTitle || !DescriptionText || !ProductID){
      return res.send("Please provide all details to update description");
    }

    db.query('SELECT * FROM description WHERE ProductID = ?', [ProductID],
      (error,results) => {
        if(error){
          console.log(error);
        }else{
          if(results.length == 0){
            return res.send("Description doesnt exist for ProductID = " + ProductID);
          }else{
            db.query('UPDATE description SET DescriptionTitle = ?, DescriptionText = ? WHERE ProductID = ?', [DescriptionTitle,DescriptionText,ProductID],
              (error, results) => {
                if(error){
                  console.log(error);
                }else{
                  return res.send("Description updated for product ID = " + ProductID);
                }
            })
          }
        }
      }
    )

  }catch(e){
    if(e){
      throw e;
    }
  }
})

app.listen(4548, ()=>{
  console.log("Description Service Up and Running on port 4548");
})
