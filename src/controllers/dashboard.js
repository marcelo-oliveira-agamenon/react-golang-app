const router = require("express").Router();
const connection = require("../server/server");
const verifyToken = require("../utility/verifyToken");

//get data from the database from savings
router.get("/api/dashboard", verifyToken, (req, res) => {
  const sqlQuery = "Select * from savings";
  connection.query(sqlQuery, (error, result) => {
    if (error) {
      return res.status(400).send({ message: error });
    } else if (result.length === 0) {
      return res.status(404).send({ message: "There is no savings" });
    } else {
      return res.status(200).send({ savings: result });
    }
  });
});

module.exports = router;
