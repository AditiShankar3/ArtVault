/*
=====================================================
  ArtVault Museum Database Setup Script
  This script creates all tables and inserts all seed data.
  Run this *after* creating the 'museum_db' database
  and the 'museum' user.
=====================================================
*/
USE museum_db;

-- =====================================================
-- 1. CORE TABLES (No Foreign Keys)
-- =====================================================

-- 1a. Museum
CREATE TABLE Museum (
    museum_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    type VARCHAR(50),
    established_year YEAR
);

-- 1b. Visitor (No FK)
-- NOTE: visitor_id is now AUTO_INCREMENT
CREATE TABLE Visitor (
    visitor_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    age INT,
    gender ENUM('M','F','Other'),
    city VARCHAR(100)
);

-- 1c. Sponsor (No FK)
-- NOTE: sponsor_id is now AUTO_INCREMENT and email column is added
CREATE TABLE Sponsor (
    sponsor_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    type VARCHAR(50),
    contact_no VARCHAR(20),
    email VARCHAR(100)
);

-- 1d. Artist (No FK)
CREATE TABLE Artist (
    artist_id INT PRIMARY KEY,
    name VARCHAR(100),
    nationality VARCHAR(100),
    style VARCHAR(50),
    era VARCHAR(50)
);

-- 1e. Archeologist (No FK)
CREATE TABLE Archeologist (
    archeologist_id INT PRIMARY KEY,
    name VARCHAR(100),
    nationality VARCHAR(100)
);

-- =====================================================
-- 2. TABLES DEPENDENT ON MUSEUM
-- =====================================================

-- 2a. Staff (depends on Museum)
CREATE TABLE Staff (
    staff_id INT PRIMARY KEY,
    name VARCHAR(100),
    role VARCHAR(50),
    salary DECIMAL(10,2),
    supervisor_id INT,
    museum_id INT,
    FOREIGN KEY (supervisor_id) REFERENCES Staff(staff_id),
    FOREIGN KEY (museum_id) REFERENCES Museum(museum_id)
);

-- 2b. Exhibition (depends on Museum)
CREATE TABLE Exhibition (
    exhibition_id INT PRIMARY KEY,
    name VARCHAR(100),
    theme VARCHAR(100),
    start_date DATE,
    end_date DATE,
    museum_id INT,
    FOREIGN KEY (museum_id) REFERENCES Museum(museum_id)
);

-- 2c. Artifact (depends on Museum)
CREATE TABLE Artifact (
    artifact_id INT PRIMARY KEY,
    name VARCHAR(100),
    origin VARCHAR(100),
    era VARCHAR(100),
    museum_id INT,
    FOREIGN KEY (museum_id) REFERENCES Museum(museum_id)
);

-- =====================================================
-- 3. JUNCTION/RELATIONSHIP TABLES
-- =====================================================

-- 3a. Visitor visits Exhibition (M:N)
CREATE TABLE Visitor_Exhibition (
    visitor_id INT,
    exhibition_id INT,
    PRIMARY KEY(visitor_id, exhibition_id),
    FOREIGN KEY(visitor_id) REFERENCES Visitor(visitor_id),
    FOREIGN KEY(exhibition_id) REFERENCES Exhibition(exhibition_id)
);

-- 3b. Exhibition has Sponsors (M:N) with budget
CREATE TABLE Exhibition_Sponsor (
    exhibition_id INT,
    sponsor_id INT,
    budget DECIMAL(12,2) DEFAULT NULL,
    PRIMARY KEY(exhibition_id, sponsor_id),
    FOREIGN KEY(exhibition_id) REFERENCES Exhibition(exhibition_id),
    FOREIGN KEY(sponsor_id) REFERENCES Sponsor(sponsor_id)
);

-- 3c. Exhibition displays Artifact (M:N)
CREATE TABLE Exhibition_Artifact (
    exhibition_id INT,
    artifact_id INT,
    PRIMARY KEY(exhibition_id, artifact_id),
    FOREIGN KEY(exhibition_id) REFERENCES Exhibition(exhibition_id),
    FOREIGN KEY(artifact_id) REFERENCES Artifact(artifact_id)
);

-- =====================================================
-- 4. ARTIFACT SUBTYPES
-- =====================================================

-- 4a. Painting (depends on Artifact and Artist)
CREATE TABLE Painting (
    artifact_id INT PRIMARY KEY,
    medium VARCHAR(50),
    style VARCHAR(50),
    artist_id INT,
    FOREIGN KEY (artifact_id) REFERENCES Artifact(artifact_id),
    FOREIGN KEY (artist_id) REFERENCES Artist(artist_id)
);

