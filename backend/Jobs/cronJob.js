const cron = require("node-cron");
const db = require("../config/db");
const deleteOtp = async () => {
  await db.execute(
    `DELETE FROM otp_verification WHERE expires_in < ${new Date(Date.now())}`,
  );
};
cron.schedule("* * * * *", () => {
  deleteOtp();
  console.log("running a task every minute");
});
