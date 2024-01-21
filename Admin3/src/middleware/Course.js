const jwt = require("jsonwebtoken");
const adminModel = require("../../../Model/Admin");
const instructorModel = require("../../../Model/Instructor");

const courserequireAuth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    console.log(authorization);
    if (!authorization) {
      return res.status(401).json({ error: "Authorization token required" });
    }

    const token = authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    try {
      const admindecodedToken = jwt.verify(token, process.env.ADMINJWTSECRET);
      const adminId = admindecodedToken.userId;

      if (adminId) {
        const admin = await adminModel.findById(adminId);
        req.admin = admin;
        next();
        return;
      }
    } catch (adminError) {
      // Token is not for admin, try decoding as instructor token
    }

    try {
      const instructordecodedToken = jwt.verify(
        token,
        process.env.INSTRUCTORJWTSECRET
      );
      const instructorId = instructordecodedToken.userId;

      if (instructorId) {
        const instructor = await instructorModel.findById(instructorId);
        req.instructor = instructor;
        next();
        return;
      }
    } catch (instructorError) {
      // Token is not for instructor
    }

    return res.status(401).json({ error: "Request is not authorized" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token has expired" });
    }

    res.status(401).json({ error: "Request is not authorized" });
  }
};

module.exports = courserequireAuth;