-- 4b. Sculpture (depends on Artifact and Artist)
CREATE TABLE Sculpture (
    artifact_id INT PRIMARY KEY,
    material VARCHAR(50),
    ht DECIMAL(5,2),
    wt DECIMAL(5,2),
    artist_id INT,
    FOREIGN KEY (artifact_id) REFERENCES Artifact(artifact_id),
    FOREIGN KEY (artist_id) REFERENCES Artist(artist_id)
);

-- 4c. Scripture (depends on Artifact and Archeologist)
CREATE TABLE Scripture (
    artifact_id INT PRIMARY KEY,
    language VARCHAR(50),
    script_type VARCHAR(50),
    archeologist_id INT,
    FOREIGN KEY (artifact_id) REFERENCES Artifact(artifact_id),
    FOREIGN KEY (archeologist_id) REFERENCES Archeologist(archeologist_id)
);

-- 4d. WeaponTool (depends on Artifact and Archeologist)
CREATE TABLE WeaponTool (
    artifact_id INT PRIMARY KEY,
    material VARCHAR(50),
    type VARCHAR(50),
    archeologist_id INT,
    FOREIGN KEY (artifact_id) REFERENCES Artifact(artifact_id),
    FOREIGN KEY (archeologist_id) REFERENCES Archeologist(archeologist_id)
);

-- =====================================================
-- 5. INSERT DATA - CORE ENTITIES FIRST
-- =====================================================

-- 5a. Insert Museums
INSERT INTO Museum (museum_id, name, city, state, type, established_year) VALUES
(1, 'National Museum, Delhi', 'New Delhi', 'Delhi', 'National', 1949),
(2, 'National Gallery of Modern Art', 'New Delhi', 'Delhi', 'Art', 1954),
(3, 'Visvesvaraya Industrial and Technological Museum', 'Bengaluru', 'Karnataka', 'Science & Technology', 1962),
(4, 'Salar Jung Museum', 'Hyderabad', 'Telangana', 'Museum & Art Gallery', 1951),
(5, 'Chhatrapati Shivaji Maharaj Vastu Sangrahalaya', 'Mumbai', 'Maharashtra', 'Art & History', 1922);

-- 5b. Insert Visitors
INSERT INTO Visitor (visitor_id, name, age, gender, city) VALUES
(1001, 'Aisha Singh', 28, 'F', 'New Delhi'),
(1002, 'Rahul Sharma', 35, 'M', 'Mumbai'),
(1003, 'Priya Nair', 22, 'F', 'Bengaluru'),
(1004, 'Vikram Patel', 40, 'M', 'Ahmedabad'),
(1005, 'Fatima Khan', 30, 'F', 'Hyderabad'),
(1006, 'Anand Reddy', 27, 'M', 'Hyderabad'),
(1007, 'Geeta Menon', 34, 'F', 'Chennai'),
(1008, 'Sumanth Iyer', 19, 'M', 'Bengaluru'),
(1009, 'Kavita Rao', 45, 'F', 'Pune'),
(1010, 'Omar Sheikh', 50, 'M', 'Lucknow'),
(1011, 'Deepa Nair', 31, 'F', 'Kochi'),
(1012, 'Harish Bhat', 38, 'M', 'Mumbai'),
(1013, 'Leela Chopra', 62, 'F', 'New Delhi'),
(1014, 'Manoj Kumar', 29, 'M', 'Varanasi'),
(1015, 'Shweta Gupta', 24, 'F', 'Noida'),
(1016, 'Tarun Malhotra', 41, 'M', 'Jaipur'),
(1017, 'Rina Dutta', 55, 'F', 'Kolkata'),
(1018, 'Iqbal Khan', 36, 'M', 'Srinagar'),
(1019, 'Nidhi Jha', 21, 'F', 'Patna'),
(1020, 'Venkatesh Rao', 43, 'M', 'Visakhapatnam'),
(1021, 'Maya Pillai', 28, 'F', 'Thiruvananthapuram'),
(1022, 'Arjun Mehra', 33, 'M', 'Bhopal'),
(1023, 'Priyanka Singh', 26, 'F', 'Guwahati'),
(1024, 'Saurabh Verma', 30, 'M', 'Indore'),
(1025, 'Bina Patel', 47, 'F', 'Surat');

-- 5c. Insert Sponsors
-- NOTE: This INSERT statement now includes the 'email' column and data directly
INSERT INTO Sponsor (sponsor_id, name, type, contact_no, email) VALUES
(301, 'Tata Trusts', 'Philanthropy', '011-23456789', 'contact@tatatrusts.com'),
(302, 'Birla Foundation', 'Corporate', '022-98765432', 'info@birlafoundation.org'),
(303, 'State Cultural Board', 'Government', '080-12345678', 'contact@statecultural.gov'),
(304, 'Infosys Foundation', 'Corporate', '080-87654321', 'foundation@infosys.com'),
(305, 'Heritage India NGO', 'NGO', '040-76543210', 'info@heritageindia.org'),
(306, 'Aditya Birla Group', 'Corporate', '022-33445566', 'contact@adityabirla.com');

