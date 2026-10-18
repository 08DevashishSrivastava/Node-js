// const express = require('express')

// const app = express()



// const notes = []


// // crete the api key post which help to send the data from frontend to server
// // API Name - POST , (/notes)
// app.post('/notes',(req,res) => {
//     console.log(req.body)
// })
// // to create the note we need title and description

// //  export server.js folder
// module.exports = app;


const express = require('express');
const nodeModel = require("./models/post.model")
const app = express();

// Middleware to read JSON
app.use(express.json());

const notes = [];

// Create the POST API (/notes)
app.post('/notes', (req, res) => {
    // notes.push(req.body);
    console.log(req.body);
    res.send('Note received');
});


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


// GET API - /notes

app.get('/notes',(req,res) => {
    res.status(200).json({
message: "notes fetched succesfuly",
        notes: notes
    })
})




// DELETE API  /nodes/:index
app.delete('/notes/:index',(req,res) => {
// main line
const index = req.params.index
delete notes[ index ]
res.status(200).json({
    message: "notes deleted succesfully"
})
})


// PATCH API - /node/:index

app.patch("/notes/:index", (req, res) => {
    const index = req.params.index;
    const description = req.body.description;

    notes[index].description = description;

    res.status(200).json({
        message: "notes updated successfully"
    });
});


// Export app
module.exports = app;



// 0UbLfqaPVa9OYTlS