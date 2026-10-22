const mongoose = require("mongoose");

function connectToDB() {
    mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to db")
    })
    .catch((err) => {
        console.log("Error connecting to db", err)
    })
}


module.exports = connectToDB;