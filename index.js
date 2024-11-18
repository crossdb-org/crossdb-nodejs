const crossdb = require('bindings')('crossdb');  // Collega l'addon compilato

class CrossDB {
  constructor(dbPath) {
    this.conn = new crossdb.Connection(dbPath);
  }

  exec(sql) {
    return this.conn.exec(sql);
  }

  close() {
    this.conn.close();
  }

  begin() {
    this.conn.begin();
  }

  commit() {
    this.conn.commit();
  }

  rollback() {
    this.conn.rollback();
  }
}

module.exports = CrossDB;
