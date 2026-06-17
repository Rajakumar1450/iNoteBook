const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "video/mp4"
    ) {
      cb(null, path.join(__dirname, "../files"));
    } else {
      cb({ message: "This file is not valid" }, false);
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

module.exports = {
  Upload: multer({ storage }),
};
