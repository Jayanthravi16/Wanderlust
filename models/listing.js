const mongoose = require("mongoose");
const Schema = mongoose.Schema; // Capitalized 'Schema' is the standard convention

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        filename: String,
        url: {
            type: String,
            default: "https://unsplash.com/photos/glass-greenhouses-in-berkeley-sC_NIo8uH00",
            set: (v) => v === "" ? "https://unsplash.com/photos/glass-greenhouses-in-berkeley-sC_NIo8uH00" : v,
        }
    },
    price: Number,
    location: String,
    country: String
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;