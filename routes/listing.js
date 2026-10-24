const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { listingSchema} = require("../schema.js");
const {isLoggedIn} = require('../middleware.js');

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

// Index Route -> All Listings
router.get("/", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("./listings/index.ejs", { allListings });
}));

// New Route
router.get("/new", isLoggedIn, (req, res) => {
  res.render("./listings/new.ejs");
});

// Create Route
router.post(
  "/", isLoggedIn, 
  validateListing, 
  wrapAsync(async (req, res) => {
    // let {title, description, image, price, country, location} = req.body;
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    console.log(`New listing created: ${newListing._id}`);
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
  }),
);

// Edit Route
router.get(
  "/:id/edit", isLoggedIn, 
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs", { listing });
  }),
);

// Update Route
router.put(
  "/:id", isLoggedIn, 
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    if (!req.body.listing) {
      throw new ExpressError(400, "Send Valid Data for Listing");
    }
    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      { ...req.body.listing },
      { new: true },
    );
    if (updatedListing) {
      req.flash("success", "Listing Successfully Updated ");
      console.log(`Listing updated: ${updatedListing._id}`);
    } else {
      console.warn(`Listing update failed; no listing found for ID: ${id}`);
    }
    res.redirect(`/listings/${id}`);
  }),
);

// Show Route
router.get("/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    res.redirect("/listings");
  }
  res.render("./listings/show.ejs", { listing });
}));

// Delete Listing Route
router.delete("/:id", isLoggedIn, wrapAsync(async (req, res) => {
  let { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  if (deletedListing) {
    await Review.deleteMany({ _id: { $in: deletedListing.reviews } });
    req.flash("success", "Listing Deleted");
    console.log(`Listing deleted: ${deletedListing._id}`);
  } else {
    console.warn(`Listing delete failed; no listing found for ID: ${id}`);
  }
  res.redirect("/listings");
}));

module.exports = router;