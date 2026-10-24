const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");

router.get("/signup", (req, res)=>{
    res.render("users/signup.ejs");
});

router.post("/signup", async (req, res, next) => {
    let registeredUser;
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ email, username });
        registeredUser = await User.register(newUser, password);
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
        return;
    }

    req.login(registeredUser, (err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Welcome to WanderLust!");
        res.redirect("/listings");
    });
});

router.get("/login", (req, res)=>{
    res.render("users/login.ejs");
});

router.post("/login", passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
}), async(req, res)=>{
    req.flash("success", "Welcome back to WanderLust!");
    res.redirect("/listings");
});

router.post("/logout", (req, res, next) => {
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", "You are logged out.");
        res.redirect("/listings");
    });
});

module.exports = router;
