require("dotenv").config();//dotenv m jo b variables create karte h access karne ke liye ye line likhni pdti h 
const app = require("./src/app");
const connectToDB = require("./src/config/database");
const authController = require("./src/controllers/auth.controller");
 

connectToDB();

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});