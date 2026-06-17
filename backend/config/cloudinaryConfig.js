const cloudinary = require("cloudinary");
const { env } = require("./env");

cloudinary.config({
  cloud_name: env.CLOUD_NAME,
  api_key: env.API_KEY,
  api_secret: env.API_SECRET_KEY,
});

module.exports = {
  uploads: (file) => {
    return new Promise((resolve) => {
      cloudinary.uploader.upload(
        file,
        (result) => {
          resolve({ url: result.url, id: result.public_id });
        },
        { resource_type: "auto" },
      );
    });
  },
};
