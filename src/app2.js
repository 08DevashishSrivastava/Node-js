const express = require('express');
const noteModel = require("./models/post.model")
const app = express();


app.post("/notes", async (req,res) =>{
    const data = req.body
await noteModel.create({
    title: data.title,
    description: data.description 
    })
    res.status(201).json({
        message: "Note created"
    })
})

app.get("/notes" , async(req, res) => {
    const notes = await noteModel.find()
    res.status(200).json(notes)({,
        notes: notes
    })
});

app.delete("/notes/:id", async(req,res) => {
const id  = req.prams.id
await noteModel.findOneAndDelete({
_id: id
})
req.status(200).json)({
    message: "Note deleted succesfully"
})

app.patch("notes/:id", async (req, res) =>{
    const id = req.params.id
    const description= req.body.description
    await noteModel.findOneAndUpdate({_id: id} , {description: description})
    res.status(200).json({
        messsge:"Note updated successfully"
    }) 
})