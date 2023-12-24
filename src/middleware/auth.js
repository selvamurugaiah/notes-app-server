
const User = require('../model/User');
const Sessions = require('../model/session');

const jwt = require('jsonwebtoken');


const authorizePasswordChange = async (req, res, next) => {
    try {
      // Extract the JWT (JSON Web Token) from the "Authorization" header and remove the "Bearer " prefix.
      const userToken = req.header("Authorization").replace("Bearer ", "");
      
      // Verify the JWT using a secret key (stored in process.env.SECRET) and decode its content.
      const decodedToken = jwt.verify(userToken, process.env.SECRET);
      
      // If the token is successfully decoded, call the next middleware in the chain.
      if (decodedToken) {
        next();
      } else {
        // If the token is not valid, return a 401 Unauthorized response.
        return res.status(401).send({ message: "Not Authorized" });
      }
    } catch (error) {
        return res.status(401).send({ message: "Not Authorized" });
    }
  };
  
  const authorizeUser = async (req, res, next) => {
    try {
      const userToken = req.header("Authorization").replace("Bearer ", "");
     
      const decodedToken = jwt.verify(userToken, process.env.SECRET);
    
      if (decodedToken) {
        const session = await Sessions.findOne({ token: userToken });
        const user = await User.findById(session.userId);
        next();
      } else {
        return res.status(401).send({ message: "Not Authorized" });
      }
    } catch (error) {
      return res.status(401).send({ message: "There is no token provided" });
    }
  };
  
  module.exports = { authorizePasswordChange, authorizeUser};