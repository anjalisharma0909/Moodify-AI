const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware")

const router = express.Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);

router.get("/get-me", authMiddleware.authUser, authController.getMe)// jo b user yha request karra hoga usi ka data hum yha pe send krre honge

router.get("/logout", authController.logoutUser)

module.exports = router;