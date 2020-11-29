const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const middleware = require("./middleware/users");
const con = require("./db");

router.get("/", (req, res) => {
  res.send("The API service works!");
});

router.post("/register", middleware.validateUserData, (req, res) => {
  const username = req.body.username.toLowerCase();
  con.query(
    `SELECT * FROM users WHERE username = ${mysql.escape(username)}`,
    (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .json({ msg: "Internal server error checking username validity" });
      } else if (result.length !== 0) {
        return res.status(400).json({ msg: "This username already exists" });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            console.log(err);
            return res.status(400).json({
              msg: "Internal server error hashing user details",
            });
          } else {
            con.query(
              `INSERT INTO users (username, password) VALUES (${mysql.escape(
                username
              )}, ${mysql.escape(hash)})`,
              (err, result) => {
                if (err) {
                  console.log(err);
                  return res.status(400).json({
                    msg: "Internal server error saving user details",
                  });
                } else {
                  return res.status(201).json({
                    msg: "User has been successfully registered",
                  });
                }
              }
            );
          }
        });
      }
    }
  );
});

router.post("/login", middleware.validateUserData, (req, res) => {
  const username = req.body.username.toLowerCase();
  con.query(
    `SELECT * FROM users WHERE username = ${mysql.escape(username)}`,
    (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .json({ msg: "Internal server error gathering user details" });
      } else if (result.length !== 1) {
        return res.status(400).json({
          msg: "The provided details are incorrect or the user does not exist",
        });
      } else {
        bcrypt.compare(
          req.body.password,
          result[0].password,
          (bErr, bResult) => {
            if (bErr || !bResult) {
              return res.status(400).json({
                msg:
                  "The provided details are incorrect or the user does not exist",
              });
            } else if (bResult) {
              const token = jwt.sign(
                {
                  userId: result[0].id,
                  username: result[0].username,
                },
                process.env.SECRET_KEY,
                {
                  expiresIn: "7d",
                }
              );

              return res.status(200).json({
                msg: "Logged In",
                token,
                userData: {
                  userId: result[0].id,
                  username: result[0].username,
                },
              });
            }
          }
        );
      }
    }
  );
});

router.post("/book", middleware.isLoggedIn, (req, res) => {
  console.log(req.headers.authorization);
  if (req.body.author && req.body.title) {
    con.query(
      `INSERT INTO books (user_id, author, title) VALUES (${
        req.body.user_id
      }, ${mysql.escape(req.body.author)}, ${mysql.escape(req.body.title)})`,
      (err) => {
        if (err) {
          console.log(err);
          return res
            .status(400)
            .json({ msg: "Internal server error gathering book details" });
        } else {
          return res
            .status(200)
            .json({ msg: "Book has been added successfully" });
        }
      }
    );
  }
});

module.exports = router;
