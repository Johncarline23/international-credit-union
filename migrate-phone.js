require('dotenv').config();
const { Pool } = require('pg');

const addPhoneColumn = async () => {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Adding phone column to users table...');
        
        // Try to add the column
        await pool.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
        `);
        
        console.log('✅ Phone column added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
};

addPhoneColumn();
