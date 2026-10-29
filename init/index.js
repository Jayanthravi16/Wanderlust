const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main(){
    await mongoose.connect(MONGO_URL);
    const owner = await User.findOne({ username: "student3" });
    if (!owner) {
        throw new Error('Cannot seed listings: user "student3" was not found');
    }
    await Listing.deleteMany({});
    const listings = initData.data.map((obj) => ({ ...obj, owner: owner._id }));
    await Listing.insertMany(listings);
    console.log("Data was initialized");
}

main()
    .catch((err) => {
        console.error(err);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());