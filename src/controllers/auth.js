const router = require("express").Router();
const jwt = require("jsonwebtoken");
const connection = require("../server/server");
const bcrypt = require("bcryptjs");

//Logged in user
router.post("/api/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  //Verifying if there is a username and password on req body
  if (username && password) {
    //checking if username exists, and then if password is correct
    connection.query(
      "Select * from user where username = " + `"${username}"`,
      async (error, result) => {
        if (result.length > 0) {
          const validPassword = await bcrypt.compare(
            password,
            result[0].password
          );
          if (validPassword) {
            const token = jwt.sign(
              { id: result[0].userID },
              process.env.TOKEN_SECRET,
              {
                expiresIn: 432000,
              }
            );
            const user = {
              userID: result[0].userID,
              username: result[0].username,
              info: JSON.parse(result[0].info),
              roles: result[0].roles,
              createdAt: result[0].createdAt,
              modifiedAt: result[0].modifiedAt,
            };
            return res
              .status(200)
              .header("authToken", token)
              .json({ token: token, loggedUser: user });
          } else {
            res.status(403).json({ error: "Invalid password" });
          }
        } else {
          res.status(403).json({ error: "Invalid User" });
        }
      }
    );
  } else {
    res.status(400).json({ error: "There are missing fields in Userform" });
  }
});

module.exports = router;
