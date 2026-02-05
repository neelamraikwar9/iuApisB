const express = require('express'); 
const { initializeDatabase } = require("./db.connect"); 
const multer = require("multer"); 
const cloudinary = require("cloudinary"); 
const dotenv = require("dotenv"); 
const bodyParser = require("body-parser"); 
const cors = require("cors"); 
const { ImageModel } = require("./models/images"); 

dotenv.config(); 

const app = express(); 
app.use(cors()); 
app.use(bodyParser.json()); 

initializeDatabase(); 

// doing cloudinary config;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
}); 
// this is cludinary config this is needed to connect to our cloudinary.

//multer setup; 

const storage = multer.diskStorage({}) // thi is a configuration for multer. inside this diskStorage we can provide some other configurations. but here we are keeping it empty. because we don't want our image file to be saved in local disk.
//if i provide some configurations inside this if I give destination file path, how it should be saved and where it should be saved. we will be able to see images here in these file only when we will be uploading from the frontend. 

// we don't want it to take diskstorage becuase we have to store it in mongodb that's why keeping this empty.

const upload = multer({ storage }); 

//this multer is a middlewhere that helps in file uploads in node.js applications.

// api endpoint
app.post("/upload", upload.single("image"), async(req, res) => { // upload.single image is acting as a middlewhere.

    try {
        const file = req.file; 
        if(!file) return res.status(400).send("No file uploaded")

        //uplad to cloudinary 
        const result = await cloudinary.uploader.upload(file.path, {folder: "uploades"}) // all these fun. is provided by cloudinary.   this will upload our image to cloudinary.

        //after its uploads we will get a clodinary link and we have to save this to our mongoDB.

        //to save the img link to mongoDB 

        const newImage = new ImageModel({imageUrl: result.secure_url}); //secure_url is a url which is provided by cloudinary.

        await newImage.save(); 

        res.status(200).json({
            message: "Image uploaded successfully.",
            imageUrl: result.secure_url,
        })
    } catch (error) {
        res.status(500).json({message: "Image upload failed", error: "error"}); 
        
    }

})


//setting up the server; 

const PORT = 4000; 

app.listen(PORT, () => {
    console.log(`Server is running on the port ${PORT}`); 
}); 




