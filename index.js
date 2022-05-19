const express = require("express");
const mongoose = require("mongoose"); 
const bodyParser = require("body-parser");
const {google} = require("googleapis");

require('dotenv/config');

const app = express();

//GET DATA AS JSON
app.use(bodyParser.json());

//IMPORT ROUTES
const formsRoute = require('./routes/forms');
const responsesRoute = require('./routes/responses');
const sheetsRoute = require('./routes/sheets');

//MIDDLEWARES
app.use('/forms', formsRoute);
app.use('/responses', responsesRoute);
app.use('/sheets',sheetsRoute);

app.get("/",(req,res)=>{
  return res.status(200).json({"status":"OK"});
});


mongoose.connect(process.env.DB_CONNECTION,
  () => console.log('connected to db'))
app.listen(3000, (req,res) => console.log("running on 3000"));

// spreadsheet link : https://docs.google.com/spreadsheets/d/1SgjKe3W6CZGAEgFL960C8bQaNoLcmsV_SSMwzEU38To/edit?usp=sharing