const express = require("express");
const router = express.Router();
const {register,login,auth, GetAllCategory} = require("../Controller/User");

router.route("/register").post(register);
router.route("/auth").post(auth);
router.route("/login").post(login);
router.route("/get-all-category").get(GetAllCategory);


module.exports = router;
