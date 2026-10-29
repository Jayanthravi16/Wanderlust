const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");

module.exports.isLoggedIn = (req, res, next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.method === "GET"
            ? req.originalUrl
            : req.params.id
                ? `/listings/${req.params.id}`
                : "/listings";
        req.flash("error", "You must be logged in to do that");
        return res.redirect("/login");
  }
  next();
}

module.exports.isListingOwner = async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        return next(new ExpressError(404, "Listing you requested for does not exist"));
    }
    if (String(listing.owner) !== String(req.user._id)) {
        return next(new ExpressError(403, "You do not have permission to modify this listing"));
    }
    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const [listing, review] = await Promise.all([
        Listing.exists({ _id: id, reviews: reviewId }),
        Review.findById(reviewId),
    ]);
    if (!listing || !review) {
        return next(new ExpressError(404, "Listing or review not found"));
    }
    if (String(review.author) !== String(req.user._id)) {
        return next(new ExpressError(403, "You do not have permission to delete this review"));
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};