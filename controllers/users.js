const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const ExpressError = require("../utils/ExpressError.js");
const passport = require("passport");
const { deleteListingImage } = require("../utils/upload.js");

module.exports.renderSignupForm = (req, res)=>{
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
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
};

module.exports.renderLoginForm = (req, res)=>{
    res.render("users/login.ejs");
};

module.exports.renderAccountPage = (req, res) => {
    res.render("users/account.ejs");
};

module.exports.changePassword = async (req, res, next) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (
        typeof currentPassword !== "string" ||
        typeof newPassword !== "string" ||
        typeof confirmPassword !== "string" ||
        !currentPassword ||
        !newPassword ||
        !confirmPassword
    ) {
        req.flash("error", "Complete all password fields.");
        return res.redirect("/account");
    }
    if (newPassword !== confirmPassword) {
        req.flash("error", "The new passwords do not match.");
        return res.redirect("/account");
    }

    try {
        await req.user.changePassword(currentPassword, newPassword);
    } catch (error) {
        if (error.name === "IncorrectPasswordError") {
            req.flash("error", "Your current password is incorrect.");
            return res.redirect("/account");
        }
        return next(error);
    }

    req.flash("success", "Your password has been changed.");
    res.redirect("/account");
};

module.exports.login = [
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    (req, res) => {
        req.flash("success", "Welcome back to WanderLust!");
        const redirectUrl = res.locals.redirectUrl || "/listings";
        delete req.session.redirectUrl;
        res.redirect(redirectUrl);
    },
];

module.exports.logout = (req, res, next) => {
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", "You are logged o  ut.");
        res.redirect("/listings");
    });
};

module.exports.deleteAccount = async (req, res, next) => {
    const userId = req.user._id;
    const ownedListings = await Listing.find({ owner: userId })
        .select("_id image.filename reviews");
    const ownedListingIds = ownedListings.map((listing) => listing._id);
    const associatedListingReviewIds = ownedListings.flatMap((listing) => listing.reviews);
    const associatedReviews = await Review.find({
        $or: [
            { author: userId },
            { _id: { $in: associatedListingReviewIds } },
        ],
    }).select("_id");
    const reviewIds = associatedReviews.map((review) => review._id);

    await Listing.updateMany(
        { reviews: { $in: reviewIds } },
        { $pull: { reviews: { $in: reviewIds } } },
    );
    await Listing.deleteMany({ _id: { $in: ownedListingIds } });
    await Review.deleteMany({ _id: { $in: reviewIds } });
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
        throw new ExpressError(404, "Your account could not be found");
    }

    const imageCleanupFailures = [];
    for (const listing of ownedListings) {
        try {
            await deleteListingImage(listing.image?.filename);
        } catch (error) {
            console.error(`Could not remove listing image for deleted account ${userId}:`, error);
            imageCleanupFailures.push(error);
        }
    }

    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Your account and associated listings and reviews were deleted.");
        if (imageCleanupFailures.length > 0) {
            req.flash("error", "Some listing images could not be removed from storage.");
        }
        res.redirect("/listings");
    });
};
