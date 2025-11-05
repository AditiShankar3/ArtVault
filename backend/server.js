const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = 3001;

// --- Database Configuration ---
const dbConfig = {
  host: 'localhost',
  user: 'museum',
  password: '123',
  database: 'museum_db',
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// --- Middleware ---
app.use(cors());
const corsOptions = {
  origin: 'http://localhost:8080', 
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json()); // To parse any JSON in request bodies

//
// ===================================================================
// === ⬇️ ADMIN LOGIN ROUTE (Keep This) ⬇️ ===
// ===================================================================
//
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  let connection;
  try {
    connection = await pool.getConnection();
    const sql = 'SELECT * FROM Admin WHERE username = ? AND password = ?';
    const [rows] = await connection.execute(sql, [username, password]);
    if (rows.length > 0) {
      res.status(200).json({ 
        success: true, 
        message: 'Login successful', 
        token: 'demo-admin-token' 
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Error during admin login:', err);
    res.status(500).json({ error: 'Server error during login' });
  } finally {
    if (connection) connection.release();
  }
});

// --- API Routes (GET - Already Existing) ---

// GET Artifacts (No Change)
app.get('/api/artifacts', async (req, res) => {
  // ... (Your existing GET /api/artifacts code is fine)
  const { search = '' } = req.query;
  let connection;
  try {
    connection = await pool.getConnection();
    let sql;
    let queryParams = [];
    if (search) {
      sql = `SELECT * FROM artifact WHERE name LIKE ? OR origin LIKE ? OR era LIKE ?`;
      const searchTermWithWildcards = `${search}%`;
      queryParams = [searchTermWithWildcards, searchTermWithWildcards, searchTermWithWildcards];
    } else {
      sql = 'SELECT * FROM artifact';
    }
    const [rows] = await connection.execute(sql, queryParams);
    connection.release();
    res.json(rows);
  } catch (err) {
    console.error('Error fetching artifacts:', err);
    if (connection) connection.release();
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// GET Exhibitions (No Change)
app.get('/api/exhibitions', async (req, res) => {
  // ... (Your existing GET /api/exhibitions code is fine)
  try {
    const connection = await pool.getConnection();
    const sql = `
      SELECT 
        e.exhibition_id, e.name, e.theme, e.start_date, e.end_date, e.museum_id,
        m.name AS museum_name,
        fn_exhibition_visitor_count(e.exhibition_id) AS visitor_count,
        fn_exhibition_duration_days(e.exhibition_id) AS duration_days
      FROM Exhibition e
      INNER JOIN Museum m ON e.museum_id = m.museum_id;
    `;
    const [rows] = await connection.execute(sql);
    connection.release();
    res.json(rows);
  } catch (err) {
    console.error('Error fetching exhibitions:', err);
    res.status(500).json({ error: 'Failed to fetch exhibitions' });
  }
});

// GET Museums (No Change)
app.get('/api/museums', async (req, res) => {
  // ... (Your existing GET /api/museums code is fine)
  try {
    const connection = await pool.getConnection();
    const sql = "SELECT * FROM Museum";
    const [rows] = await connection.execute(sql);
    connection.release();
    res.json(rows);
  } catch (err) {
    console.error('Error fetching museums:', err);
    res.status(500).json({ error: 'Failed to fetch museums' });
  }
});

// (Other routes like /api/search, /api/sponsors, etc. are fine)
// ...

//
// ===================================================================
// === ⬇️ NEW ARTIFACT (POST, PUT, DELETE) ROUTES ⬇️ ===
// ===================================================================
//

// POST (CREATE) a new artifact
app.post('/api/artifacts', async (req, res) => {
  const { artifact_id, name, origin, era, museum_id } = req.body;
  if (!artifact_id || !name || !origin || !era || !museum_id) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const connection = await pool.getConnection();
    const sql = 'INSERT INTO Artifact (artifact_id, name, origin, era, museum_id) VALUES (?, ?, ?, ?, ?)';
    await connection.execute(sql, [artifact_id, name, origin, era, museum_id]);
    connection.release();
    res.status(201).json({ success: true, message: 'Artifact created' });
  } catch (err) {
    console.error('Error creating artifact:', err);
    res.status(500).json({ error: 'Failed to create artifact' });
  }
});

// PUT (UPDATE) an artifact
app.put('/api/artifacts/:id', async (req, res) => {
  const { id } = req.params;
  const { name, origin, era, museum_id } = req.body;
  try {
    const connection = await pool.getConnection();
    const sql = 'UPDATE Artifact SET name = ?, origin = ?, era = ?, museum_id = ? WHERE artifact_id = ?';
    await connection.execute(sql, [name, origin, era, museum_id, id]);
    connection.release();
    res.status(200).json({ success: true, message: 'Artifact updated' });
  } catch (err) {
    console.error('Error updating artifact:', err);
    res.status(500).json({ error: 'Failed to update artifact' });
  }
});

// DELETE an artifact
app.delete('/api/artifacts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await pool.getConnection();
    // You may need to delete from child tables first if you have FK constraints
    // e.g., DELETE FROM Exhibition_Artifact WHERE artifact_id = ?
    const sql = 'DELETE FROM Artifact WHERE artifact_id = ?';
    await connection.execute(sql, [id]);
    connection.release();
    res.status(200).json({ success: true, message: 'Artifact deleted' });
  } catch (err) {
    console.error('Error deleting artifact:', err);
    res.status(500).json({ error: 'Failed to delete artifact' });
  }
});

//
// ===================================================================
// === ⬇️ NEW EXHIBITION (POST, PUT, DELETE) ROUTES ⬇️ ===
// ===================================================================
//

// POST (CREATE) a new exhibition
app.post('/api/exhibitions', async (req, res) => {
  const { exhibition_id, name, theme, start_date, end_date, museum_id } = req.body;
  try {
    const connection = await pool.getConnection();
    const sql = 'INSERT INTO Exhibition (exhibition_id, name, theme, start_date, end_date, museum_id) VALUES (?, ?, ?, ?, ?, ?)';
    await connection.execute(sql, [exhibition_id, name, theme, start_date, end_date, museum_id]);
    connection.release();
    res.status(201).json({ success: true, message: 'Exhibition created' });
  } catch (err) {
    console.error('Error creating exhibition:', err);
    res.status(500).json({ error: 'Failed to create exhibition' });
  }
});

// PUT (UPDATE) an exhibition
app.put('/api/exhibitions/:id', async (req, res) => {
  const { id } = req.params;
  const { name, theme, start_date, end_date, museum_id } = req.body;
  try {
    const connection = await pool.getConnection();
    const sql = 'UPDATE Exhibition SET name = ?, theme = ?, start_date = ?, end_date = ?, museum_id = ? WHERE exhibition_id = ?';
    await connection.execute(sql, [name, theme, start_date, end_date, museum_id, id]);
    connection.release();
    res.status(200).json({ success: true, message: 'Exhibition updated' });
  } catch (err) {
    console.error('Error updating exhibition:', err);
    res.status(500).json({ error: 'Failed to update exhibition' });
  }
});

// DELETE an exhibition
app.delete('/api/exhibitions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await pool.getConnection();
    // Delete dependencies first
    await connection.execute('DELETE FROM Visitor_Exhibition WHERE exhibition_id = ?', [id]);
    await connection.execute('DELETE FROM Exhibition_Sponsor WHERE exhibition_id = ?', [id]);
    await connection.execute('DELETE FROM Exhibition_Artifact WHERE exhibition_id = ?', [id]);
    // Now delete the exhibition
    await connection.execute('DELETE FROM Exhibition WHERE exhibition_id = ?', [id]);
    connection.release();
    res.status(200).json({ success: true, message: 'Exhibition deleted' });
  } catch (err) {
    console.error('Error deleting exhibition:', err);
    res.status(500).json({ error: 'Failed to delete exhibition' });
  }
});

