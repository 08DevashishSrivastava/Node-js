const express  = require('express')
const app = express()

app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.get("/about" , (req,res) =>{
    res.send("This is the about page")
})

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})


// const express= require('express')
// const  app = express()
// app.get('/', (req,res) =>{
//     res.send('dvashish!')
// })
// app.get('/About' , (req,res) =>{
//     res.send=\("thois is about the page")
// })

// app.listen(3000,() >={
//     console.log('server is running at the port 3000')
// })



// Rest api 
// get method - when we have to fetch the data form the server
// post - when we have to send the data to the server
// patch - when we have to update the data which is present in the server
// delete - when we have to delete the data which is present in the server
