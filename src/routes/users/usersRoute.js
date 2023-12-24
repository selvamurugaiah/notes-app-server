const express = require('express');
const { registerUser, loginUser, authUser, logoutUser, forgetPassword, tokenVerification, changePassword } = require('../../contollers/users/usersController');
const { authorizePasswordChange } = require('../../middleware/auth');
const User = require('../../model/User');
const userRoute = express.Router()


// Route to get a list of all users
userRoute.get("/", async (req, res) => {
    try {
      const users = await User.find();
      return res.status(200).send(users);
    } catch (error) {
      res.status(500).send({ message: "Something went wrong" });
    }
  });
  
  // Route to get a specific user by ID
  userRoute.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const user = await User.findById(id);
      return res.status(200).send(user);
    } catch (error) {
      res.status(500).send({ message: "Something went wrong" });
    }
  });

  
userRoute.post("/register", registerUser)


// Route to handle user login
userRoute.post("/login", loginUser);

// Route to authenticate a user
userRoute.post("/auth", authUser);

// Route to log out a user
userRoute.post("/logout", logoutUser);

// Route to initiate the forget password process
userRoute.post("/forget-password", forgetPassword);


// Route to verify a token (typically used for password reset)
userRoute.post("/verify-token", tokenVerification);

// Route to change a user's password
userRoute.post("/change-password/:id", authorizePasswordChange, changePassword);

module.exports = userRoute