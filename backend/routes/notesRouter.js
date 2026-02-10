const express = require("express");
const fetchuser = require("../middleware/fetchuser");
const { z } = require("zod");
const {
  fetchallnotes,
  addnotes,
  deletenotes,
  deleteallnotes,
  fetchnote,
  editnotes,
} = require("../controllers/notesController");
const { validateParams } = require("../middleware/validation");
const validateQuerySchema = z.object({
  id: z.number().min(1, "invalid Id Format"),
});
const router = express.Router();
//Route 1: api:localhost:5000/api/auth/signup
router.put("/addnotes", fetchuser, addnotes);
//Route 2: api:localhost:5000/api/notes/fetchallnotes
router.get("/fetchallnotes", fetchuser, fetchallnotes);
// Route 3: Fetch SELECTED Notes using: GET "/api/notes/fetchnote"
router.get("/fetchnote/", fetchuser, fetchnote);
// Route 4: Bulk Delete Notes using: DELETE "/api/notes/deletenotes"
router.delete("/deletenotes", fetchuser, deletenotes);
// Route 5: Delete ALL Notes using: DELETE "/api/notes/deleteallnotes"
router.delete("/deleteallnotes", fetchuser, deleteallnotes);
// Route 6: Update a Note using: PUT "/api/notes/updatenote/:id"
router.put("/updatenote/:id",validateParams(validateQuerySchema), fetchuser, editnotes);
module.exports = router;
