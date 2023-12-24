const express = require('express');
const cors = require('cors');
const dbConnect = require('./config/dbConnect');
const userRoute = require('./routes/users/usersRoute');
const notesRoute = require('./routes/notes/notesRoute');

const app = express();
app.use(express.json())
app.use(cors());

dbConnect()

//routes
 
app.use("/", userRoute);

//Notes Routes
app.use("/notes", notesRoute)




module.exports = app;