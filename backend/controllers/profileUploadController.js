const db = require("../config/db");
const cloud = require("../config/cloudinaryConfig");
const { success } = require("zod");

module.exports = {
  createImage: async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({ message: "sorry there was no file uploaded..." });
      }
      const imageName = req.files[0].originalname;
      const tempImageUrl = req.files[0].path; //this is only the the path of the image
      const checksql = "select * from users where image_name = ?";
      const [existingImage] = await db.execute(checksql, [imageName]);
      if (existingImage.length > 0) {
        return res.status(400).json({
          success: false,
          message: `sorry this file name ${imageName} is already existing`,
        });
      }
      const result = await cloud.uploads(tempImageUrl);
      const imageId = result.id;
      const imageUrl = result.url; //this is the actual url that is going to store in the database
      const userId = req.user.id; //pulled from fetchuser our middleware

      const insertSql =
        "UPDATE users SET image_id = ? , image_name =? , avatar_url = ? WHERE id=? ";
      const [insertResult] = await db.execute(insertSql, [
        imageId,
        imageName,
        imageUrl,
        userId,
      ]);

      return res.status(200).json({
        success: true,
        data: {
          id: insertResult.insertId,
          imageName,
          imageUrl,
          imageId,
          userId,
        },
      });
    } catch (error) {
      // Handles any database execution issues or Cloudinary network drops cleanly
      console.error("Error in createImage operation:", error);
      return res.status(500).json({
        success: false,
        message: `An unexpected error occurred: ${error.message}`,
      });
    }
  },
};