-- 5d. Insert Artists
INSERT INTO Artist (artist_id, name, nationality, style, era) VALUES
(9001, 'Raja Ravi Varma', 'Indian', 'Realism / Indian Mythology', '19th century'),
(9002, 'Abanindranath Tagore', 'Indian', 'Bengal School of Art', '20th century'),
(9003, 'Jamini Roy', 'Indian', 'Folk / Modernist', '20th century'),
(9004, 'Amrita Sher-Gil', 'Indian', 'Modern Art', '20th century'),
(9005, 'Benzoni', 'Italian', 'Neoclassical Sculpture', '19th century'),
(9006, 'Nandalal Bose', 'Indian', 'Bengal School', '20th century'),
(9007, 'K. G. Subramanyan', 'Indian', 'Modern-Folk', '20th century'),
(9008, 'Tyeb Mehta', 'Indian', 'Modernist', '20th century'),
(9009, 'S. H. Raza', 'Indian', 'Abstract Modernism', '20th century');

-- 5e. Insert Archeologists
INSERT INTO Archeologist (archeologist_id, name, nationality) VALUES
(8001, 'Dr. Raghunath Prasad', 'Indian'),
(8002, 'Prof. Anya Petrova', 'Russian'),
(8003, 'Dr. Samuel Johnson', 'British'),
(8004, 'Dr. Chen Wei', 'Chinese'),
(8005, 'Dr. Amina El-Sayed', 'Egyptian');

-- =====================================================
-- 6. INSERT DATA - DEPENDENT ENTITIES
-- =====================================================

-- 6a. Insert Staff
INSERT INTO Staff (staff_id, name, role, salary, supervisor_id, museum_id) VALUES
(101, 'Ravi Kumar', 'Director', 200000.00, NULL, 1),
(102, 'Meera Desai', 'Curator', 120000.00, 101, 1),
(201, 'Sunita Sharma', 'Director', 190000.00, NULL, 2),
(202, 'Rajat Banerjee', 'Curator', 110000.00, 201, 2),
(301, 'Lakshmi Narayanan', 'Director', 180000.00, NULL, 3),
(302, 'Vijay Kumar', 'Scientist', 100000.00, 301, 3),
(401, 'Ayesha Khan', 'Director', 195000.00, NULL, 4),
(402, 'Mohammed Ali', 'Conservator', 105000.00, 401, 4),
(501, 'Siddharth Mehta', 'Director', 185000.00, NULL, 5),
(502, 'Anjali Rao', 'Curator', 100000.00, 501, 5);

-- 6b. Insert Exhibitions
INSERT INTO Exhibition (exhibition_id, name, theme, start_date, end_date, museum_id) VALUES
(501, 'Treasures of Ancient India', 'Archaeology & Antiquity', '2025-01-01', '2025-06-30', 1),
(502, 'Masters of Modern Indian Art', 'Ravi Varma & Beyond', '2025-02-15', '2025-08-15', 2),
(503, 'Science Wonders', 'Technology & Innovation in India', '2025-03-01', '2025-09-30', 3),
(504, 'Persian & Islamic Art', 'Manuscripts & Artifacts', '2025-04-01', '2025-10-31', 4),
(505, 'Rajput & Maratha Heritage', 'Regional History & Art', '2025-05-01', '2025-11-30', 5);

-- 6c. Insert Artifacts (ALL OF THEM)
INSERT INTO Artifact (artifact_id, name, origin, era, museum_id) VALUES
(10001, 'Dancing Girl Replica', 'Indus Valley (Mohenjo-daro)', 'c. 2500 BCE', 1),
(10002, 'Ravi Varma''s Shakuntala', 'Kerala', '19th century', 2),
(10003, 'Vintage Steam Engine Model', 'Bengaluru', '20th century', 3),
(10004, 'Quran Manuscript', 'Persia', '16th century', 4),
(10005, 'Veiled Rebecca', 'Italy (imported)', '19th century', 4),
(10006, 'Maratha Sword', 'Maharashtra', '18th century', 5),
(10007, 'Nataraja Bronze', 'Tamil Nadu', '10th century', 1),
(10008, 'Abstract Canvas', 'Various', '20th century', 2),
(10009, 'Ancient Manuscript', 'South India', '13th century', 1),
(10010, 'Prehistoric Tool', 'North India', 'Bronze Age', 5),
(10011, 'Historical Bust', 'Afghanistan', '2nd century', 4),
(10012, 'Medieval Lock', 'West India', '15th century', 3),
(10013, 'Illuminated Scroll', 'Middle East', '17th century', 4),
(10014, 'Bharhut Stupa Relief Fragment', 'Madhya Pradesh', '2nd century BCE', 1),
(10015, 'Raja Ravi Varma Sketch Study', 'Kerala', '19th century', 2),
(10016, 'Early Steam Turbine Prototype Model', 'Mysuru', '20th century', 3),
(10017, 'Bidriware Floral Ewer', 'Bidar, Karnataka', '17th century', 5),
(10018, 'Mughal Miniature Portrait', 'Agra', '17th century', 4),
(10019, 'Ashokan Rock Edict Replica', 'Sanchi, Madhya Pradesh', '3rd century BCE', 1),
(10020, 'Terracotta Horse Folk Sculpture', 'Bankura, West Bengal', '19th century', 2);

