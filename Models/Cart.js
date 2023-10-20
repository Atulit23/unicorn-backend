const mongoose = require("mongoose");
const { Schema } = mongoose;

const CartSchema = new Schema({
  productName : {
    type : String,
  },
  productPrice : {
    type : String,
    default: "0"
  },
  productDescription: {
    type: String,
  },
  productImage: {
    type: Array,
  },
  loginId: {
    type: String,
  }, 
  amount: {
    type: String,
    default: "1"
  },
  itemId: {
    type: String
  },
  itemIndex: {
    type: String
  }
});

const Cart = mongoose.model('cart', CartSchema);
Cart.createIndexes();
module.exports = Cart