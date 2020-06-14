const router = require("express").Router();
const connection = require("../server/server");
const verifyToken = require("./verifyToken");
const { v4: uuidv4 } = require("uuid");

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

//add new expense based with userID
router.post("/api/expenses/add", verifyToken, (req, res) => {
  const userID = req.body.userID;
  const formData = req.body.formData;
  const expenseID = uuidv4();
  const sqlQuery =
    "Insert into expenses(expenseID, expense_userID, expense_type, expense_date, expense_value,expense_description) values";

  if (userID && formData) {
    connection.query(
      sqlQuery +
        `("${expenseID}", "${userID}", "${formData.type}", "${formData.date}", ${formData.value}, "${formData.description}")`,
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
  const expenseID = req.body.expenseID;
  const sqlQuery = "Delete from expenses where expenseID = ";
  if (expenseID) {
    connection.query(sqlQuery + `"${expenseID}"`, (error, result) => {
      if (error === null || result !== undefined) {
        return res.status(200).send({ message: "Expense deleted sucessfully" });
      } else {
        return res.status(400).send({ message: error });
      }
    });
  } else {
    return res.status(400).send(
      JSON.stringify({
        message: "There are missing fields to delete a expense",
      })
    );
  }
});

//Update a expense
router.put("/api/expenses/update/:id", verifyToken, (req, res) => {
  const expenseID = req.body.expenseID;
  const formData = req.body.formData;

  if (formData && expenseID) {
    connection.query(
      "Update expenses set expense_type = " +
        `"${formData.type}"` +
        ", expense_date = " +
        ` STR_TO_DATE("${formData.date}", "%d-%m-%Y %H:%i:%s")` +
        ", expense_value = " +
        `${formData.value}` +
        ", expense_description = " +
        `"${formData.description}"` +
        " where expenseID = " +
        `"${expenseID}"`,
      (error, result) => {
        if (error !== null || result.affectedRows !== 0) {
          return res
            .status(200)
            .send({ message: "Expense updated sucessfully" });
        } else {
          return res.status(400).send({ message: error });
        }
      }
    );
  } else {
    return res.status(400).send(
      JSON.stringify({
        message: "There are missing fields to update a expense",
      })
    );
  }
});

module.exports = router;
