const express = require("express");
const fetchuser = require("../middleware/fetchuser");
const {
  fetchallnotes,
  addnotes,
  deletenotes,
  deleteallnotes,
  fetchnote,
} = require("../controllers/notesController");

const router = express.Router();
//Route 1: api:localhost:5000/api/auth/signup
router.put("/addnotes", fetchuser, addnotes);
//Route 2: api:localhost:5000/api/notes/fetchallnotes
router.get("/fetchallnotes", fetchuser, fetchallnotes);
router.post("/fetchnote/:id", fetchuser, fetchnote);
//Route 3: api:localhost:5000/api/notes/deletenote
router.delete("/deletenote/:id", fetchuser, deletenotes);
//Route 1: api:localhost:5000/api/notes/deleteallnotes
router.delete("/deleteallnotes", fetchuser, deleteallnotes);
module.exports = router;
