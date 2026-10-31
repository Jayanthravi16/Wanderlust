require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = process.env.PORT || 8080;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user.js");
const listingCategories = require("./utils/listingCategories.js");
const { normalizeSearchTerm } = require("./utils/listingSearch.js");


const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate); // <-- 2. Set ejs-mate as the engine
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const dbUrl = process.env.MONGODB_URL?.trim();
const sessionSecret = process.env.SECRET;

if (!dbUrl || !/^mongodb(?:\+srv)?:\/\//i.test(dbUrl)) {
  throw new Error("MONGODB_URL must be set to a valid mongodb:// or mongodb+srv:// connection string");
}
if (!sessionSecret) {
  throw new Error("SECRET is not configured");
}

async function main() {
  await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
  mongoUrl: dbUrl,
  // mongoOptions: advancedOptions,
  crypto : {
    secret : sessionSecret,
  },
  touchAfter : 24*60*60,
});

store.on("error", (err) => {
  console.error("ERROR in MONGO SESSION STORE :", err);
});

const sessionOptions = {
  store,
  secret : sessionSecret,
  resave : false,
  saveUninitialized : true,
  cookie: {
    expires : Date.now() + 7 *24 *60*60*1000, // 7 days time in milliseconds
    maxAge : 7*24*60*60*1000,
    httpOnly : true,
  },
};

// app.get("/", (req, res) => {
//   res.send("I am groot");
// });

// Keep in mind that the routes will always come after flash. else the flash won't work.
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  res.locals.currentPath = req.path;
  res.locals.searchTerm = normalizeSearchTerm(req.query.q);
  res.locals.selectedCategory = listingCategories.some(({ value }) => value === req.query.category)
    ? req.query.category
    : "all";
  next();
});

// app.get("/demouser", async (req, res)=>{
//   let registeredUser = await User.findOne({ username: "delta-student" });
//   if (!registeredUser) {
//     let fakeUser = new User({
//       email : "student@gmail.com",
//       username : "delta-student"
//     });
//     registeredUser = await User.register(fakeUser, "helloworld");
//   }
//   res.send(registeredUser);
// });

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  const { statusCode = 500, message = "Internal Server Error" } = err;
  res.status(statusCode).render("error.ejs", { statusCode, message });
});

main()
  .then(() => {
    console.log("Connected to DB");
    app.listen(port, () => {
      console.log(`Server is listening to port : ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
