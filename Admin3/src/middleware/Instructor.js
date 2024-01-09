const jwt = require("jsonwebtoken");
const instructorModel = require("../../../Model/Instructor");

const instructorrequireAuth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({ error: "Authorization token required" });
    }

    const token = authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    const decodedToken = jwt.verify(token, process.env.INSTRUCTORJWTSECRET);
    const instructorId = decodedToken.userId;

    const instructor= await instructorModel.findById(instructorId);

    if (!instructor) {
      return res.status(401).json({ error: "Request is not authorized" });
    }
    res.locals.instructor = instructor;

    req.instructor = instructor;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token has expired" });
    }

    res.status(401).json({ error: "Request is not authorized" });
  }
};

module.exports = instructorrequireAuth;
