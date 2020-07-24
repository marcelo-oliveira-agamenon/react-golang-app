const router = require("express").Router();
const connection = require("../server/server");
const verifyToken = require("../utility/verifyToken");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");

//get a list of expenses per user
router.get("/api/expenses/:id", verifyToken, (req, res) => {
  const userID = req.params.id;
  const sqlQuery = "Select * from expenses where expense_userID = ";
  connection.query(sqlQuery + `"${userID}"`, (error, result) => {
    if (error) {
      return res.status(400).send({ message: error });
    } else if (result.length === 0) {
      return res
        .status(404)
        .send({ message: "There is no expense for this user" });
    } else {
      return res.status(200).send({ expenses: result });
    }
  });
});

//get a expense per user
router.get("/api/expenses/:id/user/:userid", verifyToken, (req, res) => {
  const { userid, id } = req.params;
  if (!userid && !id)
    return res.status(400).send({ error: "Missing fields in params" });
  connection.query(
    "Select * from expenses where expense_userID = " +
      `"${userid}"` +
      " and expenseID = " +
      `"${id}"`,
    (error, result) => {
      if (error) return res.status(400).send({ message: error });
      return res.status(200).send({ expense: result[0] });
    }
  );
});

//add new expense based with userID
router.post("/api/expenses/add", verifyToken, (req, res) => {
  const { userID } = req.body;
  const { type, value, date, description } = req.body;

  if (userID && type && value && date && description) {
    const modifiedDate = moment(date).format("YYYY-MM-DD");
    const expenseID = uuidv4();
    const sqlQuery =
      "Insert into expenses(expenseID, expense_userID, expense_type, expense_date, expense_value,expense_description) values";
    connection.query(
      sqlQuery +
        `("${expenseID}", "${userID}", "${type}", "${modifiedDate}", ${value}, "${description}")`,
      (error, result) => {
        if (error) {
          return res.status(400).send({ error: error });
        } else if (result.affectedRows === 0) {
          return res
            .status(404)
            .send({ message: "Expense not added in the database" });
        } else {
          return res.status(200).send({ message: "Expense added sucessfully" });
        }
      }
    );
  } else {
    return res
      .status(400)
      .send(
        JSON.stringify({ message: "There are missing fields in new Expense" })
      );
  }
});

//Delete a expense per user
router.delete("/api/expenses/delete/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const sqlQuery = "Delete from expenses where expenseID = ";
  if (id && id !== undefined) {
    connection.query(sqlQuery + `"${id}"`, (error, result) => {
      if (error === null || result !== undefined) {
        return res.status(200).send({ message: "Expense deleted sucessfully" });
      } else {
        return res.status(400).send({ message: error });
      }
    });
  } else {
    return res.status(400).send({
      message: "There are missing fields to delete a expense",
    });
  }
});

//Update a expense
router.put("/api/expenses/update/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const { type, value, date, description } = req.body;

  if (type && value && date && description && id) {
    const modifiedDate = moment(date).format("YYYY-MM-DD");
    connection.query(
      "Update expenses set expense_type = " +
        `"${type}"` +
        ", expense_date = " +
        `"${modifiedDate}"` +
        ", expense_value = " +
        `${value}` +
        ", expense_description = " +
        `"${description}"` +
        " where expenseID = " +
        `"${id}"`,
      (error, result) => {
        console.log(error, result);
        if (error || result === undefined)
          return res.status(400).send({ message: error });

        return res.status(200).send({ message: "Expense updated sucessfully" });
      }
    );
  } else {
    return res.status(400).send({
      message: "There are missing fields to update a expense",
    });
  }
});

module.exports = router;
