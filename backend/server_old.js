const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = 3001;

// --- Database Configuration ---
const dbConfig = {
  host: 'localhost',
  user: 'museum',     // Your MySQL user
  password: 'ArtVault', // Your MySQL password
  database: 'museum_db',
  multipleStatements: true // Important for stored procedures
};

const pool = mysql.createPool(dbConfig);

// --- Middleware ---
app.use(cors()); // Allow all origins for simplicity during development
app.use(express.json()); // To parse JSON request bodies

// --- PUBLIC ROUTES (for your main site) ---

app.get('/api/artifacts', async (req, res) => {
  const { search = '' } = req.query;
  let connection;
  try {
    connection = await pool.getConnection();
    let sql;
    let queryParams = [];
    if (search) {
      sql = `SELECT * FROM artifact 
             WHERE name LIKE ? 
             OR origin LIKE ? 
             OR era LIKE ?`;
      const searchTerm = `${search}%`;
      queryParams = [searchTerm, searchTerm, searchTerm];
    } else {
      sql = 'SELECT * FROM artifact';
    }
    const [rows] = await connection.execute(sql, queryParams);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching artifacts:', err);
    res.status(500).json({ error: 'Failed to fetch data' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/search', async (req, res) => {
  const { q = '' } = req.query;
  const searchTerm = `${q}%`; 
  if (!q) {
    return res.json({ artifacts: [], museums: [], exhibitions: [] });
  }
  let connection;
  try {
    connection = await pool.getConnection();
    const artifactSql = `SELECT artifact_id, name, origin, era, museum_id FROM artifact WHERE name LIKE ? OR origin LIKE ? OR era LIKE ?`;
    const museumSql = `SELECT museum_id, name, city, state, type FROM Museum WHERE name LIKE ? OR city LIKE ? OR type LIKE ?`;
    const exhibitionSql = `
      SELECT e.exhibition_id, e.name, e.theme, e.start_date, e.end_date, m.name AS museum_name
      FROM exhibition e
      JOIN Museum m ON e.museum_id = m.museum_id
      WHERE e.name LIKE ? OR e.theme LIKE ? OR m.name LIKE ?`;

    const [
      [artifacts],
      [museums],
      [exhibitions]
    ] = await Promise.all([
      connection.execute(artifactSql, [searchTerm, searchTerm, searchTerm]),
      connection.execute(museumSql, [searchTerm, searchTerm, searchTerm]),
      connection.execute(exhibitionSql, [searchTerm, searchTerm, searchTerm])
    ]);
    
    res.json({ artifacts, museums, exhibitions });
  } catch (err) {
    console.error('Error in global search:', err);
    res.status(500).json({ error: 'Failed to execute global search' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/museums', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute("SELECT * FROM Museum");
    res.json(rows);
  } catch (err) {
    console.error('Error fetching museums:', err);
    res.status(500).json({ error: 'Failed to fetch museums' });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/sponsors', async (req, res) => {
  const { name, type, contact, email } = req.body;
  if (!name || !type || !contact || !email) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  let connection;
  try {
    connection = await pool.getConnection();
    const sql = 'INSERT INTO Sponsor (name, type, contact_no, email) VALUES (?, ?, ?, ?)';
    const [result] = await connection.execute(sql, [name, type, contact, email]);
    res.status(201).json({ success: true, message: 'Sponsor registered!', insertedId: result.insertId });
  } catch (err) {
    console.error('Error inserting sponsor:', err);
    res.status(500).json({ error: 'Failed to register sponsor' });
  } finally {
    if (connection) connection.release();
  }
});

// GET CURRENT Exhibitions (for public site)
app.get('/api/exhibitions', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const sql = `
      SELECT e.*, m.name AS museum_name 
      FROM exhibition e
      JOIN Museum m ON e.museum_id = m.museum_id
      WHERE e.end_date >= CURDATE()
      ORDER BY e.start_date;
    `;
    const [rows] = await connection.execute(sql);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching current exhibitions:', err);
    res.status(500).json({ error: 'Failed to fetch exhibitions' });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/register-visitor', async (req, res) => {
  const { name, age, gender, city, exhibition_id } = req.body;
  if (!name || !age || !gender || !city || !exhibition_id) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const visitorSql = 'INSERT INTO visitor (name, age, gender, city) VALUES (?, ?, ?, ?)';
    const [visitorResult] = await connection.execute(visitorSql, [name, age, gender, city]);
    const newVisitorId = visitorResult.insertId;

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


// =====================================================
// --- ADMIN ROUTES ---
// =====================================================

// --- ADMIN: EXHIBITIONS (CRUD + Sponsor Linking) ---

// GET ALL Exhibitions (for admin panel)
app.get('/api/exhibitions/all', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const sql = `
      SELECT e.*, m.name AS museum_name 
      FROM exhibition e
      JOIN Museum m ON e.museum_id = m.museum_id
      ORDER BY e.start_date DESC;
    `;
    const [rows] = await connection.execute(sql);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching all exhibitions:', err);
    res.status(500).json({ error: 'Failed to fetch exhibitions' });
  } finally {
    if (connection) connection.release();
  }
});

// POST: Create new exhibition
app.post('/api/exhibitions', async (req, res) => {
  const { name, theme, start_date, end_date, museum_id } = req.body;
  let connection;
  try {
    connection = await pool.getConnection();
    const sql = 'INSERT INTO Exhibition (name, theme, start_date, end_date, museum_id) VALUES (?, ?, ?, ?, ?)';
    const [result] = await connection.execute(sql, [name, theme, start_date, end_date, museum_id]);
    res.status(201).json({ success: true, insertedId: result.insertId });
  } catch (err) {
    console.error('Error creating exhibition:', err);
    res.status(500).json({ error: 'Failed to create exhibition' });
  } finally {
    if (connection) connection.release();
  }
});

// PUT: Update exhibition
app.put('/api/exhibitions/:id', async (req, res) => {
  const { id } = req.params;
  const { name, theme, start_date, end_date, museum_id } = req.body;
  let connection;
  try {
    connection = await pool.getConnection();
    const sql = `
      UPDATE Exhibition 
      SET name = ?, theme = ?, start_date = ?, end_date = ?, museum_id = ?
      WHERE exhibition_id = ?
    `;
    const [result] = await connection.execute(sql, [name, theme, start_date, end_date, museum_id, id]);
    res.json({ success: true, changedRows: result.changedRows });
  } catch (err) {
    console.error('Error updating exhibition:', err);
    res.status(500).json({ error: 'Failed to update exhibition' });
  } finally {
    if (connection) connection.release();
  }
});

// DELETE: Delete exhibition
app.delete('/api/exhibitions/:id', async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await pool.getConnection();
    // Your trigger 'trg_prevent_active_exhibition_deletion' will fire here
    // We must first delete from child tables (junction tables)
    await connection.beginTransaction();
    await connection.execute('DELETE FROM Exhibition_Sponsor WHERE exhibition_id = ?', [id]);
    await connection.execute('DELETE FROM Exhibition_Artifact WHERE exhibition_id = ?', [id]);
    await connection.execute('DELETE FROM Visitor_Exhibition WHERE exhibition_id = ?', [id]);
    // Now delete from the parent table
    await connection.execute('DELETE FROM Exhibition WHERE exhibition_id = ?', [id]);
    await connection.commit();
    res.json({ success: true, message: 'Exhibition deleted' });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error deleting exhibition:', err);
    // Send the specific MySQL error message to the frontend
    res.status(500).json({ error: err.sqlMessage || 'Failed to delete exhibition' });
  } finally {
    if (connection) connection.release();
  }
});

// POST: Link a sponsor to an exhibition (The "Approval" step)
app.post('/api/exhibition_sponsors', async (req, res) => {
  const { exhibition_id, sponsor_id, budget } = req.body;
  if (!exhibition_id || !sponsor_id || !budget) {
    return res.status(400).json({ error: 'Exhibition, sponsor, and budget are required.' });
  }
  let connection;
  try {
    connection = await pool.getConnection();
    const sql = 'INSERT INTO Exhibition_Sponsor (exhibition_id, sponsor_id, budget) VALUES (?, ?, ?)';
    await connection.execute(sql, [exhibition_id, sponsor_id, budget]);
    res.status(201).json({ success: true, message: 'Sponsor linked to exhibition!' });
  } catch (err) {
    console.error('Error linking sponsor to exhibition:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) connection.release();
  }
});

// --- ADMIN: ARTIFACTS (CRUD) ---

// GET: All artists (for dropdowns)
app.get('/api/artists', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute("SELECT artist_id, name FROM Artist ORDER BY name");
    res.json(rows);
  } catch (err) {
    console.error('Error fetching artists:', err);
    res.status(500).json({ error: 'Failed to fetch artists' });
  } finally {
    if (connection) connection.release();
  }
});

// GET: All archeologists (for dropdowns)
app.get('/api/archeologists', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute("SELECT archeologist_id, name FROM Archeologist ORDER BY name");
    res.json(rows);
  } catch (err) {
    console.error('Error fetching archeologists:', err);
    res.status(500).json({ error: 'Failed to fetch archeologists' });
  } finally {
    if (connection) connection.release();
  }
});


