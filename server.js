require("dotenv").config({ path: "./src/.env" });

const app = require("./src/app");
const connectDB = require("./src/db/db");

async function startServer() {
  try {
    await connectDB();
    app.listen(process.env.PORT || 3000, () => {
      console.log("Server is running on port 3000");
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
  }
}

startServer();
