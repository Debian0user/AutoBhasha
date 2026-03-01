const pool = require("./db");

async function initDatabase() {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        phone_no VARCHAR(15) NOT NULL
      );
    `);

    // Acquired sequence + table
    await pool.query(`
      CREATE SEQUENCE IF NOT EXISTS acquired_id_seq;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS acquired (
        serial_no         INTEGER NOT NULL,
        acquired_date     DATE NOT NULL,
        eng_received_from TEXT NOT NULL,
        hi_received_from  TEXT NOT NULL,
        letter_no         VARCHAR(255) NOT NULL,
        eng_subject       TEXT NOT NULL,
        hi_subject        TEXT NOT NULL,
        user_id           INTEGER,
        id                INTEGER NOT NULL DEFAULT nextval('acquired_id_seq'),
        created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        language          VARCHAR(20),
        PRIMARY KEY (id),
        CONSTRAINT acquired_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES users(user_id)
      );
    `);

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_acquired_date      ON acquired(acquired_date);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_acquired_serial_no ON acquired(serial_no);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_acquired_user_id   ON acquired(user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_id            ON acquired(user_id);`);

    // Despatch sequence + table
    await pool.query(`
      CREATE SEQUENCE IF NOT EXISTS despatch_id_seq;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS despatch (
        serial_no        INTEGER NOT NULL,
        date             DATE NOT NULL,
        eng_to_whom_sent VARCHAR(255) NOT NULL,
        hi_to_whom_sent  VARCHAR(255) NOT NULL,
        eng_place        VARCHAR(255) NOT NULL,
        hi_place         VARCHAR(255) NOT NULL,
        eng_subject      VARCHAR(255) NOT NULL,
        hi_subject       VARCHAR(255) NOT NULL,
        eng_sent_by      VARCHAR(255) NOT NULL,
        hi_sent_by       VARCHAR(255) NOT NULL,
        user_id          INTEGER,
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        id               INTEGER NOT NULL DEFAULT nextval('despatch_id_seq'),
        letter_no        VARCHAR(100),
        delivery_method  VARCHAR(50),
        language         VARCHAR(20),
        PRIMARY KEY (id),
        CONSTRAINT despatch_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES users(user_id)
      );
    `);

    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
  }
}

module.exports = initDatabase;
