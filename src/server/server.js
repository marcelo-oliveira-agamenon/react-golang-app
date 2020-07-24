const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");
const dotenv = require("dotenv");

const app = express();
dotenv.config();
app.use(cors());
app.use(bodyParser.json());
let connection;

if (process.argv[2] === "dev") {
  connection = mysql.createConnection({
    host: process.env.HOST,
    port: process.env.PORTMYSQL,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
  });
} else {
  connection = mysql.createConnection(process.env.JAWSDB_URL);
}

connection.connect((error) => {
  error ? console.log(error) : console.log("connected");
});
module.exports = connection;

connection.on("error", (error) => {
  const connection = mysql.createConnection(process.env.JAWSDB_URL);

  connection.connect((error) => {
    error ? console.log(error) : console.log("connected");
  });
  module.exports = connection;
});

//Routes from user CRUD
const authRoutes = require("../controllers/auth");
const userRoutes = require("../controllers/users");
const expenseRoutes = require("../controllers/expenses");
const dashboardRoutes = require("../controllers/dashboard");

app.use(expenseRoutes);
app.use(authRoutes);
app.use(userRoutes);
app.use(dashboardRoutes);

app.use("/api/login", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/users/add", userRoutes);
app.use("/api/users/delete/:id", userRoutes);
app.use("/api/users/update/common/:id", userRoutes);
app.use("/api/users/update/info/:id", userRoutes);
app.use("/api/expenses/:id", expenseRoutes);
app.use("/api/expenses/:id/user/:userid", expenseRoutes);
app.use("/api/expenses/add", expenseRoutes);
app.use("/api/expenses/update/:id", expenseRoutes);
app.use("/api/expenses/delete/:id", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.listen(process.env.PORT || 4000);
