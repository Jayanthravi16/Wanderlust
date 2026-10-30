const Listing = require('../models/listing');
const Review = require('../models/review.js');
const ExpressError = require('../utils/ExpressError.js');
const listingCategories = require('../utils/listingCategories.js');
const { buildListingSearchQuery } = require('../utils/listingSearch.js');
const { deleteListingImage } = require('../utils/upload.js');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});

module.exports.index = async (req, res) => {
  const selectedCategory = listingCategories.some(({ value }) => value === req.query.category)
    ? req.query.category
    : "all";
  const { query, searchTerm } = buildListingSearchQuery(req.query.q, selectedCategory);
  const allListings = await Listing.find(query);
  res.render("./listings/index.ejs", { allListings, listingCategories, selectedCategory, searchTerm });
};

module.exports.renderNewForm = (req, res) => {
  res.render("./listings/new.ejs", { listingCategories });
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
  .populate({
    path: "reviews",
    populate: { path: "author", select: "username" },
  })
  .populate("owner", "username");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    return res.redirect("/listings");
  }
  res.render("./listings/show.ejs", { listing, mapToken: process.env.MAP_TOKEN });
};

module.exports.createListing = async (req, res) => {
    // let {title, description, image, price, country, location} = req.body;
    let response = await geocodingClient.forwardGeocode({
      query: req.body.listing.location,
      limit: 1
    })
      .send()

    const newListing = new Listing({
      ...req.body.listing,
      owner: req.user._id,
    }); 
    newListing.geometry = response.body.features[0].geometry;
    let savedListing = await newListing.save();
    console.log(`New listing created: ${newListing._id}`);
    console.log(savedListing);
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs", { listing, listingCategories });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    if (!req.body.listing) {
      throw new ExpressError(400, "Send Valid Data for Listing");
    }
    const listing = await Listing.findOne({ _id: id, owner: req.user._id });
    const updatedListing = await Listing.findOneAndUpdate(
      { _id: id, owner: req.user._id },
      { ...req.body.listing },
      { new: true },
    );
    if (updatedListing) {
      if (req.file && listing?.image?.filename) {
        await deleteListingImage(listing.image.filename);
      }
      req.flash("success", "Listing Successfully Updated ");
      console.log(`Listing updated: ${updatedListing._id}`);
    } else {
      console.warn(`Listing update failed; no listing found for ID: ${id}`);
    }
    res.redirect(`/listings/${id}`);
  };


module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  const deletedListing = await Listing.findOneAndDelete({ _id: id, owner: req.user._id });
  if (deletedListing) {
    await Review.deleteMany({ _id: { $in: deletedListing.reviews } });
    await deleteListingImage(deletedListing.image?.filename);
    req.flash("success", "Listing Deleted");
    console.log(`Listing deleted: ${deletedListing._id}`);
  } else {
    console.warn(`Listing delete failed; no listing found for ID: ${id}`);
  }
  res.redirect("/listings");
};