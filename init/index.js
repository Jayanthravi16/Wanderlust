const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const MONGO_URL = process.env.MONGODB_URL;
const mapToken = process.env.MAP_TOKEN;

if (!MONGO_URL) {
    throw new Error("Cannot seed listings: MONGODB_URL is not configured");
}

if (!mapToken) {
    throw new Error("Cannot seed listings: MAP_TOKEN is not configured");
}

const geocodingClient = mbxGeocoding({ accessToken: mapToken });

async function main(){
    await mongoose.connect(MONGO_URL);
    const owner = await User.findOne({ username: "student3" });
    if (!owner) {
        throw new Error('Cannot seed listings: user "student3" was not found');
    }

    const listings = [];
    for (const listing of initData.data) {
        const response = await geocodingClient.forwardGeocode({
            query: `${listing.location}, ${listing.country}`,
            limit: 1,
        }).send();
        const geometry = response.body.features[0]?.geometry;
        if (!geometry) {
            throw new Error(`Cannot seed listing "${listing.title}": location could not be geocoded`);
        }

        const preparedListing = { ...listing, owner: owner._id, geometry };
        await new Listing(preparedListing).validate();
        listings.push(preparedListing);
    }

    await Listing.deleteMany({});
    await Listing.insertMany(listings);
    console.log(`Initialized ${listings.length} listings`);
}

main()
    .catch((err) => {
        console.error(err);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());