//
// ===================================================================
// === ⬇️ NEW MUSEUM (POST, PUT, DELETE) ROUTES ⬇️ ===
// ===================================================================
//

// POST (CREATE) a new museum
app.post('/api/museums', async (req, res) => {
  const { museum_id, name, city, state, type, established_year } = req.body;
  try {
    const connection = await pool.getConnection();
    const sql = 'INSERT INTO Museum (museum_id, name, city, state, type, established_year) VALUES (?, ?, ?, ?, ?, ?)';
    await connection.execute(sql, [museum_id, name, city, state, type, established_year]);
    connection.release();
    res.status(201).json({ success: true, message: 'Museum created' });
  } catch (err) {
    console.error('Error creating museum:', err);
    res.status(500).json({ error: 'Failed to create museum' });
  }
});

// PUT (UPDATE) a museum
app.put('/api/museums/:id', async (req, res) => {
  const { id } = req.params;
  const { name, city, state, type, established_year } = req.body;
  try {
    const connection = await pool.getConnection();
    const sql = 'UPDATE Museum SET name = ?, city = ?, state = ?, type = ?, established_year = ? WHERE museum_id = ?';
    await connection.execute(sql, [name, city, state, type, established_year, id]);
    connection.release();
    res.status(200).json({ success: true, message: 'Museum updated' });
  } catch (err) {
    console.error('Error updating museum:', err);
    res.status(500).json({ error: 'Failed to update museum' });
  }
});

// DELETE a museum
app.delete('/api/museums/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await pool.getConnection();
    // You must delete all child records from other tables first
    // This is complex! It includes Staff, Exhibitions, and Artifacts
    // A simpler way for a demo is to set them to NULL if allowed, or delete
    // This example assumes you'd delete them (which is dangerous!)
    // A better DB design would use ON DELETE CASCADE or ON DELETE SET NULL
    await connection.execute('DELETE FROM Staff WHERE museum_id = ?', [id]);
    await connection.execute('DELETE FROM Artifact WHERE museum_id = ?', [id]);
    await connection.execute('DELETE FROM Exhibition WHERE museum_id = ?', [id]);
    // Now delete the museum
    await connection.execute('DELETE FROM Museum WHERE museum_id = ?', [id]);
    connection.release();
    res.status(200).json({ success: true, message: 'Museum deleted' });
  } catch (err) {
    console.error('Error deleting museum:', err);
    res.status(500).json({ error: 'Failed to delete museum' });
  }
});


// --- Start the Server ---
app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});