-- =====================================================
-- 7. INSERT DATA - JUNCTION TABLES
-- =====================================================

-- 7a. Insert Visitor_Exhibition mappings
INSERT INTO Visitor_Exhibition (visitor_id, exhibition_id) VALUES
(1001, 501), (1001, 502), (1002, 505), (1003, 503), (1004, 502), (1005, 504),
(1005, 505), (1003, 501), (1006, 503), (1007, 502), (1007, 501), (1008, 503),
(1009, 505), (1010, 501), (1011, 504), (1012, 503), (1013, 501), (1014, 505),
(1015, 502), (1016, 503), (1017, 504), (1018, 501), (1019, 502), (1020, 503),
(1021, 502), (1022, 501), (1023, 505), (1024, 503), (1025, 504);

-- 7b. Insert Exhibition_Sponsor with budgets
INSERT INTO Exhibition_Sponsor (exhibition_id, sponsor_id, budget) VALUES
(501, 301, 5000000.00), (501, 305, 200000.00), (501, 306, 750000.00),
(502, 302, 3200000.00), (502, 305, 150000.00), (503, 304, 2500000.00),
(503, 306, 450000.00), (504, 301, 1100000.00), (504, 303, 650000.00),
(505, 302, 1750000.00), (505, 305, 350000.00), (505, 306, 600000.00);

-- 7c. Insert Exhibition_Artifact mappings
INSERT INTO Exhibition_Artifact (exhibition_id, artifact_id) VALUES
(501, 10001), (501, 10007), (501, 10014), (501, 10019),
(502, 10002), (502, 10015), (502, 10020), (503, 10003),
(503, 10016), (504, 10004), (504, 10005), (504, 10018),
(505, 10006), (505, 10017);

-- =====================================================
-- 8. INSERT DATA - ARTIFACT SUBTYPES
-- =====================================================

-- 8a. Insert Paintings
INSERT INTO Painting (artifact_id, medium, style, artist_id) VALUES
(10002, 'Oil on Canvas', 'Realism', 9001),
(10008, 'Oil on Canvas', 'Abstract', 9004),
(10015, 'Charcoal on Paper', 'Academic Realism', 9006),
(10020, 'Natural Pigment', 'Folk Tribal Art', 9007);

-- 8b. Insert Sculptures
INSERT INTO Sculpture (artifact_id, material, ht, wt, artist_id) VALUES
(10001, 'Bronze', 10.5, 0.5, NULL),
(10005, 'Marble', 165.0, 300.0, 9005),
(10007, 'Bronze', 120.0, 80.0, NULL),
(10011, 'Schist', 65.0, 50.0, NULL),
(10014, 'Sandstone', 45.00, 30.00, NULL),
(10017, 'Bidri Metal Alloy', 28.00, 6.00, NULL);

-- 8c. Insert Scriptures
INSERT INTO Scripture (artifact_id, language, script_type, archeologist_id) VALUES
(10004, 'Arabic', 'Naskh Calligraphy', 8002),
(10009, 'Sanskrit', 'Grantha Script', 8001),
(10013, 'Persian', 'Nastaliq', 8002),
(10018, 'Persian', 'Mughal Script', 8002);

-- 8d. Insert WeaponTools
INSERT INTO WeaponTool (artifact_id, material, type, archeologist_id) VALUES
(10003, 'Metal/Mixed', 'Model/Tool', 8003),
(10006, 'Steel/Iron', 'Sword/Weapon', 8001),
(10010, 'Bronze', 'Axe/Tool', 8004),
(10012, 'Iron', 'Handcrafted Lock', 8003),
(10016, 'Metal/Brass', 'Model/Tool', 8003);

-- =====================================================
-- 9. SET NEXT AUTO_INCREMENT VALUES
-- =====================================================

-- NOTE: This ensures that new records created by the app
-- (like new visitors or sponsors) do not conflict with
-- the manually inserted IDs.

ALTER TABLE Visitor AUTO_INCREMENT = 1026; -- Next ID after 1025
ALTER TABLE Sponsor AUTO_INCREMENT = 307;  -- Next ID after 306

-- =====================================================
-- SCRIPT COMPLETE
-- =====================================================
