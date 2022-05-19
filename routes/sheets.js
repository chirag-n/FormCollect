const express = require('express');
const { json } = require('express/lib/response');
const router = express.Router();
const {google} = require("googleapis");
const Form = require('../models/Form');
const Response = require('../models/Response');
require('dotenv/config');


router.post('/sync/:formId', async (req,res) => {
  // Find and Store form details
  try{ 
    const form = await Form.findById(req.params.formId);
  }catch(err){
    return res.json({message: err});
  }

  const form = await Form.findById(req.params.formId);
  if( form == null){
    return res.json({message: "Sheet not Found!"});
  }

  // Create and save metadata for sheets
  const sheetName = form.title;
  const sheetColumnNames = ['Response_Id','Submitted Time'];
  const questionIds = [];
  const arraysToInsert = [];

  // Populate Column Names and question ids of particular form
  form.questions.forEach( e => {
    sheetColumnNames.push(e.question);
    questionIds.push(e._id);
  });


  //AUTH AND SETUP
  const auth = new google.auth.GoogleAuth({
    keyFile: "./credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  //create client instance for auth
  const client = await auth.getClient();

  //instance of google sheets API
  const googleSheets = google.sheets({
    version: "v4",
    auth: client
  });

  // spreadsheet id corresponding to google sheets (don't forget to give permission to api's email)
  const spreadsheetId = process.env.SPREADSHEET_ID;

  // Create a New Tab if the form hasnt been integrated yet, also append Column Names
  if( form.sheetsIntegrated == false){
    
    // createsheet and append column names
    const tabName = sheetName;
    try {
      // Only add sheet if it doesn't already exist
      if ((await googleSheets.spreadsheets.get({spreadsheetId: spreadsheetId})).data.sheets
        .filter(sheet => sheet.properties.title === tabName).length === 0) {
        await googleSheets.spreadsheets.batchUpdate ({ 
          spreadsheetId: spreadsheetId, 
          resource: {requests: [ {addSheet: {properties: {title: tabName }}}]}});
      }
    } catch (err) {
      return res.json({message: err});
    }
    
    try{
      // Append Colmn names
      const range = String(sheetName) + "!A:" + String.fromCharCode('A'.charCodeAt() + sheetColumnNames.length);
      await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: range,
        valueInputOption: "USER-ENTERED",
        resource: {
          values: [sheetColumnNames]
        }
      });
      
      // Change state of integration of form and save
      form.sheetsIntegrated = true;
      form.save();
    }catch(err) {
      // Rollback state of integration of form and save
      form.sheetsIntegrated = false;
      form.save();

      throw err
    }
  }
  // To store list of responses being synced
  const syncList = [];
  try{
    // Async for each so we can await its completion for populating arraysToInsert(rows to insert into google sheet)
      async function asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
          await callback(array[index], index, array);
        }
      }

      // Populate arraysToInsert and Append GoogleSheets via API call
      const populateAndAppend = async () => {
        await asyncForEach(form.responses, async (e) => {
          const response = await Response.findById(e);

          // Skip to next response if it is already synced with GoogleSheets
          if(response.sheetSync == true){
            return;
          }

          // populate list of responses being synced to rollback incase of error(such as network failure, etc) performing Google API call
          syncList.push(e);
          response.sheetSync = true;
          response.save();
  
          const arrToInsert = [response._id, response.date];

          // Match answer of Response to Question and populate an awnser (A row in Google Sheets)
          questionIds.forEach( e => {
            let answer = response.answers.find(el => (String(el.question_id) === String(e)));
            arrToInsert.push((answer.answer));
          });
  
          arraysToInsert.push(arrToInsert);
        });
        
        // Append populated arraysToInsert to GoogleSheets (All non synced responses are synced and appended as individual Rows)
        const range = String(sheetName) + "!A:" + String.fromCharCode('A'.charCodeAt() + sheetColumnNames.length);
        try{
          await googleSheets.spreadsheets.values.append({
            auth,
            spreadsheetId,
            range: range,
            valueInputOption: "USER-ENTERED",
            resource: {
              values: arraysToInsert
            }
          });
        }catch(err){
          // Rollback sync State of response
          syncList.forEach( async (e) => {
            const response = await Response.findById(e);
            response.sheetSync = false;
            response.save();
          });
          throw err;
        }
      }

      populateAndAppend();

      const URL = "https://docs.google.com/spreadsheets/d/" + spreadsheetId + "/edit?usp=sharing";
    res.status(200).json({message : "Sync Successful",URL :URL});
  }catch(err){
    res.json({message: err});
  }
});

module.exports = router;