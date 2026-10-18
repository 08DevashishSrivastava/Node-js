require("dotenv").config();

const app = require("./app3");
const connectDB = require("./src/db/db");

connectDB()
    .then(() => {
        app.listen(3000, () => {
            console.log("Server is running on port 3000");
        });
    })
    .catch((error) => {
        console.error("Database connection failed:", error.message);
    });