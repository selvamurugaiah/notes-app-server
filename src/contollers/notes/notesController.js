const Note = require('../../model/Note');
const User = require('../../model/User');

// Controller to create a new note
const createNote = async (req, res) => {
  try {
      const { title, content, deadline, user, completed } = req.body;

      // Validate deadline as a valid date
      if (!Date.parse(deadline)) {
          return res.status(400).json({ error: true, message: 'Invalid deadline format' });
      }

      const newNote = new Note({ title, content, deadline, user, completed });
      const savedNote = await newNote.save();
      res.status(201).json(savedNote);
  } catch (error) {
      res.status(400).json({ error: true, message: error.message });
  }
};

// Controller to get notes
const getNotes = async (req, res) => {
  const { userId } = req.query;

  try {
    const filter = userId ? { user: userId } : {};

    const notes = await Note.find(filter).populate('user');

    res.status(200).json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Controller to get a specific note by ID
const getNoteById = async (req, res) => {
  const { id } = req.params;
  try {
    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ error: true, message: 'Note not found' });
    }
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// Controller to update a note by ID
const updateNote = async (req, res) => {
  const { id } = req.params;
  try {
      const updatedNote = await Note.findOneAndUpdate({ _id: id }, req.body, { new: true });
      if (!updatedNote) {
          return res.status(404).json({ error: true, message: 'Note not found' });
      }
      res.status(200).json(updatedNote);
  } catch (error) {
      res.status(400).json({ error: true, message: error.message });
  }
};

// Controller to delete a note by ID
const deleteNote = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedNote = await Note.findByIdAndRemove(id);
    if (!deletedNote) {
      return res.status(404).json({ error: true, message: 'Note not found' });
    }
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
};
