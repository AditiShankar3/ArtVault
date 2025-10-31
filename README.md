#ARTVAULT - DBMS PROJECT 

## 🚀 Database Setup (First-Time Only)

Before running the application, you must set up the MySQL database and user.

1.  Log in to your MySQL server as a **`root`** user.
2.  Run the following commands to create a new user named `museum` with the password `ArtVault` and give it full permissions on your new database:

    ```sql
    CREATE DATABASE museum_db;
    
    CREATE USER 'museum'@'localhost' IDENTIFIED BY 'ArtVault';
    GRANT ALL PRIVILEGES ON museum_db.* TO 'museum'@'localhost';
    FLUSH PRIVILEGES;
    ```

3.  Once the user is created, you can run the main setup script to create all the tables and insert the data:

    ```bash
    # Log in as the new user
    mysql -u museum -p museum_db < database_setup.sql
    
    # (Enter 'ArtVault' when prompted for the password)
    ```
