const connectToMongo = require("./connections");
const express = require("express");
var cors = require("cors");
const axios = require("axios");
const User = require("../Models/User");
const UserDetails = require("../Models/UserDetails");
const Cart = require("../Models/Cart");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

connectToMongo();
const app = express();
const port = 8001;

app.use(express.json());
app.use(cors());

const jwt_secret = "88465123";

app.post(
  "/signup",
  [body("email", "Enter a valid email").isEmail()],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ success, error: "This email already exist" });
      }
      const salt = await bcrypt.genSalt(10);
      const safepass = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: safepass,
        number: req.body.number,
      });

      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, jwt_secret);
      success = true;
      res.status(200).json({ success, authtoken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some Error occurred");
    }
  }
);

app.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success = false;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ success, error: "Please enter correct email" });
      }

      const passwordcheck = await bcrypt.compare(password, user.password);
      if (!passwordcheck) {
        return res
          .status(401)
          .send({ success, error: "Please enter correct password" });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, jwt_secret);
      success = true;
      res.status(200).json({ success, authtoken, data });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some Error occurred");
    }
  }
);

app.post("/add-to-cart", async (req, res) => {
  const data = req.body;
  console.log(req.body);
  Cart.findOne({ itemIndex: data.itemIndex, loginId: data.loginId }).then(async (result, err) => {
    console.log(result)
    if (result) {
      Cart.findOneAndUpdate(
        { _id: result._id },
        { amount: (parseInt(result.amount) + 1).toString() }
      ).then((final, err) => {
        if (err) {
          res.send(err);
        } else {
          res.send({ message: "Cart updated successfully", data: final });
        }
      });
    } else {
      await Cart.insertMany({
        productName: data.productName,
        productPrice: data.productPrice,
        productDescription: data.productDescription,
        productImage: data.productImage,
        loginId: data.loginId,
        amount: data.amount,
        itemIndex: data.itemIndex,
      })
        .then(() => {
          res.send({ message: "Added!" });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
  // if (!item) {
   
  // } else {
  // }
  
  // await Cart.insertMany({
  //   productName: data.productName,
  //   productPrice: data.productPrice,
  //   productDescription: data.productDescription,
  //   productImage: data.productImage,
  //   loginId: data.loginId,
  //   amount: data.amount,
  //   itemIndex: data.itemIndex,
  // })
  //   .then(() => {
  //     res.send({ message: "Added!" });
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
});

app.post("/update-cart", (req, res) => {
  const data = req.body;
  Cart.findOneAndUpdate(
    { _id: data.itemId },
    { amount: data.amount.toString() }
  ).then((result, err) => {
    if (err) {
      res.send(err);
    } else {
      res.send({ message: "Cart updated successfully", data: result });
    }
  });
});

app.post("/delete-cart-item", (req, res) => {
  const data = req.body;
  Cart.findOneAndDelete({ _id: data.itemId }).then((err) => {
    if (err) {
      res.send(err);
    } else {
      res.send({ message: "Item deleted successfully" });
    }
  });
});

app.post("/get-cart-items", (req, res) => {
  const data = req.body;
  console.log(req.body);
  Cart.find({ loginId: data.loginId }).then((result, err) => {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});

app.post("/get-single-item", (req, res) => {
  const data = req.body;
  console.log(req.body);
  Cart.find({ itemIndex: data.itemIndex, loginId: data.loginId }).then((result, err) => {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});

app.get("/", (req, res) => {
  res.send("Hi!");
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

// axios.post('https://unicorn-backend-new.vercel.app/add-to-cart', {
//     productName: "fh26c",
//     productPrice: "fcgnv",
//     productDescription: "dacszssfdf",
//     productImage: "dgcsf",
//     loginId: "dsf"
// }).then(res => console.log(res.data))

// axios.post('http://localhost:8000/get-cart-items', {
//     loginId: "dsf"
// }).then(res => {
//     console.log(res.data)
// })

// axios.post('http://localhost:8000/delete-cart-item', {
//     itemId: "652ea5124524e81cda63fca4",
// }).then(res => {
//     console.log(res.data)
// })

module.exports = app