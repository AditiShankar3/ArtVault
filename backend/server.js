const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = 3001;

// --- Database Configuration ---
const dbConfig = {
  host: 'localhost',
  user: 'museum',
  password: 'ArtVault',
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
app.use(express.json());

// --- ADMIN LOGIN ROUTE ---
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

// ===================================================================
// === ⬇️ PUBLIC 'GET' ROUTES (INCLUDES THE MISSING ONES) ⬇️ ===
// ===================================================================

// GET Artifacts (with search)
app.get('/api/artifacts', async (req, res) => {
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

// --- THIS ROUTE WAS MISSING ---
// GET Search (Global Search)
app.get('/api/search', async (req, res) => {
  const { q = '' } = req.query;
  const searchTerm = `${q}%`; 

  if (!q) {
    return res.json({ artifacts: [], museums: [], exhibitions: [] });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // 1. Artifacts Query
    const artifactSql = `
      SELECT artifact_id, name, origin, era, museum_id 
      FROM artifact 
      WHERE name LIKE ? OR origin LIKE ? OR era LIKE ?
    `;
    const artifactQuery = connection.execute(artifactSql, [searchTerm, searchTerm, searchTerm]);

    // 2. Museums Query
    const museumSql = `
      SELECT museum_id, name, city, state, type 
      FROM Museum 
      WHERE name LIKE ? OR city LIKE ? OR type LIKE ?
    `;
    const museumQuery = connection.execute(museumSql, [searchTerm, searchTerm, searchTerm]);

    // 3. Exhibitions Query
    const exhibitionSql = `
      SELECT e.exhibition_id, e.name, e.theme, e.start_date, e.end_date, m.name AS museum_name
      FROM exhibition e
      JOIN Museum m ON e.museum_id = m.museum_id
      WHERE e.name LIKE ? OR e.theme LIKE ? OR m.name LIKE ?
    `;
    const exhibitionQuery = connection.execute(exhibitionSql, [searchTerm, searchTerm, searchTerm]);

    // Run all 3 queries in parallel
    const [
      [artifacts],
      [museums],
      [exhibitions]
    ] = await Promise.all([
      artifactQuery,
      museumQuery,
      exhibitionQuery
    ]);

    res.json({ artifacts, museums, exhibitions });

  } catch (err) {
    console.error('Error performing global search:', err);
    res.status(500).json({ error: 'Failed to execute global search' });
  } finally {
    if (connection) connection.release();
  }
});

// GET Exhibitions (for main page)
app.get('/api/exhibitions', async (req, res) => {
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

// GET Museums
app.get('/api/museums', async (req, res) => {
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


// ===================================================================
// === ⬇️ PUBLIC 'POST' ROUTES (INCLUDES THE MISSING ONES) ⬇️ ===
// ===================================================================

// --- THIS ROUTE WAS MISSING ---
// POST Register Visitor
app.post('/api/register-visitor', async (req, res) => {
  const { name, age, gender, city, exhibition_id } = req.body;

  if (!name || !age || !gender || !city || !exhibition_id) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Insert the new visitor
    const visitorSql = 'INSERT INTO visitor (name, age, gender, city) VALUES (?, ?, ?, ?)';
    const [visitorResult] = await connection.execute(visitorSql, [name, age, gender, city]);
    const newVisitorId = visitorResult.insertId;

    // 2. Link the visitor to the exhibition
    const linkSql = 'INSERT INTO visitor_exhibition (visitor_id, exhibition_id) VALUES (?, ?)';
    await connection.execute(linkSql, [newVisitorId, exhibition_id]);

    await connection.commit();
    res.status(201).json({ success: true, message: 'Visitor registered!' });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error registering visitor:', err);
    res.status(500).json({ error: 'Failed to register visitor' });
  } finally {
    if (connection) connection.release();
  }
});

// POST Sponsorship Request (for the NEW sponsor form)
app.post('/api/sponsorship-request', async (req, res) => {
  const { name, type, contact_no, email, exhibition_id, budget } = req.body;
  if (!name || !email || !exhibition_id || !budget) {
    return res.status(400).json({ error: 'Sponsor name, email, exhibition, and budget are required.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Create the Sponsor
    const sponsorSql = 'INSERT INTO Sponsor (name, type, contact_no, email) VALUES (?, ?, ?, ?)';
    const [sponsorResult] = await connection.execute(sponsorSql, [name, type, contact_no, email]);
    const newSponsorId = sponsorResult.insertId;

    // 2. Create the 'Pending' sponsorship link
    const linkSql = 'INSERT INTO Exhibition_Sponsor (exhibition_id, sponsor_id, budget, status) VALUES (?, ?, ?, ?)';
    await connection.execute(linkSql, [exhibition_id, newSponsorId, budget, 'Pending']);
    
    await connection.commit();
    res.status(201).json({ success: true, message: 'Sponsorship request submitted!' });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error submitting sponsorship request:', err);
    res.status(500).json({ error: 'Failed to submit request.' });
  } finally {
    if (connection) connection.release();
  }
});


// ===================================================================
// === ⬇️ ADMIN CRUD ROUTES (Unchanged) ⬇️ ===
// ===================================================================

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
    const sql = 'DELETE FROM Artifact WHERE artifact_id = ?';
    await connection.execute(sql, [id]);
    connection.release();
    res.status(200).json({ success: true, message: 'Artifact deleted' });
  } catch (err) {
    console.error('Error deleting artifact:', err);
    res.status(500).json({ error: 'Failed to delete artifact' });
  }
});

// POST (CREATE) a new exhibition
app.post('/api/exhibitions', async (req, res) => {
  const { exhibition_id, name, theme, start_date, end_date, museum_id } = req.body;
  try {
    const connection = await pool.getConnection();
    const sql = 'INSERT INTO Exhibition (exhibition_id, name, theme, start_date, end_date, museum_id) VALUES (?, ?, ?, ?, ?, ?)';
    await connection.execute(sql, [exhibition_id, name, theme, start_date, end_date, museum_id]);
    connection.release();
    res.status(201).json({ success: true, message: 'Exhibition created' });
  } catch (err)
 {
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
    await connection.execute('DELETE FROM Visitor_Exhibition WHERE exhibition_id = ?', [id]);
    await connection.execute('DELETE FROM Exhibition_Sponsor WHERE exhibition_id = ?', [id]);
    await connection.execute('DELETE FROM Exhibition_Artifact WHERE exhibition_id = ?', [id]);
    await connection.execute('DELETE FROM Exhibition WHERE exhibition_id = ?', [id]);
    connection.release();
    res.status(200).json({ success: true, message: 'Exhibition deleted' });
  } catch (err) {
    console.error('Error deleting exhibition:', err);
    res.status(500).json({ error: 'Failed to delete exhibition' });
  }
});

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
    await connection.execute('DELETE FROM Staff WHERE museum_id = ?', [id]);
    await connection.execute('DELETE FROM Artifact WHERE museum_id = ?', [id]);
    await connection.execute('DELETE FROM Exhibition WHERE museum_id = ?', [id]);
    await connection.execute('DELETE FROM Museum WHERE museum_id = ?', [id]);
    connection.release();
    res.status(200).json({ success: true, message: 'Museum deleted' });
  } catch (err) {
    console.error('Error deleting museum:', err);
    res.status(500).json({ error: 'Failed to delete museum' });
  }
});

// ===================================================================
// === ⬇️ ADMIN SPONSORSHIP ROUTES (Unchanged) ⬇️ ===
// ===================================================================

// GET Ongoing Exhibitions (for sponsor form dropdown)
app.get('/api/exhibitions/ongoing', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const sql = 'SELECT exhibition_id, name FROM Exhibition WHERE end_date >= CURDATE() ORDER BY start_date';
    const [rows] = await connection.execute(sql);
    connection.release();
    res.json(rows);
  } catch (err) {
    console.error('Error fetching ongoing exhibitions:', err);
    res.status(500).json({ error: 'Failed to fetch exhibitions' });
  }
});

