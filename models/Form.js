const mongoose = require('mongoose');
const {ObjectId} = require('mongodb'); 
const Response = require('./Response');

const QuestionSchema = mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  answerType: {
    type: String,
    enum : ['String','Number','Boolean','checkbox','radio'],
    default: 'String'
  },
  numberRangeMax: {
    type: Number,
    required: false
  },
  numberRangeMin: {
    type: Number,
    required: false
  },
  answerCheckBoxList: {
    type: [String],
    required: false
  },
  answerRadioList: {
    type: [String],
    required: false
  },

});
const FormSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  questions:{
    type: [QuestionSchema],
    default: undefined,
  },
  sheetsIntegrated:{
    type: Boolean,
    required: true,
    default: 0
  }
  ,
  responses:{
    type: [mongoose.ObjectId],
    ref: 'Respone'
  }
  ,
  date:{
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Forms', FormSchema);