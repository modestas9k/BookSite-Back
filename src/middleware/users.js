const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = {
  validateUserData: (req, res, next) => {
    if (
      !req.body.username ||
      req.body.username.length < 6 ||
      req.body.username.length > 20
    ) {
      return res
        .status(400)
        .json({ msg: "Error: Username does not follow the rules." });
    }

    if (
      !req.body.password ||
      req.body.password.length < 8 ||
      req.body.password.length > 64
    ) {
      return res
        .status(400)
        .json({ msg: "Error: Password does not follow the rules." });
    }

    next();
  },
};
