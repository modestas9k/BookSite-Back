const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");
require("dotenv").config();
const middleware = require("./middleware/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const port = process.env.SERVER_PORT || 8080;

const con = mysql.createConnection({
  host: process.env.MYSQL_DB_HOST,
  user: process.env.MYSQL_DB_USER,
  password: process.env.MYSQL_DB_PASS,
  database: process.env.MYSQL_DB_NAME,
  port: process.env.MYSQL_DB_PORT,
});

con.connect((err) => {
  if (err) throw err;
  console.log("Successfully connected to DB");
});

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post("/register", middleware.validateRegistration, (req, res) => {
  const username = req.body.username.toLowerCase();
  con.query(
    `SELECT * FROM users WHERE username = '${username}'`,
    (err, result) => {
      if (err) {
        res.status(400).json(err);
      } else if (result.length !== 0) {
        res.status(400).json({ msg: "The username already exists" });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            res.status(400).json(err);
          } else {
            con.query(
              `INSERT INTO users (username, password) VALUES ('${username}', '${hash}')`,
              (err, result) => {
                if (err) {
                  res.status(400).json(err);
                } else {
                  res
                    .status(201)
                    .json({ msg: "User has been registered successfully" });
                }
              }
            );
          }
        });
      }
    }
  );

  // if (data.username && data.password) {
  //   con.query(
  //     `INSERT INTO users (username, password)
  //      VALUES ('${data.username}', '${data.password}')`,
  //     (err, result) => {
  //       if (err) {
  //         res
  //           .status(400)
  //           .send(
  //             "The DB has not added any records due to an internal problem"
  //           );
  //       } else {
  //         res.status(201).json({ id: result.insertId });
  //       }
  //     }
  //   );
  // } else {
  //   res.status(400).send("The information provided is not correct.");
  // }
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
