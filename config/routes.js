// const axios = require("axios");
const Users = require("./helpers.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticate, generateToken } = require("../auth/authenticate");

module.exports = server => {
  server.get("/", testServer);
  server.post("/api/register", register);
  server.post("/api/login", login);
  server.get("/api/experiences", experiences);
  server.get("/api/users", users);
};

///// SANITY CHECK //////
function testServer(req, res) {
  res.send("Sanity Check!");
}

///// GENERATE TOKEN /////

///// REGISTER /////
function register(req, res) {
  // implement user registration
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 10);
  user.password = hash;

  Users.add(user)
    .then(newUser => {
      const token = generateToken(newUser);
      console.log("TOKEN:", token);
      res.status(201).json({
        message: `Welcome ${
          user.username
        }! You have been successfully registered!`,
        newUser,
        token
      });
    })
    .catch(err => {
      console.log("register", err);
      res.status(500).json({ message: "Error registering user" });
    });
}

///// LOGIN /////

function login(req, res) {
  // implement user login
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        // generate token
        const token = generateToken(user);

        res.status(200).json({
          user,
          message: `Welcome ${user.username}!`,
          token //return the token upon login
        });
      } else {
        res
          .status(401)
          .json({ message: "Wrong username or password. Try again." });
      }
    })
    .catch(error => {
      console.log("Login error", error);
      res.status(500).json({ message: "Login error" });
    });
}

///// GET EXPERIENCES /////
function experiences(req, res) {
  let experience = req.body;
  Users.getExperiences(experience)
    .then(experiences => {
      res.status(200).json({ experiences });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: "Error getting experiences" });
    });
}

///// GET USERS /////
function users(req, res) {
  let user = req.body;
  Users.getUsers(user)
    .then(users => {
      res.status(200).json({ users });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: "Error getting users" });
    });
}
