const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = 3001; // This will be our backend server port

// --- Database Configuration ---
// !! IMPORTANT: Replace with your actual MySQL credentials
// Use environment variables in a real product!
const dbConfig = {
  host: 'localhost', // e.g., 'localhost'
  user: 'museum',
  password: '123',
  database: 'museum_db',
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// --- Middleware ---
// Enable CORS (Cross-Origin Resource Sharing) so your React app (on a different port)
// can make requests to this backend
app.use(cors());
// Add this more specific configuration
const corsOptions = {
  // IMPORTANT: Change this to your frontend's *exact* URL
  origin: 'http://localhost:8080', 
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json()); // To parse any JSON in request bodies (if you add POST/PUT routes)

// --- API Routes ---

// In server.js

/**
 * @route GET /api/artifacts
 * @desc Get all artifacts, with optional search.
 * @query search (string) - A search term to filter artifacts.
 */
app.get('/api/artifacts', async (req, res) => {
  // Get the search term, default to an empty string
  const { search = '' } = req.query;
  
  let connection;

  try {
    connection = await pool.getConnection();

    let sql;
    let queryParams = [];

    if (search) {
      // --- FIX 1: This query only runs if 'search' is NOT empty ---
      sql = `
        SELECT * FROM artifact 
        WHERE name LIKE ? 
           OR origin LIKE ? 
           OR era LIKE ?
      `;
      
      // --- FIX 2: This fixes your "starts with" requirement (e.g., "ra%") ---
      const searchTermWithWildcards = `${search}%`;
      queryParams = [searchTermWithWildcards, searchTermWithWildcards, searchTermWithWildcards];

    } else {
      // --- FIX 3: If 'search' is empty, get ALL artifacts ---
      sql = 'SELECT * FROM artifact';
    }

    const [rows] = await connection.execute(sql, queryParams);
    
    connection.release();
    res.json(rows);

  } catch (err) {
    console.error('Error fetching artifacts from database:', err);
    if (connection) connection.release(); // Make sure to release on error
    res.status(500).json({ error: 'Failed to fetch data from database' });
  }
});

// In server.js

// ... (after your existing /api/artifacts route)

/**
 * @route GET /api/search
 * @desc Perform a global search across artifacts, museums, and exhibitions.
 * @query q (string) - The global search term.
 */
app.get('/api/search', async (req, res) => {
  const { q = '' } = req.query;

  // Use the "starts with" logic (e.g., "ra%") as you requested
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

    // 3. Exhibitions Query (joining with museum to show its name)
    const exhibitionSql = `
      SELECT e.exhibition_id, e.name, e.theme, e.start_date, e.end_date, m.name AS museum_name
      FROM exhibition e
      JOIN Museum m ON e.museum_id = m.museum_id
      WHERE e.name LIKE ? OR e.theme LIKE ? OR m.name LIKE ?
    `;
    const exhibitionQuery = connection.execute(exhibitionSql, [searchTerm, searchTerm, searchTerm]);

    // Run all 3 queries in parallel for speed
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

// ... (rest of your routes)

// ⬇️ ADD THIS NEW ROUTE FOR MUSEUMS ⬇️
app.get('/api/museums', async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Using 'Museum' table as per your schema
    const sql = "SELECT * FROM Museum";

    const [rows] = await connection.execute(sql);
    connection.release();
    res.json(rows);
  } catch (err) {
    console.error('Error fetching museums:', err);
    res.status(500).json({ error: 'Failed to fetch museums' });
  }
});

// ⬇️ ADD THIS NEW POST ROUTE FOR SPONSORS ⬇️
app.post('/api/sponsors', async (req, res) => {
  // 1. Get the data from the frontend's request body
  const { name, type, contact, email } = req.body;

  // 2. Simple validation
  if (!name || !type || !contact || !email) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const connection = await pool.getConnection();
    
    // 3. Note: DB column is 'contact_no', form data is 'contact'
    const sql = 'INSERT INTO Sponsor (name, type, contact_no, email) VALUES (?, ?, ?, ?)';
    
    // 4. Execute the insert, passing the data as an array
    const [result] = await connection.execute(sql, [name, type, contact, email]);
    
    connection.release();
    
    // 5. Send back a success response
    res.status(201).json({ 
      success: true, 
      message: 'Sponsor registered!', 
      insertedId: result.insertId 
    });

  } catch (err) {
    console.error('Error inserting sponsor:', err);
    res.status(500).json({ error: 'Failed to register sponsor' });
  }
});

// ⬇️ ADD NEW ROUTE: GET CURRENT EXHIBITIONS ⬇️
app.get('/api/exhibitions', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // This query:
    // 1. Joins with Museum to get the museum's name
    // 2. Selects exhibitions where today's date (CURDATE()) is 
    //    between the start and end date.
    const sql = `
      SELECT 
        e.*, 
        m.name AS museum_name 
      FROM exhibition e
      JOIN Museum m ON e.museum_id = m.museum_id
      WHERE e.start_date <= CURDATE() AND e.end_date >= CURDATE();
    `;

    const [rows] = await connection.execute(sql);
    connection.release();
    res.json(rows);
  } catch (err) {
    console.error('Error fetching current exhibitions:', err);
    res.status(500).json({ error: 'Failed to fetch exhibitions' });
  }
});

// ⬇️ ADD NEW ROUTE: REGISTER VISITOR ⬇️
app.post('/api/register-visitor', async (req, res) => {
  // Get all data from the frontend
  const { name, age, gender, city, exhibition_id } = req.body;

  // Validation
  if (!name || !age || !gender || !city || !exhibition_id) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    // Start a transaction: two inserts must both succeed or both fail
    await connection.beginTransaction();

    // 1. Insert the new visitor
    const visitorSql = 'INSERT INTO visitor (name, age, gender, city) VALUES (?, ?, ?, ?)';
    const [visitorResult] = await connection.execute(visitorSql, [name, age, gender, city]);
    
    // Get the ID of the visitor we just created
    const newVisitorId = visitorResult.insertId;

    // 2. Link the visitor to the exhibition
    const linkSql = 'INSERT INTO visitor_exhibition (visitor_id, exhibition_id) VALUES (?, ?)';
    await connection.execute(linkSql, [newVisitorId, exhibition_id]);

    // If both inserts worked, commit the changes
    await connection.commit();
    
    res.status(201).json({ success: true, message: 'Visitor registered!' });

  } catch (err) {
    // If anything went wrong, roll back all changes
    if (connection) await connection.rollback();
    console.error('Error registering visitor:', err);
    res.status(500).json({ error: 'Failed to register visitor' });
  } finally {
    // Always release the connection
    if (connection) connection.release();
  }
});

// --- Start the Server ---
app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
