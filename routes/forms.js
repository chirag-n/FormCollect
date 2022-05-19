const express = require('express');
const router = express.Router();
const Form = require('../models/Form');

// GETS ALL THE FORMS
router.get('/', async (req,res) => {
  try{
    const forms = await Form.find();
    res.status(200).json(forms);
  }catch(err){
    res.json({message: err});
  }
});

//POSTS A FORM (CREATES A FORM)
router.post('/create', async (req,res) => {
  const form = new Form({
    title: req.body.title,
    questions: req.body.questions
  });
  
  try{
    const savedForm = await form.save();
    res.status(200).json(savedForm);
  }catch(err){
    res.json({message: err});
  }
});

//SPECIFIC FORM
router.get('/:formId', async (req,res) => {
  try{
    const form = await Form.findById(req.params.formId);
    res.status(200).json(form);
  }catch(err){
    res.status(400).json({message: err});
  }
});

//DELETE FORM
router.delete('/:formId', async (req,res) => {
  try{
    const removedForm = await Form.remove({_id: req.params.formId});
    const form = await Form.findById(req.params.formId);

    // Async for each so we can await its completion
    async function asyncForEach(array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    }

    // Remove all responses corresponding to this form
    const removeResponses = async () => {
      await asyncForEach(form.responses, async (e) => {
        const response = await Response.findById(e);
        const removedResponse = await Response.remove({_id: response._id});
      }
    )};

    removeResponses();

    res.status(200).json(removedForm);
  }catch(err){
    res.json({message: err});
  }
});

module.exports = router;