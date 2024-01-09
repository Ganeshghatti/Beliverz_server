const express = require("express");
const router = express.Router();
const {register,login,auth, GetAllCategory} = require("../Controller/User");

router.route("/user/register").post(register);
router.route("/user/auth").post(auth);
router.route("/user/login").post(login);
router.route("/user/get-all-category").get(GetAllCategory);

module.exports = router;
