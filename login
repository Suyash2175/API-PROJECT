const express = require('express');
const mysql = require('./database'); // here we will import..database connection
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;
app.use(bodyParser.json());

// Login endpoint
app.post('/v1/login', (req, res) => {
    const { Email, Password } = req.body;

    // Check if the request body has both email and password
    if (!Email || !Password) {
        return res.status(400).json({ error: 'Bad Request - Incorrect Email/Password' });
    }

    // Find user by email in the database
    const query = 'SELECT * FROM users WHERE email = ?';
    mysql.query(query, [Email], (err, results) => {
        if (err) {
            console.error('MySQL Error:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Check if the user exists
        if (results.length === 0) {
            return res.status(404).json({ error: 'Not Found' });
        }

        const user = results[0];

        // Check if the password is correct (in a real application, you'd use a secure method to compare hashed passwords)
        if (user.password !== Password) {
            return res.status(400).json({ error: 'Bad Request - Incorrect Email/Password' });
        }

        // Successful login!!!
        return res.status(200).json({ user_id: user.user_id, email: user.email });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(Server is running on http://localhost:${PORT});
});
