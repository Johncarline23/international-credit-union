require('dotenv').config();
const db = require('./database');

const addPhoneColumn = async () => {
    try {
        console.log('Adding phone column to users table...');
        
        // Check if column already exists
        const result = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'phone'
            );
        `);
        
        if (result.rows[0].exists) {
            console.log('Phone column already exists.');
        } else {
            // Add the phone column
            await db.query(`
                ALTER TABLE users ADD COLUMN phone VARCHAR(20);
            `);
            console.log('✅ Phone column added successfully!');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error adding phone column:', error);
        process.exit(1);
    }
};

addPhoneColumn();
