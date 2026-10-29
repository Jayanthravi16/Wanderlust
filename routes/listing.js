const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const { isLoggedIn, isListingOwner } = require("../middleware.js");

const { uploadListingImage, setListingImage } = require("../utils/upload.js");

const listingController = require("../controllers/listings.js");

// Server Side Validation Function for DB insertion/updation of Listings
const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

router.route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    uploadListingImage,
    (req, res, next) => {
      if (!req.file) {
        return next(new ExpressError(400, "Please upload a listing image"));
      }
      next();
    },
    setListingImage,
    validateListing,
    wrapAsync(listingController.createListing),
  );

router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id/edit")
  .get(
    isLoggedIn,
    isListingOwner,
    wrapAsync(listingController.renderEditForm),
  );

router.route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isListingOwner,
    uploadListingImage,
    setListingImage,
    validateListing,
    wrapAsync(listingController.updateListing),
  )
  .delete(
    isLoggedIn,
    isListingOwner,
    wrapAsync(listingController.destroyListing),
  );

module.exports = router;
