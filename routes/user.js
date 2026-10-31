const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");

router.route("/signup")
  .get(userController.renderSignupForm)
  .post(userController.signup);

router.route("/login")
  .get(userController.renderLoginForm)
  .post(saveRedirectUrl, ...userController.login);

router.route("/logout")
  .post(userController.logout);

router.get("/account", isLoggedIn, userController.renderAccountPage);
router.post("/account/password", isLoggedIn, wrapAsync(userController.changePassword));
router.delete("/account", isLoggedIn, wrapAsync(userController.deleteAccount));

module.exports = router;
