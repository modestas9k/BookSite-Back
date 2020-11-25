module.exports = {
  validateRegistration: (req, res, next) => {
    if (!req.body.username || req.body.username.length < 6) {
      return res.status(400).json({
        msg: "Username does not follow the rules",
      });
    }

    if (!req.body.password || req.body.password.length < 8) {
      return res.status(400).json({
        msg: "Password does not follow the rules",
      });
    }

    next();
  },
};