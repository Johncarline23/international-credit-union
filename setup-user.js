require('dotenv').config();
const db = require('./database');
const bcrypt = require('bcryptjs');

const setupUser = async () => {
    try {
        console.log('Starting user setup...');
        
        // User data
        const username = 'jharrison';
        const password = 'America@123';
        const fullName = 'Joseph Harrison';
        const email = 'JosephHarrison@gmail.com';
        const phone = '7037697003';
        
        // Check if user already exists and delete if so
        console.log('Checking if user already exists...');
        const existingUser = await db.query('SELECT id FROM users WHERE username = $1', [username]);
        if (existingUser.rows.length > 0) {
            const existingUserId = existingUser.rows[0].id;
            console.log('User already exists. Deleting old data...');
            // Delete transactions first (due to foreign key constraints)
            await db.query('DELETE FROM transactions WHERE account_id IN (SELECT id FROM accounts WHERE user_id = $1)', [existingUserId]);
            // Delete accounts
            await db.query('DELETE FROM accounts WHERE user_id = $1', [existingUserId]);
            // Delete user
            await db.query('DELETE FROM users WHERE id = $1', [existingUserId]);
            console.log('Old user data deleted.');
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        console.log('Creating user...');
        const userRes = await db.query(
            'INSERT INTO users (username, password, full_name, email, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [username, hashedPassword, fullName, email, phone]
        );
        
        const userId = userRes.rows[0].id;
        console.log(`User created with ID: ${userId}`);
        
        // Create Checking Account
        console.log('Creating Checking Account...');
        const checkingRes = await db.query(
            'INSERT INTO accounts (user_id, account_name, account_number, type, balance) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [userId, 'Checking Account', '157525054662', 'Checking', 1800500.00]
        );
        const checkingAccountId = checkingRes.rows[0].id;
        console.log(`Checking Account created with ID: ${checkingAccountId}`);
        
        // Create Savings Account
        console.log('Creating Savings Account...');
        const savingsRes = await db.query(
            'INSERT INTO accounts (user_id, account_name, account_number, type, balance) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [userId, 'Savings Account', '157525054664', 'Savings', 212071800.00]
        );
        const savingsAccountId = savingsRes.rows[0].id;
        console.log(`Savings Account created with ID: ${savingsAccountId}`);
        
        // Create transaction history for Checking Account
        console.log('Creating transaction history for Checking Account...');
        const checkingTransactions = [
            { type: 'Credit', description: 'Direct Deposit - Payroll', amount: 5000.00, daysAgo: 35 },
            { type: 'Credit', description: 'Direct Deposit - Payroll', amount: 5000.00, daysAgo: 28 },
            { type: 'Credit', description: 'Direct Deposit - Payroll', amount: 5000.00, daysAgo: 21 },
            { type: 'Credit', description: 'Direct Deposit - Payroll', amount: 5000.00, daysAgo: 14 },
            { type: 'Credit', description: 'Direct Deposit - Payroll', amount: 5000.00, daysAgo: 7 },
            { type: 'Debit', description: 'Starbucks Coffee', amount: 6.50, daysAgo: 33 },
            { type: 'Debit', description: 'Amazon Purchase', amount: 127.99, daysAgo: 30 },
            { type: 'Debit', description: 'Walmart Grocery', amount: 89.47, daysAgo: 25 },
            { type: 'Debit', description: 'Gas Station', amount: 45.00, daysAgo: 20 },
            { type: 'Debit', description: 'Restaurant Dinner', amount: 67.82, daysAgo: 15 },
            { type: 'Debit', description: 'Netflix Subscription', amount: 15.99, daysAgo: 10 },
            { type: 'Credit', description: 'Zelle Transfer from Friend', amount: 200.00, daysAgo: 12 },
            { type: 'Debit', description: 'Transfer to Savings', amount: 1000.00, daysAgo: 5 },
            { type: 'Debit', description: 'ATM Withdrawal', amount: 200.00, daysAgo: 3 },
            { type: 'Credit', description: 'Refund - Electronics Return', amount: 299.99, daysAgo: 2 },
            { type: 'Debit', description: 'Insurance Payment', amount: 150.00, daysAgo: 1 },
        ];
        
        for (const trans of checkingTransactions) {
            const date = new Date();
            date.setDate(date.getDate() - trans.daysAgo);
            await db.query(
                'INSERT INTO transactions (account_id, type, description, amount, date) VALUES ($1, $2, $3, $4, $5)',
                [checkingAccountId, trans.type, trans.description, trans.amount, date]
            );
        }
        console.log(`Created ${checkingTransactions.length} transactions for Checking Account`);
        
        // Create transaction history for Savings Account
        console.log('Creating transaction history for Savings Account...');
        const savingsTransactions = [
            { type: 'Credit', description: 'Initial Deposit', amount: 100000.00, daysAgo: 365 },
            { type: 'Credit', description: 'Monthly Transfer from Checking', amount: 5000.00, daysAgo: 358 },
            { type: 'Credit', description: 'Monthly Transfer from Checking', amount: 5000.00, daysAgo: 330 },
            { type: 'Credit', description: 'Monthly Transfer from Checking', amount: 5000.00, daysAgo: 300 },
            { type: 'Credit', description: 'Monthly Transfer from Checking', amount: 5000.00, daysAgo: 270 },
            { type: 'Credit', description: 'Monthly Transfer from Checking', amount: 5000.00, daysAgo: 240 },
            { type: 'Credit', description: 'Monthly Transfer from Checking', amount: 5000.00, daysAgo: 210 },
            { type: 'Credit', description: 'Monthly Transfer from Checking', amount: 5000.00, daysAgo: 180 },
            { type: 'Credit', description: 'Monthly Transfer from Checking', amount: 5000.00, daysAgo: 150 },
            { type: 'Credit', description: 'Monthly Transfer from Checking', amount: 5000.00, daysAgo: 120 },
            { type: 'Credit', description: 'Monthly Transfer from Checking', amount: 5000.00, daysAgo: 90 },
            { type: 'Credit', description: 'Monthly Transfer from Checking', amount: 5000.00, daysAgo: 60 },
            { type: 'Credit', description: 'Monthly Transfer from Checking', amount: 5000.00, daysAgo: 30 },
            { type: 'Credit', description: 'Interest Payment (Monthly)', amount: 450.00, daysAgo: 25 },
            { type: 'Credit', description: 'Interest Payment (Monthly)', amount: 450.00, daysAgo: 55 },
            { type: 'Credit', description: 'Interest Payment (Monthly)', amount: 450.00, daysAgo: 85 },
            { type: 'Credit', description: 'Interest Payment (Monthly)', amount: 450.00, daysAgo: 115 },
            { type: 'Credit', description: 'Interest Payment (Monthly)', amount: 450.00, daysAgo: 145 },
            { type: 'Credit', description: 'Bonus - Year End Savings', amount: 10000.00, daysAgo: 45 },
            { type: 'Debit', description: 'Emergency Withdrawal', amount: 50000.00, daysAgo: 38 },
            { type: 'Credit', description: 'Replenishment Transfer', amount: 50000.00, daysAgo: 35 },
            { type: 'Credit', description: 'Investment Returns Deposit', amount: 2071800.00, daysAgo: 10 },
        ];
        
        for (const trans of savingsTransactions) {
            const date = new Date();
            date.setDate(date.getDate() - trans.daysAgo);
            await db.query(
                'INSERT INTO transactions (account_id, type, description, amount, date) VALUES ($1, $2, $3, $4, $5)',
                [savingsAccountId, trans.type, trans.description, trans.amount, date]
            );
        }
        console.log(`Created ${savingsTransactions.length} transactions for Savings Account`);
        
        console.log('\n✅ User setup complete!');
        console.log(`\nUser Details:`);
        console.log(`  Username: ${username}`);
        console.log(`  Password: ${password}`);
        console.log(`  Name: ${fullName}`);
        console.log(`  Email: ${email}`);
        console.log(`  Phone: ${phone}`);
        console.log(`\nAccounts Created:`);
        console.log(`  1. Checking Account: ${checkingAccountId} (Balance: $1,800,500.00)`);
        console.log(`  2. Savings Account: ${savingsAccountId} (Balance: $212,071,800.00)`);
        console.log(`\nTotal Transactions Created: ${checkingTransactions.length + savingsTransactions.length}`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error setting up user:', error);
        process.exit(1);
    }
};

setupUser();
