// project 1 to same the image in database in form of link 



const express = require("express");
const multer = require("multer");
// const uploadFile = require("./services/storage.service")
// const postModel = require("./Models/post.model")

const app = express();

app.use(express.json());

const upload = multer({
    storage: multer.memoryStorage()
});

app.post("/create-post", upload.single("image"), async (req, res) => {
    console.log(req.body);
    console.log(req.file);


        const result = await uploadFile(req.file.buffer)
    console.log(result);

    // const pst = await postModel.create({
    //     image: result.url,
    //     caption: req.body.caption
    // })

    res.status(201).json({
        message: "Post created successfully",
        data: req.body

    });
});

module.exports = app;