// POST: Create a new artifact using your stored procedure
app.post('/api/artifacts', async (req, res) => {
  const { 
    artifact_id, name, origin, era, museum_id, 
    artifact_type, type_data 
  } = req.body;

  // Basic validation
  if (!artifact_id || !name || !origin || !era || !museum_id || !artifact_type || !type_data) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const sql = 'CALL sp_add_artifact_with_type(?, ?, ?, ?, ?, ?, ?)';
    
    // Convert the type_data object into a JSON string for the procedure
    const typeDataString = JSON.stringify(type_data);
    
    await connection.query(sql, [artifact_id, name, origin, era, museum_id, artifact_type, typeDataString]);
    
    res.status(201).json({ success: true, message: 'Artifact added successfully!' });
  } catch (err) {
    console.error('Error calling sp_add_artifact_with_type:', err);
    res.status(500).json({ error: 'Failed to create artifact', details: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// DELETE: Delete an artifact
app.delete('/api/artifacts/:id', async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction(); 
    // Delete from all child tables first
    await connection.execute('DELETE FROM Painting WHERE artifact_id = ?', [id]);
    await connection.execute('DELETE FROM Sculpture WHERE artifact_id = ?', [id]);
    await connection.execute('DELETE FROM Scripture WHERE artifact_id = ?', [id]);
    await connection.execute('DELETE FROM WeaponTool WHERE artifact_id = ?', [id]);
    await connection.execute('DELETE FROM Exhibition_Artifact WHERE artifact_id = ?', [id]);
    
    // Now delete from the parent table
    const [result] = await connection.execute('DELETE FROM Artifact WHERE artifact_id = ?', [id]);
    
    await connection.commit();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Artifact not found' });
    }
    res.json({ success: true, message: 'Artifact deleted' });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error deleting artifact:', err);
    res.status(500).json({ error: 'Failed to delete artifact' });
  } finally {
    if (connection) connection.release();
  }
});

// --- ADMIN: SPONSORS (CRUD) ---

// GET: All sponsors (for admin list)
app.get('/api/sponsors/all', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute("SELECT * FROM Sponsor ORDER BY name");
    res.json(rows);
  } catch (err)
 {
    console.error('Error fetching sponsors:', err);
    res.status(500).json({ error: 'Failed to fetch sponsors' });
  } finally {
    if (connection) connection.release();
  }
});

