const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const NoteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
        maxLength: 50
    },
    content: {
        type: String,
        required: [true, "Content is required"],
        trim: true
    },
    deadline: {
        type: Date,
        required: [true, "Deadline is required"],
        trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "UserId is required"],
    },
    completed: {
      type: Boolean,
      default: false, 
  },
    
},
{
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});

// Pagination
NoteSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Note', NoteSchema);


