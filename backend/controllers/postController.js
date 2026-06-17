const { success } = require("zod");
const cloud = require("../config/cloudinaryConfig");
const db = require("../config/db");
module.exports = {
  createPost: async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          message: "No file is uploaded",
        });
      }
      const userId = req.user.id;
      const { caption } = req.body;
      const postSql = "INSERT INTO posts (user_id ,caption) VALUES (?,?)";
      // 1. FIXED: Extract the result correctly
      // db.execute returns [result, fields] so the variable post
      const [postResult] = await db.execute(postSql, [userId, caption || null]);
      const newPostId = postResult.insertId;
      // upload all files to cloudinary one by one since there can be multiple files video or image both so we have to handle all of them (ye bas sytax hai we are just accesing all the files one by one uploading that on cloudinary and then putting the info in our post media table that's it )
      const uploadPromise = req.files.map(async (file, index) => {
        const tempFilePath = file.path;
        const isImage = file.mimetype.startsWith("image/");
        const mediaType = isImage ? "image" : "video";
        const cloudResult = await cloud.uploads(tempFilePath);
        return {
          postId: newPostId,
          mediaUrl: cloudResult.url,
          mediaId: cloudResult.id,
          mediaType,
          mediaOrder: index + 1,
        };
      });
      const uploadedMediaItems = await Promise.all(uploadPromise);
      const insertSql =
        "INSERT INTO post_media (post_id , media_url , media_id , media_type , media_order) VALUES (?,?,?,?,?)";

      for (const item of uploadedMediaItems) {
        await db.execute(insertSql, [
          item.postId,
          item.mediaUrl,
          item.mediaId,
          item.mediaType,
          item.mediaOrder,
        ]);
      }
      res.status(200).json({
        success: true,
        data: {
          postId: newPostId,
          message: "Your post is uploaded successfully ",
          items: uploadedMediaItems,
          postCount: uploadedMediaItems.length,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: `internal server error while posting : ${error.message}`,
      });
    }
  },
};