// PUT: Update a sponsor
app.put('/api/sponsors/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, contact_no, email } = req.body;
  
  if (!name || !type || !contact_no || !email) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const sql = 'UPDATE Sponsor SET name = ?, type = ?, contact_no = ?, email = ? WHERE sponsor_id = ?';
    const [result] = await connection.execute(sql, [name, type, contact_no, email, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }
    res.json({ success: true, message: 'Sponsor updated' });
  } catch (err) {
    console.error('Error updating sponsor:', err);
    res.status(500).json({ error: 'Failed to update sponsor' });
  } finally {
    if (connection) connection.release();
  }
});

// DELETE: Delete a sponsor
app.delete('/api/sponsors/:id', async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await pool.getConnection();
    // Must delete from junction table first
    await connection.beginTransaction();
    await connection.execute('DELETE FROM Exhibition_Sponsor WHERE sponsor_id = ?', [id]);
    const [result] = await connection.execute('DELETE FROM Sponsor WHERE sponsor_id = ?', [id]);
    await connection.commit();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }
    res.json({ success: true, message: 'Sponsor deleted' });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error deleting sponsor:', err);
    res.status(500).json({ error: 'Failed to delete sponsor' });
  } finally {
    if (connection) connection.release();
  }
});


// --- ADMIN: REPORTS (using Views, Procedures) ---

