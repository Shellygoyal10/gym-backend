const express = require('express');
const cors    = require('cors');
const db      = require('./db');

const app = express();

// ── MIDDLEWARE ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());


// ── TEST ROUTE ────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('Backend Running 🚀');
});


// ── GET ALL MEMBERS ───────────────────────────────────────────────────────────
app.get("/members", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM members");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// ── ADD MEMBER (FIXED CLEAN) ─────────────────────────────────────────────────
app.post('/addMember', (req, res) => {

  const { name, phone, user_id, trainer_id } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'name and phone are required' });
  }

  const sql = 'INSERT INTO members (user_id, name, phone, trainer_id) VALUES (?, ?, ?, ?)';

  db.query(sql, [user_id, name, phone, trainer_id], (err, result) => {
    if (err) {
      console.error('DB error on /addMember:', err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Member Added ✅', id: result.insertId });
  });

});


// ── LOGIN API ────────────────────────────────────────────────────────────────
app.post('/login', (req, res) => {

  const { username, password } = req.body;

  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';

  db.query(sql, [username, password], (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      res.json({
        success: true,
        user_id: result[0].user_id,
        role: result[0].role
      });
    } else {
      res.json({ success: false });
    }
  });

});


// ── MEMBER CLASSES ───────────────────────────────────────────────────────────
app.get('/my-classes/:userId', (req, res) => {

  const userId = req.params.userId;

  const sql = `
    SELECT c.class_name, t.name AS trainer, e.date, e.time, c.duration, e.status
    FROM enrollments e
    JOIN members m ON e.member_id = m.member_id
    JOIN classes c ON e.class_id = c.class_id
    JOIN trainers t ON c.trainer_id = t.trainer_id
    WHERE m.user_id = ?
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) throw err;
    res.json(result);
  });

});


// ── TRAINERS ─────────────────────────────────────────────────────────────────
app.get('/trainers', (req, res) => {
  db.query('SELECT * FROM trainers', (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});


// ── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});