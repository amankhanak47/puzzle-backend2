const express = require("express");
const UserCollection = require("./Models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const JWT_SECRET = "qwertyuiop";

// user Signup route
router.post(
  "/signup",
  [
    body("email"),
    body("name"),
    body("password"),
  ],
  async (req, res) => {
   
    try {
      //check email already exist or not
      let user = await UserCollection.findOne({ email: req.body.email });
      let sucess = false;
      if (user) {
        return res.status(400).json({
          sucess: sucess,
          errors: "sorry a user with this email already exist",
        });
      }
      const salt = await bcrypt.genSalt(10);
      secpass = await bcrypt.hash(req.body.password, salt);

      //create new user
      user = await UserCollection.create({
        name: req.body.name,
        password: secpass,
        email: req.body.email,
        score: 0
      });

      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      sucess = true;
      res.json({ sucess, authtoken });
    } catch (error) {
      return res.status(500).json({
          sucess: false,
          errors: "sorry a user with this email already exist",
        });
    }
  }
);


//user login ROUte 
router.post(
  "/login",
  [
    body("password"),
    body("email"),
  ],
  async (req, res) => {
    let sucess = false;   
    const { email, password } = req.body;
    try {
      //check wether user is there or not
      let user = await UserCollection.findOne({ email });
      if (!user) {
        sucess = false;
        return res
          .status(400)
          .json({ sucess: sucess, errors: "eamil id is not registered" });
      }
      const passcompare = await bcrypt.compare(password, user.password);
      if (!passcompare) {
        sucess = false;
        return res
          .status(400)
          .json({ sucess: sucess, errors: "incorrect password" });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      sucess = true;

      res.json({ sucess, authtoken });
    } catch (error) {
      res.status(500).send({sucess:false,errors:"internal server error occured"});
    }
  }
);

//update score route
router.post("/addscore",  body("email"),
    body("score"),async (req, res) => {
  try {
   let user = await UserCollection.findOne({ email:req.body.email });
    user.score = req.body.score;
    await user.save()
    res.json({sucess:true, user });
  }
  catch(error) {
  }
})

//get all user uscore for leaderboard
router.post(
  "/getallscores",
  async (req, res) => {
    try {
      const users=await UserCollection.find()
      res.json(users);
    } catch (error) {
      res.status(500).send("some error occured");
    }
  }
);


const fetchuser = (req, res, next) => {
  //get user from the jwt token and add to req object
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ error: "please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ error: "dont know" });
  }
};

//get user data route
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    let userId = req.user.id;
  

    const user = await UserCollection.findById(userId).select(
      "-password"
    );
    res.send(user);
  } catch (error) {
    res.status(500).send("internal server error occured");
  }
});

module.exports = router;