// GET: Report 1 (JOIN) - Uses your new View
app.get('/api/reports/artifacts-with-museums', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    // Using your view: artifact_classification
    const sql = `SELECT artifact_name, origin, era, museum_name FROM artifact_classification;`;
    const [rows] = await connection.execute(sql);
    res.json(rows);
  } catch (err) {
    console.error('Error executing join query:', err);
    res.status(500).json({ error: 'Failed to fetch report data' });
  } finally {
    if (connection) connection.release();
  }
});

// GET: Report 2 (AGGREGATE) - Uses your new View
app.get('/api/reports/exhibition-budgets', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
     // Using your view: exhibition_sponsorship_details
    const sql = `SELECT exhibition_name, num_sponsors, total_budget 
                 FROM exhibition_sponsorship_details 
                 ORDER BY total_budget DESC;`;
    const [rows] = await connection.execute(sql);
    res.json(rows);
  } catch (err) {
    console.error('Error executing aggregate query:', err);
    res.status(500).json({ error: 'Failed to fetch report data' });
  } finally {
    if (connection) connection.release();
  }
});

// GET: Report 3 (NESTED QUERY)
app.get('/api/reports/visitors-for-exhibition', async (req, res) => {
  const exhibitionName = req.query.name;
  if (!exhibitionName) {
    return res.status(400).json({ error: 'Exhibition name query parameter is required.' });
  }
  
  let connection;
  try {
    connection = await pool.getConnection();
    const sql = `
      SELECT name, city 
      FROM Visitor
      WHERE visitor_id IN (
        SELECT visitor_id 
        FROM Visitor_Exhibition 
        WHERE exhibition_id = (
          SELECT exhibition_id 
          FROM Exhibition 
          WHERE name = ?
        )
      );
    `;
    const [rows] = await connection.execute(sql, [exhibitionName]);
    res.json(rows);
  } catch (err) {
    console.error('Error executing nested query:', err);
    res.status(500).json({ error: 'Failed to fetch report data' });
  } finally {
    if (connection) connection.release();
  }
});

// GET: Report 4 (STORED PROCEDURE)
app.get('/api/reports/exhibition-detail/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await pool.getConnection();
        
        // This query calls your stored procedure and can return multiple result sets
        const [results] = await connection.query('CALL sp_exhibition_complete_report(?)', [id]);
        
        // The result is an array. 
        // [0] = main details, [1] = artifacts, [2] = sponsors, [3] = OKPacket
        const report = {
            details: results[0][0] || null,
            artifacts: results[1] || [],
            sponsors: results[2] || []
        };
        
        res.json(report);
    } catch (err) {
        console.error('Error calling sp_exhibition_complete_report:', err);
        res.status(500).json({ error: 'Failed to fetch detailed report' });
    } finally {
        if (connection) connection.release();
    }
});


// --- Start Server ---
app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});