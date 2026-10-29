const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const ExpressError = require("./ExpressError.js");

const uploadsDirectory = path.join(__dirname, "..", "uploads");
const imageExtensions = {
  "image/avif": ".avif",
  "image/gif": ".gif",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

fs.mkdirSync(uploadsDirectory, { recursive: true });

const allowedImageTypes = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDirectory,
    filename: (req, file, callback) => {
      callback(null, `${crypto.randomUUID()}${imageExtensions[file.mimetype]}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!allowedImageTypes.has(file.mimetype)) {
      return callback(new ExpressError(400, "Upload a JPEG, PNG, GIF, WebP, or AVIF image"));
    }
    callback(null, true);
  },
});

module.exports.uploadListingImage = (req, res, next) => {
  upload.single("listing[image]")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      const message = error.code === "LIMIT_FILE_SIZE"
        ? "Images must be 5 MB or smaller."
        : "Upload only one listing image.";
      return next(new ExpressError(400, message));
    }
    if (error) {
      return next(error);
    }
    next();
  });
};

module.exports.setListingImage = (req, res, next) => {
  if (req.file) {
    req.body.listing ||= {};
    req.body.listing.image = {
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`,
    };
  }
  next();
};
