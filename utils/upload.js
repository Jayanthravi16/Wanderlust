const crypto = require("crypto");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
const ExpressError = require("./ExpressError.js");

const imageExtensions = {
  "image/avif": ".avif",
  "image/gif": ".gif",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const allowedImageTypes = new Set(Object.keys(imageExtensions));
const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "listing-images";
let supabase;

function getSupabaseClient() {
  const { SUPABASE_URL } = process.env;
  const serverKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serverKey) {
    throw new ExpressError(
      503,
      "Image storage is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY.",
    );
  }

  if (!supabase) {
    supabase = createClient(SUPABASE_URL, serverKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return supabase;
}

const upload = multer({
  storage: multer.memoryStorage(),
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

module.exports.setListingImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const filename = `listings/${crypto.randomUUID()}${imageExtensions[req.file.mimetype]}`;
  try {
    const client = getSupabaseClient();
    const { error } = await client.storage
      .from(bucketName)
      .upload(filename, req.file.buffer, {
        cacheControl: "3600",
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error("Supabase listing image upload failed:", error.message);
      return next(new ExpressError(502, "Could not upload the listing image to Supabase Storage."));
    }

    const { data } = client.storage.from(bucketName).getPublicUrl(filename);
    req.body.listing ||= {};
    req.body.listing.image = { filename, url: data.publicUrl };
    next();
  } catch (error) {
    next(error);
  }
};

module.exports.deleteListingImage = async (filename) => {
  if (typeof filename !== "string" || !filename.startsWith("listings/")) {
    return;
  }

  const { error } = await getSupabaseClient().storage
    .from(bucketName)
    .remove([filename]);
  if (error) {
    console.error("Supabase listing image deletion failed:", error.message);
    throw new ExpressError(502, "Could not remove the listing image from Supabase Storage.");
  }
};
