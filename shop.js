const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3003;

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1212',
    database: 'shop'
});

// Error handling for port conflict
app.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is already in use. Trying the next port...`);
        PORT++;
        app.listen(PORT);
    } else {
        console.error('An error occurred:', err);
    }
});

// Multer setup for handling file uploads
const upload = multer({ dest: 'uploads/' });

// Middleware to serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route handler for POST /shop
app.post('/shop', upload.none(), (req, res) => {
    // Extract data from request body
    const { shopName, fullName, category, shopAddress, pincode, whatsappNumber, googleAddressLink, deliveryDetails } = req.body;

    // Check if all required fields are present
    if (!shopName || !fullName || !category || !shopAddress || !pincode || !whatsappNumber || !googleAddressLink || !deliveryDetails) {
        return res.status(400).json({ error: 'Missing required fields in request body.' });
    }

    // Check if shop category is valid
    const validCategories = ['Bakery', 'Medicines', 'Electronics', 'Grocery', 'Cloths', 'Other'];
    if (!validCategories.includes(category)) {
        return res.status(400).json({ error: 'Invalid shop category.' });
    }

    // Save data to the database
    const query = "INSERT INTO shop (ShopName, FullName, Category, ShopAddress, Pincode, WhatsappNumber, GoogleAddressLink, DeliveryDetails) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [shopName, fullName, category, shopAddress, pincode, whatsappNumber, googleAddressLink, deliveryDetails];
    
    pool.query(query, values, (err, results) => {
        if (err) {
            console.error('Error saving data to database:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log('Data saved to database successfully');
            // Send success response
            res.status(200).json({ message: 'Shop details added successfully' });
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
