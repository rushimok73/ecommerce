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

app.get('/getproducts', (req,res)=>{
  db.query('SELECT * FROM product', (error, results) => {
    if(error){
      console.log(error);
    }else{
      console.log(results);
      return res.json(results);
    }
  })
})

app.get('/getproduct/:id', (req,res)=>{
  db.query('SELECT * FROM product WHERE ProductId = ?', [req.params.id],
  (error, results) => {
    if(error){
      console.log(error);
    }else{
      console.log(results);
      return res.json(results);
    }
  })
})

app.post('/addproduct', (req,res)=>{
  try{
    const ProductName = req.body.ProductName;
    const ProductPrice = req.body.ProductPrice;
    const ProductDiscount = req.body.ProductDiscount;
    const ProductStock = req.body.ProductStock;
    if(!ProductName || !ProductDiscount || !ProductPrice || !ProductStock){
      return res.send("Please provide all details about product");
    }

    db.query('INSERT INTO product SET ?', {ProductName: ProductName, ProductPrice: ProductPrice, ProductDiscount: ProductDiscount, ProductStock: ProductStock},
    (error, results) => {
      if(error){
        console.log(error);
      }else{
        res.send("product added");
      }
    })
  }catch(e){
    if(e){
      throw e;
    }
  }
})

app.listen(4546, ()=>{
  console.log("Product Service Up and Running on port 4546");
})
