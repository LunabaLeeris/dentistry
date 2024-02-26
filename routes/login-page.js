const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

router.get("/", (req, res) => {
    res.render("login-page");
});

router.post("/login", authController.login);  

module.exports = router;