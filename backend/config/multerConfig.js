const multer = require("multer");
const path = require("path");

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, path.join(__dirname, "../files"));
    } else {
      cb({ message: "This file is not an image file" }, false);
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

module.exports = {
  imageUpload: multer({ storage: imageStorage }),
};
