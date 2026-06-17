const db = require("../config/db");

module.exports = {
  getFeed: async (req, res) => {
    try {
      const sqlQuery = `
      SELECT 
        p.id AS post_id,
        p.caption,
        p.created_at,
        u.name AS author_name,
        u.avatar_url AS author_avatar,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'media_url', m.media_url,
            'media_type', m.media_type,
            'order', m.media_order
          )
        ) AS carousel_items
      FROM posts p
      INNER JOIN users u ON p.user_id = u.id
      INNER JOIN post_media m ON p.id = m.post_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;

      const [feed] = await db.execute(sqlQuery);
      return res.status(200).json({ success: true, data: feed });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};
