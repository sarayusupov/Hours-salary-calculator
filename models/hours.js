const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hoursSchema = new mongoose.Schema({
    year:{
        type:String,
        required:false
    },

    month:{
        type:String,
        required:false
    },
    salary: {
        type: Number,
        required: true
    },
    base:{
        type:Number,
        required:true
    },
    workdays:{
        type:Number,
        required:false
    },
    start: {
        type: [String],
        required: false
    },
    finish: {
        type: [String],
        required: false
    },

    absence: {
        type: [],
        required: false
    },

    lunch:{
        type: [String],
        required: false
    },

});

let overTime125 = 0;
let overTime150 = 0;


module.exports = mongoose.model('hours', hoursSchema);