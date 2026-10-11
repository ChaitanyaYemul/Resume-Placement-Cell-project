require("dotenv").config();
const app = require("./app");
const connectMongo = require("./config/mongodb");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectMongo();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Startup failed:", err.message);
    process.exit(1);
  }
})();