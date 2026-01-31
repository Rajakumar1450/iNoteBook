const db = require("../config/db");
exports.addnotes = async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    const user_Id = req.user.id;
    const [result] = await db.execute(
      "INSERT INTO notes (user_id , title , description , tag) VALUES (?,?,?,?)",
      [user_Id, title, description, tag],
    );
    const newnote = {
      id: result.insertId,
      user_id: user_Id,
      title,
      description,
      tag,
    };
    res.status(200).json({ message: "Note Added!", note: newnote });
  } catch (error) {
    res.status(500).json({ error: "Internal error while notes Adding" });
  }
};
exports.editnotes = async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    const noteId = req.params.id; // bring notId and update for that id
    const user_Id = req.user.id;
    const [result] = await db.execute(
      "UPDATE notes SET title =? , description =? , tag = ? WHERE id = ? AND user_id =?",
      [title, description, tag, noteId, user_Id],
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Note Not Found Or You are not Authorised!" });
    }
    res.status(200).json({ message: "Note Added!" });
  } catch (error) {
    res.status(500).json({ error: "internal error" });
  }
};
exports.deletenotes = async (req, res) => {
  try {
    const user_Id = req.user.id;
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: "No Notes is Selected For Deletion!" });
    }
    const placeholder = ids
      .map(() => {
        "?";
      })
      .join(",");
    const [result] = await db.execute(
      `DELETE FROM notes WHERE user_id = ?  AND id IN (${placeholder})`,
      [user_Id, ...ids],
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Note NOt Found or you are not Authorised" });
    }
    res.status(200).json({ message: "Deleted!" });
  } catch (error) {
    res.status(500).json({ error: "internal error" });
  }
};
exports.deleteallnotes = async (req, res) => {
  try {
    const user_Id = req.user.id;
    await db.execute("DELETE FROM notes WHERE user_id = ?", [user_Id]);
    res.status(200).json({ message: "All Notes Delted!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal error" });
  }
};

exports.fetchnote = async (req, res) => {
  try {
    // FETCHING (GET) uses req.query, NOT req.body
    // URL will look like: /api/notes/fetchnote?ids=1,2,3
    const userId = req.user.id;
    const idString = req.query.ids;
    if (!idString) {
      return res.status(400).json({ error: "No IDs provided" });
    }

    // Convert "1,2,3" string into an array [1, 2, 3]
    const idsArray = idString.split(",");

    const placeholders = idsArray.map(() => "?").join(",");

    const [notes] = await db.execute(
      `SELECT * FROM notes WHERE user_id = ? AND id IN (${placeholders})`,
      [userId, ...idsArray],
    );
    res.json(notes);
  } catch (error) {
    +res.status(500).send("Internal Server Error");
  }
};

exports.fetchallnotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const [notes] = await db.execute("SELECT * FROM notes WHERE user_id = ?", [
      userId,
    ]);
    res.json(notes);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};
