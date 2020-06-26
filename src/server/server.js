const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");
const dotenv = require("dotenv");

const app = express();
dotenv.config();
app.use(cors());
app.use(bodyParser.json());

//connection with the mysql database
// const connection = mysql.createConnection({
//   host: process.env.HOST,
//   port: process.env.PORTMYSQL,
//   user: process.env.USER,
//   password: process.env.PASSWORD,
//   database: process.env.DATABASE,
// });

const connection = mysql.createConnection(process.env.CLEARDB_DATABASE_URL);

connection.connect((error) => {
  error ? console.log(error) : console.log("connected");
});
module.exports = connection;

connection.on("error", (error) => {
  if (error.code === "PROTOCOL_CONNECTION_LOST") {
    connection.connect((error) => {
      error ? console.log(error) : console.log("connected");
    });
    module.exports = connection;
  } else {
    throw error;
  }
});

//Routes from user CRUD
const authRoutes = require("../routes/auth");
const userRoutes = require("../routes/users");
const expenseRoutes = require("../routes/expenses");
const dashboardRoutes = require("../routes/dashboard");

app.use(expenseRoutes);
app.use(authRoutes);
app.use(userRoutes);
app.use(dashboardRoutes);

app.use("/api/login", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/users/add", userRoutes);
app.use("/api/users/delete/:id", userRoutes);
app.use("/api/users/update/:id", userRoutes);
app.use("/api/expenses/:id", expenseRoutes);
app.use("/api/expenses/add", expenseRoutes);
app.use("/api/expenses/update/:id", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.listen(process.env.PORT || 4000);
