const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserDetailsSchema = new Schema({
  name : {
    type : String,
    required :true,
  },
  profilePic : {
    type : String,
    default: ''
  },
  loginId: {
    type: String,
    required: true
  }
});

const UserDetails = mongoose.model('userDetails', UserDetailsSchema);
UserDetails.createIndexes();
module.exports = UserDetails