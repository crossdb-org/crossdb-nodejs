// Import the 'bindings' module to link the compiled native addon 'crossdb'
const crossdb = require('bindings')('crossdb'); // Link the compiled addon 

// Define the CrossDB class to manage database operations
class CrossDB {
  /**
   * Constructor: initializes a new database connection
   * @param {string} dbPath - The path to the database file
   */
  constructor(dbPath) {
    this.conn = new crossdb.Connection(dbPath); // Create a new connection to the database
    this.pkgVersion = require('./package.json').version;
  }

  /**
   * Executes an SQL query on the database
   * @param {string} sql - The SQL query string to execute
   * @returns {*} - The result of the query execution
   */
  exec(sql) {
    return this.conn.exec(sql); // Execute the SQL query and return the result
  }

  /**
   * Closes the current database connection
   */
  close() {
    this.conn.close(); // Close the connection
  }

  /**
   * Begins a new database transaction
   */
  begin() {
    this.conn.begin(); // Start a new transaction
  }

  /**
   * Commits the current transaction
   */
  commit() {
    this.conn.commit(); // Commit the transaction
  }
  
    /**
     * Rollsback the current transaction
     */
    rollback() {
      this.conn.rollback(); // Rollback the transaction
    }
  
    /**
     * Get CroosDB version
     */
    version() {
      return {
        "CroosDB": this.conn.version(), // Get CroosDB version
        "Package": this.pkgVersion, // Node.js package version
        "Platform": process.platform // Platform information
      };
    }
}

// Export the CrossDB class as a module
module.exports = CrossDB;