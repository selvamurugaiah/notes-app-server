const express = require('express');
const { createNote, getNotes, getNoteById, updateNote, deleteNote } = require('../../contollers/notes/notesController');
const Note = require('../../model/Note');
const { authorizeUser } = require('../../middleware/auth');
const notesRoute = express.Router();

// Middleware to authenticate user for note-related routes
notesRoute.use(authorizeUser);

// Route to create a new note
notesRoute.post("/create-note", createNote);

// Route to get all notes
notesRoute.get("/get-note", getNotes);

// Route to get a specific note by ID
notesRoute.get("/get-note/:id", getNoteById);

// Route to update a note by ID
notesRoute.put("/update-note/:id", updateNote);

// Route to delete a note by ID
notesRoute.delete("/delete-note/:id", deleteNote);

module.exports = notesRoute;
