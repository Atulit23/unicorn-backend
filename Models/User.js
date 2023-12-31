const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  email : {
    type : String,
    required :true ,
    unique  : true
  },
  password : {
    type : String,
    required :true,
  },
  name : {
    type : String,
    // required :true,
  },
  profilePic : {
    type : String,
    default: ''
  },
  number: {
    type : String,
    default: ''
  },
  date : {
    type : Date,
    default : Date.now
  },
  
});

const User = mongoose.model('user', UserSchema);
User.createIndexes();
module.exports = User