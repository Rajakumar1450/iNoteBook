const router = require("express").Router();
const imageController = require("../controllers/imageUploadController"),
  upload = require("../config/multerConfig");
const fetchuser = require("../middleware/fetchuser");
router.post(
  "/postImage",
  fetchuser,
  upload.imageUpload.any(),
  imageController.createImage,
);

module.exports = router;
