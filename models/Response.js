const mongoose = require('mongoose');
const {ObjectId} = require('mongodb'); 
const Form = require('./Form');

const AnswerSchema = mongoose.Schema({
  answer: {
    type: String,
    required: true
  },
  question_id: {
    type: mongoose.ObjectId,
    required: true
  }
});
const ResponseSchema = mongoose.Schema({
  form_id: {
    type: mongoose.ObjectId,
    required: true,
    ref: 'Form'
  },
  answers:{
    type: [AnswerSchema],
    default: undefined,
  },
  sheetSync: {
    type: Boolean,
    required: true,
    default: false
  }
  ,
  date:{
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Responses', ResponseSchema);