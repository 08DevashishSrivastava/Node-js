const mongoose = require("mongoose");
const app = require("./src/app");

const noteSchema = new mongoose.Schema({
    title: String,
    description: String,
})


const postModel = mongoose.model("post", noteSchema)

module.exports = app