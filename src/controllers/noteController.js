const Note = require("../models/Note");

async function createNote(req, res) {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "title and content are required" });
    }
    const note = await Note.create({ title, content, owner: req.user._id });
    res.status(201).json({ message: "Note created", note });
  } catch (error) {
    res.status(500).json({ message: "Could not create note", error: error.message });
  }
}

async function getNotes(req, res) {
  try {
    const notes = await Note.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch notes", error: error.message });
  }
}

async function getNoteById(req, res) {
  try {
    const note = await Note.findOne({ _id: req.params.id, owner: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch (error) {
    res.status(400).json({ message: "Invalid note ID" });
  }
}

async function updateNote(req, res) {
  try {
    const { title, content } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { title, content },
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note updated", note });
  } catch (error) {
    res.status(400).json({ message: "Could not update note", error: error.message });
  }
}

async function deleteNote(req, res) {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note deleted" });
  } catch (error) {
    res.status(400).json({ message: "Invalid note ID" });
  }
}

module.exports = { createNote, getNotes, getNoteById, updateNote, deleteNote };
