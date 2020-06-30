const router = require("express").Router();
const { v4: uuidv4 } = require("uuid");
const connection = require("../server/server");
const bcrypt = require("bcryptjs");
const verifyToken = require("../utility/verifyToken");

//Get list of users
router.get("/api/users", verifyToken, (req, res) => {
  const sqlQuery = "Select userID, username, info, roles from user";
  connection.query(sqlQuery, (error, result) => {
    if (error) {
      return res.status(400).send({ error: error });
    } else {
      let userModified = result.map((user) => {
        let temp = JSON.parse(user.info);
        user.info = temp;
        return user;
      });
      res.status(200).send({ response: userModified });
    }
  });
});

//get a single user
router.get("/api/users/:id", verifyToken, (req, res) => {
  const userID = req.params.id;
  connection.query(
    "Select userID, username, info, roles from user where userID = " +
      `"${userID}"`,
    (error, result) => {
      if (result.length === 0) {
        res.status(400).send({ message: "There is no user with this id" });
      } else {
        let userModified = result.map((user) => {
          let temp = JSON.parse(user.info);
          user.info = temp;
          return user;
        });
        res.status(200).send({ user: userModified });
      }
    }
  );
});

//Add a user in database
router.post("/api/users/add", verifyToken, async (req, res) => {
  const sqlQuery =
    "Insert into user(userID, username, password, info, roles) values";
  const username = req.body.username;
  const password = req.body.password;
  const info = JSON.stringify(req.body.info);
  const roles = req.body.roles;
  const userID = uuidv4();

  //Validate if there is username and password and if there's already a user created with that username
  if (username && password) {
    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    connection.query(
      "Select userID, username from user where username = " + `"${username}"`,
      (error, result) => {
        result.length === 0
          ? connection.query(
              sqlQuery +
                `("${userID}","${username}", "${hashedPassword}", '${info}', "${roles}")`,
              (error, result) => {
                error
                  ? res.status(400).json({ error: error })
                  : res.status(200).json({ response: "New user add!" });
              }
            )
          : res
              .status(400)
              .json({ error: "User already exists with this username" });
      }
    );
  } else {
    res.status(400).json({ error: "There are missing fields in new User" });
  }
});

//Delete a user
router.delete("/api/users/delete/:id", verifyToken, (req, res) => {
  const sqlQuery = "Delete from user where userID=";
  const userID = req.body.userID;

  if (userID) {
    connection.query(sqlQuery + `"${userID}"`, (error, result) => {
      error
        ? res.status(400).json({ error: error })
        : result.affectedRows === 0
        ? res.status(400).json({ error: "There is no user with this ID" })
        : res.status(200).json({ response: "User deleted!" });
    });
  } else {
    res.status(400).json({ error: "Missing userID in the request" });
  }
});

//Update fields of a User
router.put("/api/users/update/:id", verifyToken, (req, res) => {
  const userID = req.params.id;
  const username = req.body.username;
  const password = req.body.password;
  const info = JSON.stringify(req.body.info);
  const roles = req.body.roles;
  const verifyUserExist =
    "Select username from User where userID = " + `"${userID}"`;
  connection.query(verifyUserExist, async (error, result) => {
    if (result.length === 0) {
      return res
        .status(400)
        .json({ message: "There is no user with this ID in the database" });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const sqlQuery =
        "Update user set username = " +
        `"${username}"` +
        ", password = " +
        `"${hashedPassword}"` +
        ", info = " +
        `'${info}'` +
        ", roles = " +
        `"${roles}"` +
        " where userID = " +
        `"${userID}"`;
      connection.query(sqlQuery, (error, result) => {
        if (error) {
          return res.status(400).json({ error: error });
        } else {
          return res.status(200).json({ message: "User updated" });
        }
      });
    }
  });
});

module.exports = router;
