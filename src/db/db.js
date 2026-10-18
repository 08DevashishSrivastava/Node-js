const mongoose = require("mongoose");


async function connectDB() {

    // this method is used to connect with the server

await mongoose.connect("mongodb+srv://%3Cdb_username%3E:0UbLfqaPVa9OYTlS@devashish.evsmsaw.mongodb.net/DEV")

console.log("Connected to DB")

}

