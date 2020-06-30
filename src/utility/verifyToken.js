const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const bearerToken = req.header("Authorization");
  if (!bearerToken) return res.status(401).send("Access Denied");
  let token = bearerToken.replace("Bearer ", "");

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).send("Invalid Token");
  }
};
