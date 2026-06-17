const router = require("express").Router();
const imageController = require("../controllers/profileUploadController"),
  upload = require("../config/multerConfig");
const fetchuser = require("../middleware/fetchuser");
const postController = require("../controllers/postController");
const { getFeed } = require("../controllers/getPostsController");
router.post(
  "/profileUpload",
  fetchuser,
  upload.Upload.any(),
  imageController.createImage,
);
router.post(
  "/posts",
  fetchuser,
  upload.Upload.any(),
  postController.createPost,
);
router.get("/getposts", fetchuser, getFeed);

module.exports = router;
