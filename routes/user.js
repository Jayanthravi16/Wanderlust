const express = require("express");
const router = express.Router();
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");

router.route("/signup")
  .get(userController.renderSignupForm)
  .post(userController.signup);

router.route("/login")
  .get(userController.renderLoginForm)
  .post(saveRedirectUrl, ...userController.login);

router.route("/logout")
  .post(userController.logout);

module.exports = router;
