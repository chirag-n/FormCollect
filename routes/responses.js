const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const Response = require('../models/Response');

// GETS ALL THE RESPONSES
router.get('/', async (req,res) => {
  try{
    const responses = await Response.find();
    res.status(200).json(responses);
  }catch(err){
    res.json({message: err});
  }
});

//POSTS A RESPONSE (SUBMITS A RESPONSE)
router.post('/submit', async (req,res) => {
  const response = new Response({
    form_id: req.body.form_id,
    answers: req.body.answers
  });
  
  try{
    
    const form = await Form.findById(response.form_id);
    const answerList = response.answers;

    //validate radio 
    function validateRadio(answerObj,questionObj){
      if( (questionObj).answerType != 'radio' ){
        return true;
      }
      const answerRadioList = questionObj.answerRadioList;
      if( answerRadioList.includes(String(answerObj.answer)) ){
        return true;
      }else{
        return false;
      }
    };
    //validate Number
    function validateNumber(answerObj,questionObj){
      if( (questionObj).answerType != 'Number' ){
        return true;
      }
      const numMax = questionObj.numberRangeMax;
      const numMin = questionObj.numberRangeMin;
      const numAns = parseFloat(answerObj.answer);

      if(String(numAns) === "NaN"){return false}
      if(numMax == null && numMin == null){return true}
      if(numMax == null){return numAns>=numMin}
      if(numMin == null){return numAns<=numMax}
      if(numAns>numMax || numAns<numMin){return false}
      return true
    };
    //validate Boolean
    function validateBoolean(answerObj,questionObj){
      if( (questionObj).answerType != 'Boolean' ){
        return true;
      }
      const BoolAns = answerObj.answer;

      if(!(BoolAns=='true' || BoolAns=='1' || BoolAns=='false' || BoolAns=='0')){
        return false;
      }
      return true;
    }
    //validate Checkbox
    function validateCheckbox(answerObj,questionObj){
      if( (questionObj).answerType != 'checkbox' ){
        return true;
      }
      const answerCheckBoxList = questionObj.answerCheckBoxList;
      const answerString = String(answerObj.answer);
      const valuesArr = answerString.split(";");
      valuesArr.forEach( e => {
        if( !(answerCheckBoxList.includes(String(answerObj.answer))) ){
          return false;
        }
      });
      return true;
    }

    answerList.forEach( answerObj => {
      const questionObj = form.questions.find( el => (String(el._id) === String(answerObj.question_id))) 
      // throw validation error if validation fails
      if((validateRadio(answerObj,questionObj) == false) || (validateNumber(answerObj,questionObj) == false) || (validateBoolean(answerObj,questionObj) == false) || (validateCheckbox(answerObj,questionObj) == false)){
        throw "Validation Fail Error";
      }
    });
    
    // save to db
    const savedResponse = await response.save();
    // Append list of responses of particular form
    form.responses.push(savedResponse._id);
    form.save();
    res.status(200).json(savedResponse);
  }catch(err){
    res.json({message: err});
  }
});

//SPECIFIC RESPONSE
router.get('/:responseId', async (req,res) => {
  try{
    const response = await Response.findById(req.params.responseId);
    res.status(200).json(response);
  }catch(err){
    res.json({message: err});
  }
});
//DISPLAY ALL RESPONSES OF A FORM
router.get('/of/:formId', async (req,res) => {
  try{
    const form = await Form.findById(req.params.formId);
    let responses = 0;
    if(form != null)
      responses = form.responses;
    res.status(200).json(responses);
  }catch(err){
    res.json({message: err});
  }
});

//DELETE RESPONSE
router.delete('/:responseId', async (req,res) => {
  try{
    const removedResponse = await Response.remove({_id: req.params.responseId});
    res.status(200).json(removedResponse);
  }catch(err){
    res.json({message: err});
  }
});

module.exports = router;