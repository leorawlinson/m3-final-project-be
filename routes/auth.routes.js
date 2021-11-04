const router = require("express").Router();
const User = require("../models/User.model");
const bcrypt = require("bcryptjs");

router.post("/signup", (req, res, next) => {
  const { username, password, email, city } = req.body;

  console.log(username);

  //* Here we test if the user filled all the inputs
  if (!username || !password || !email || !city) {
    return res.status(400).json({ errorMessage: "Please fill all the fields" });
  }

  //* Here we define & test if user entered a valid email
  const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (!emailRegex.test(email)) {
    res.status(400).json({ errorMessage: "Please enter a valid email" });
  }

  //* Here we define & test if user entered a valid email
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

  if (!passwordRegex.test(password)) {
    res.status(400).json({ errorMessage: "Please enter a valid password" });
  }

  User.findOne({ email })
    //* Here we check if the email matches with a existing user & send error
    .then((foundUser) => {
      if (foundUser) {
        return res.status(400).json({ errorMessage: "Email already taken" });
      }

      //* Here we define the salt used for hashing the password
      const saltRounds = 10;
      return bcrypt
        .genSalt(saltRounds)
        .then((salt) => bcrypt.hash(password, salt))
        .then((hashedPassword) => {
          //*Here we create the user in the DB
          User.create({ username, email, city, password: hashedPassword })
            .then((newUser) => {
              /*           req.session.user = user; */
              res.status(200).json(newUser);
            })
            .catch((err) =>
              res.json({
                errorMessage:
                  "Something went wrong while creating your user. Please try again",
              })
            );
        })
        .catch((err) =>
          res.status(500).json({
            errorMessage: "Somethgin whent wrong while encrypting password",
          })
        );
    })
    .catch((err) => res.status(500).json({ err }));
});

module.exports = router;