// GET Pending Sponsorships (for admin tab)
app.get('/api/sponsorships/pending', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const sql = `
      SELECT 
        es.exhibition_id, es.sponsor_id, es.budget,
        e.name AS exhibition_name,
        s.name AS sponsor_name, s.email AS sponsor_email
      FROM Exhibition_Sponsor es
      JOIN Exhibition e ON es.exhibition_id = e.exhibition_id
      JOIN Sponsor s ON es.sponsor_id = s.sponsor_id
      WHERE es.status = 'Pending'
    `;
    const [rows] = await connection.execute(sql);
    connection.release();
    res.json(rows);
  } catch (err) {
    console.error('Error fetching pending sponsorships:', err);
    res.status(500).json({ error: 'Failed to fetch pending sponsorships' });
  }
});

// PUT Update Sponsorship Status (for admin buttons)
app.put('/api/sponsorships/update', async (req, res) => {
  const { exhibition_id, sponsor_id, status } = req.body;
  if (!exhibition_id || !sponsor_id || !status) {
    return res.status(400).json({ error: 'exhibition_id, sponsor_id, and status are required' });
  }
  if (status !== 'Approved' && status !== 'Rejected') {
    return res.status(400).json({ error: 'Status must be "Approved" or "Rejected"' });
  }

  try {
    const connection = await pool.getConnection();
    const sql = 'UPDATE Exhibition_Sponsor SET status = ? WHERE exhibition_id = ? AND sponsor_id = ?';
    await connection.execute(sql, [status, exhibition_id, sponsor_id]);
    connection.release();
    res.status(200).json({ success: true, message: `Sponsorship ${status.toLowerCase()}` });
  } catch (err) {
    console.error('Error updating sponsorship status:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});


// --- Start the Server ---
app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});