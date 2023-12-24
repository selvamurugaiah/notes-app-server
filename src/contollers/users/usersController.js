
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../model/User');
const  Sessions  = require('../../model/session');

//signup
const createUser = async (req,res)=>{
    //Log the request body to the console
    console.log(req.body);

    //Extract the 'username','email' and 'password' from the request body
    const {username,email,password} = req.body;

    //Hash the password using bcrypt
    await bcrypt.hash(password,10, async(err,hashedPassword)=>{
        try {
            //Create a user object with the username,email and hashedPassword
            const userData = {username,email,password:hashedPassword};
            
            //create a new user instance using the User model
            const user = new User(userData)

            //Generate a JWT token for the user's session
            const token = jwt.sign(
                {_id:user._id + Date.now()},
                process.env.SECRET
            );

            //Create a sessionData object with the with the user_id and token
            const sessionData = new Sessions({userId:user._id,token});

            //Save the user and sessionData to the database
            await user.save();
            await sessionData.save();

            //Respond with a status code of 201
            res.status(201).send({message:"Signup Successfully",userData:user,token:token,session:sessionData});
            
        } catch (error) {

            
            //If there's an error, respond with a status code 500
            res.status(500).send({message:"User already exists",error})
            
        }
    });
};

//Login

const loginUser = async(req,res)=>{
    const {email,password} = req.body;

    // Attempt to find a user with the provided in the database
    const user = await User.findOne({email:email});

    //If no user is found,respond with a 400 status and an "Invalid Credentials"
    if(!user) return res.status(400).send({message:"Invalid Credentials"});
  
    //If a user with the provided email is found, compare the provided password with the hashedPassword in the database 
    bcrypt.compare(password,user.password, async(err,result)=>{
        
          // If the passwords do not match, respond with a 401 status and an "Invalid Credential"
        if(!result) res.status(401).send({message:"Invalid Credentials"});
        
      
        if(result){
         
        // If the passwords match, generate a new JWT token for the user's session
            const token = jwt.sign({_id:user.id+Date.now()},process.env.SECRET);
           
           // Create a new sessionData object with the user's ID and the JWT token
            const sessionData = new Sessions({userId:user._id,token});
           
            // Save the user and the sessionData to the database
            await user.save();
            await sessionData.save();

            // Respond with a 200 status and a "Login successful" message, along with the session data
            res.status(200).send({message:"Login successful",user:user,session:sessionData});
        }
    });
};


//Auththentication

const authUser = async (req,res)=>{ 
    const {userId,token} = req.body;
    try {

         // Attempt to find a user in the database by their user ID
        const user = await User.findById(userId);

         // If no user is found with the provided user ID, respond with a 403 status and a "Please SignUp" message
        if(!user){
            return res.status(403).send({message:"Please SignUp"});
        }else {

            // If user is found, respond with a 200 status and an "Login successful"
            return res.status(200).send({message:"User Authenticated"})
        }
        
    } catch (error) {

        // If there is an error during the process, respond with a 400 status and the error
        return res.status(400).send(error)
        
    }
};

// Logout User
const logoutUser = async (req,res)=>{
    try {

        // Extract the JWT token from the "Authorization" header, removing the "Bearer " prefix
        const token = req.header("Authorization").replace("Bearer","");

        // Find a session with the provided token and mark it as expired
        const expireToken = await Sessions.findOneAndUpdate(
            {token},
            {expired:true},
            {new:true}

        );

        // Save the updated session data
        await expireToken.save();

        // Respond with a 200 status and a "Logged Out Successfully" message
        return res.status(200).send({message:"Logged out Successfully"});
        
    } catch (error) {
        // If there is an error during the process, respond with a 500 status and an "Error" message
        res.status(500).send({message:"Error"});
    }
}


// changePassword

const changePassword = async(req,res)=>{
    const {password}= req.body;
    const {id} = req.params;
    console.log(req.body);
    try {

        // Hash the new password using bcrypt
        await bcrypt.hash(password,10, async(err,hashedPassword)=>{
            
            // Find the user by their ID and update the password with the hashed password
            const user = await User.findByIdAndUpdate(id,{
                password:hashedPassword,
            });
            console.log(user);

             // Generate a new JWT token for the user's session
            const token = jwt.sign(
                {_id:user._id+Date.now()},
                process.env.SECRET
            );

            // Create a new sessionData object with the user's ID and the JWT token
            const sessionData = new Sessions({userId:user._id,token});
          
          // Save the updated user, the new session data, and respond with a 200 status
            await user.save();
            await sessionData.save();
            res.status(200).send({message:"Password changed successfully",sessionData})
        })
        
    } catch (error) {
         // If there is an error during the process, respond with a 500 status and include the error in the response
        res.status(500).send(error)
        
    }
}

//Nodemailer setup

async function nodemailer(email,token) {
    let transporter = nodemailer.createTransport({
        service:"gmail",
        host:"smtp.gmail.com",
        secure:false,
        auth:{
            user: process.env.EMAIL_TEST,
            pass: process.env.EMAIL_TEST_APP_PSWD, 
        },
    });
    
    let info = await transporter.sendMail({
        from:'"Selvam ❤️" <mselvajune@gmail.com>', //sender address
        to:`${email},mselvajune@gmail.com`, //list of receivers
        subject:"Change Password Request", //subject line
        text:`Copy and paste this link in brower -${token}`, //plain text body
        html:`<b>Copy and Paste this link in browser within 10mins -<mark>${token}</mark></b>`, //html body

    });
    console.log("Message send:%s",info.messageId)
}

//forget password

const forgetPassword = async (req,res)=>{
    console.log(req.body);
    const {email} =req.body;
    try {
          // Find a user in the database by their email address
        const user = await User.findOne({email});
        console.log(user);

         // If no user is found, respond with a 403 status and a "User not found" message
        if(!user) return res.status(403).send({message:"User not found"});
       
       // If a user is found, generate a JWT token for the user's password reset request
        const token = jwt.sign(
            {_id:user._id,email:email},
            process.env.SECRET,
            {
                expiresIn:"10m", // The token will expire after 10 minutes
            }
        );
        console.log(token);

         // Use nodemailer to send an email to the user with the reset token
        await nodemailer(email,token);

        // Respond with a 200 status and provide the user object and the generated token
        res.status(200).send({user,token});
    } catch (error) {

        // If there is an error during the process, respond with a 500 status and include the error message in the response
        res.status(500).send({message:error.message});
        
    }
};


//Token Verification

const tokenVerification = async (req,res)=>{
    const {token} = req.body;

    try {

          // Verify the provided token using the secret key from the environment variables
        const decodedToken = jwt.verify(token,process.env.SECRET)
        
         // Log the decoded token, which contains the token's payload
        console.log(decodedToken);

         // Respond with a 200 status and a "Verified" message
        res.status(200).send({message:"Verified"});

    } catch (error) {
       // If there is an error during the token verification process, respond with a 500 status and include the error message in the response
        res.status(500).send({message:error.message})
        
    }
};

module.exports = {
    registerUser:createUser,
    loginUser,
    authUser,
    logoutUser,
    changePassword,
    forgetPassword,
    tokenVerification,
}
