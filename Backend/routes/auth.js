const express = require("express");
const { body } = require("express-validator");

const User = require("../models/user");

const authController = require("../controllers/auth");

const router = express.Router();

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .custom(async (value, { req }) => {
        console.log(value);
        const userDoc = await User.findOne({ email: value });

        if (userDoc) {
          console.log(userDoc.email);
          return Promise.reject("Email address already exists");
        }
      }),
    body("password").trim().isLength({ min: 4 }),
    body("name").trim().isLength({ min: 5 }).notEmpty(),
  ],
  authController.signup
);


router.post('/login',authController.login);

module.exports = router;
