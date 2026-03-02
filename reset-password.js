// reset-password.js
require('dotenv').config();
const { pool } = require('./database');
const bcrypt = require('bcryptjs');

const resetPassword = async () => {
    const username = 'jharrison';
    const newPassword = 'America@123';

    try {
        console.log(`Resetting password for user: ${username}...`);
        
        // 1. Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // 2. Update the user record
        const result = await pool.query(
            'UPDATE users SET password = $1 WHERE username = $2 RETURNING id',
            [hashedPassword, username]
        );

        if (result.rowCount === 0) {
            console.log(`❌ User '${username}' not found. Please run setup-user.js first.`);
        } else {
            console.log('✅ Password updated in database.');
            
            // 3. Verify immediately to ensure it works
            const verify = await pool.query('SELECT password FROM users WHERE username = $1', [username]);
            const isMatch = await bcrypt.compare(newPassword, verify.rows[0].password);
            
            if (isMatch) {
                console.log('✅ Verification PASSED: You can now log in with "America@123"');
            } else {
                console.log('❌ Verification FAILED: Something is wrong with bcrypt hashing.');
            }
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

resetPassword();
