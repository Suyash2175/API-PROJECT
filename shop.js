const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4002;

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1212',
    database: 'elocalhood'
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
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Middleware to serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Validation middleware for WhatsApp number and delivery details
const validateWhatsAppNumber = (req, res, next) => {
    const { whatsappNumber, deliveryDetails } = req.body;
    if (!/^\d{10}$/.test(whatsappNumber)) {
        return res.status(400).json({ error: 'Invalid WhatsApp number. It must be exactly 10 digits long.' });
    }

    // Check if deliveryDetails is provided
    if (deliveryDetails && typeof deliveryDetails !== 'string') {
        return res.status(400).json({ error: 'Invalid deliveryDetails. It must be a string.' });
    }

    next();
};

// Route handler for POST /shop
app.post('/shop', upload.fields([{ name: 'shopPhoto', maxCount: 1 }, { name: 'ownerPhoto', maxCount: 1 }]), validateWhatsAppNumber, (req, res) => {
    // Extract data from request body
    const { shopName, category, shopAddress, pincode, whatsappNumber, deliveryDetails } = req.body;

    // Check if req.files exists and has the expected properties
    const shopPhoto = req.files && req.files['shopPhoto'] ? req.files['shopPhoto'][0].filename : null;
    const ownerPhoto = req.files && req.files['ownerPhoto'] ? req.files['ownerPhoto'][0].filename : null;

    // Save data to the database
    const query = "INSERT INTO shop (ShopName, Category, ShopAddress, Pincode, WhatsappNumber, DeliveryDetails, ShopPhoto, OwnerPhoto) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [shopName, category, shopAddress, pincode, whatsappNumber, deliveryDetails, shopPhoto, ownerPhoto];
    
    pool.query(query, values, (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'WhatsApp number', message: ' WhatsApp number already register' });
            } else {
                console.error('Error saving data to database:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
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

