const cron = require("node-cron");
const db = require("../config/db");
const initCronJobs = () => {
  // Schedule: Run every minute (* * * * *)
  cron.schedule("* * * * *", async () => {
    try {
      // SQL: Delete rows where the expiration time is older than the current time
      // We use MySQL's native NOW() function for accuracy
      const [result] = await db.execute(
        "DELETE FROM otp_verification WHERE expires_in < NOW()",
      );

      // Only log if something was actually deleted to keep console clean
      if (result.affectedRows > 0) {
        console.log(` Cleanup: Deleted ${result.affectedRows} expired OTPs.`);
      }
    } catch (error) {
      console.error(" Error in Cron Job (OTP Cleanup):", error.message);
    }
  });

  console.log(" Cron Jobs Initialized: OTP Cleanup active.");
};

module.exports = initCronJobs;
