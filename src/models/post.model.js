
const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
    title: String,
    description: String,
});

const postModel = mongoose.model("post", noteSchema);

module.exports = postModel;
