const express = require("express");
const app = express();
const mongoose = require("mongoose");
// const ejs = require("ejs");
const port = 8080;
const Listing = require("./models/listing.js");
const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("Connected to DB");
}).catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(MONGO_URL);
}

app.get("/", (req, res)=>{
    res.send("I am groot");
});

// app.get("/testListing", async (req, res)=>{
//     let sampleListing = new Listing({
//         title : "My New Villa",
//         description : "By the beach",
//         price : 1200,
//         location : "Calangute, Goa",
//         contry : "India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });

// INDEX ROUTE
app.get("/listings", async (req, res)=>{
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
});

app.listen(port, ()=>{
    console.log(`Server is listening to port : ${port}`);
});