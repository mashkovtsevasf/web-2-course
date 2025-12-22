const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../database/bestshop.db');
const SCHEMA_PATH = path.join(__dirname, '../../database/schema.sql');
const SEED_PATH = path.join(__dirname, '../../database/seed.sql');

let db = null;

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call init() first.');
  }
  return db;
}

function init() {
  return new Promise((resolve, reject) => {
    const dbExists = fs.existsSync(DB_PATH);
    
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        return reject(err);
      }
      console.log('Connected to SQLite database');
      
      if (!dbExists) {
        console.log('Database does not exist. Creating schema...');
        createSchema()
          .then(() => {
            console.log('Schema created. Seeding database...');
            return seedDatabase();
          })
          .then(() => {
            console.log('Database initialized successfully');
            resolve();
          })
          .catch(reject);
      } else {
        console.log('Database already exists');
        resolve();
      }
    });
  });
}

function createSchema() {
  return new Promise((resolve, reject) => {
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    
    db.exec(schema, (err) => {
      if (err) {
        console.error('Error creating schema:', err);
        return reject(err);
      }
      resolve();
    });
  });
}

function seedDatabase() {
  return new Promise((resolve, reject) => {
    const seed = fs.readFileSync(SEED_PATH, 'utf8');
    
    db.exec(seed, (err) => {
      if (err) {
        console.error('Error seeding database:', err);
        return reject(err);
      }
      resolve();
    });
  });
}

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().all(sql, params, (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().get(sql, params, (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row);
    });
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().run(sql, params, function(err) {
      if (err) {
        return reject(err);
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function close() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          return reject(err);
        }
        console.log('Database connection closed');
        db = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
}

module.exports = {
  init,
  getDb,
  query,
  get,
  run,
  close
};




