const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const mysql = require('mysql');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1212',
  database: 'elocalhood'
});

// Set up multer storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Middleware for parsing JSON request bodies
app.use(express.json());

// Validation middleware for Aadhar number
const validateAadhar = (value) => {
  if (!/^\d{12}$/.test(value)) {
    throw new Error('Invalid Aadhar number');
  }
  return true;
};

// Validation middleware for Bank account number
const validateBankAccount = (value) => {
  if (!/^\d{9,18}$/.test(value)) {
    throw new Error('Invalid bank account number');
  }
  return true;
};

// Validation middleware for UPI ID
const validateUPI = (value) => {
  if (!value.includes('@')) {
    throw new Error('UPI ID must contain "@" symbol');
  }
  return true;
};

// API endpoint to handle form submission
app.post('/submitForm',
  // Middleware for handling file uploads
  upload.fields([
    { name: 'aadharFrontImage', maxCount: 1 },
    { name: 'aadharBackImage', maxCount: 1 },
    { name: 'passportPhoto', maxCount: 1 },
    { name: 'qrCodeImage', maxCount: 1 }
  ]),
  // Validation middleware for form fields
  [
    body('fullname').trim().notEmpty().withMessage('Fullname is required'),
    body('aadharNumber').trim().custom(validateAadhar),
    body('bankAccountNumber').trim().custom(validateBankAccount),
    body('upiId').trim().custom(validateUPI)
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Destructuring form data
    const { fullname, aadharNumber, bankAccountNumber, upiId } = req.body;

    // Check if the Aadhar number already exists in the database
    pool.query(
      'SELECT * FROM aadhar WHERE aadharNumber = ?',
      [aadharNumber],
      (queryError, aadharResults) => {
        if (queryError) {
          console.error('Error querying Aadhar database:', queryError);
          return res.status(500).json({ error: 'Failed to check Aadhar number', message: queryError.message });
        }

        // If a matching Aadhar number is found, return an error
        if (aadharResults.length > 0) {
          return res.status(400).json({ error: 'Aadhar number already registered', message: 'Aadhar number is already registered' });
        }

        // Check if the UPI ID already exists in the database
        pool.query(
          'SELECT * FROM aadhar WHERE upiId = ?',
          [upiId],
          (upiQueryError, upiResults) => {
            if (upiQueryError) {
              console.error('Error querying UPI database:', upiQueryError);
              return res.status(500).json({ error: 'Failed to check UPI ID', message: upiQueryError.message });
            }

            // If a matching UPI ID is found, return an error
            if (upiResults.length > 0) {
              return res.status(400).json({ error: 'UPI ID already registered', message: 'UPI ID is already registered' });
            }

            // Check if req.files exists and handle missing file upload fields
            const aadharFrontImage = req.files && req.files['aadharFrontImage'] ? req.files['aadharFrontImage'][0].filename : (req.body['aadharFrontImageUrl'] || null);
            const aadharBackImage = req.files && req.files['aadharBackImage'] ? req.files['aadharBackImage'][0].filename : (req.body['aadharBackImageUrl'] || null);
            const passportPhoto = req.files && req.files['passportPhoto'] ? req.files['passportPhoto'][0].filename : (req.body['passportPhotoUrl'] || null);
            const qrCodeImage = req.files && req.files['qrCodeImage'] ? req.files['qrCodeImage'][0].filename : (req.body['qrCodeImageUrl'] || null);

            // Insert form data into the 'aadhar' table
            pool.query(
              'INSERT INTO aadhar (fullname, aadharNumber, bankAccountNumber, upiId, aadharFrontImage, aadharBackImage, passportPhoto, qrCodeImage) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [fullname, aadharNumber, bankAccountNumber, upiId, aadharFrontImage, aadharBackImage, passportPhoto, qrCodeImage],
              (insertError, insertResults) => {
                if (insertError) {
                  console.error('Error saving submission:', insertError);
                  return res.status(500).json({ error: 'Failed to save form submission', message: insertError.message });
                }
                // Respond with success message
                res.json({ message: 'Form submitted successfully' });
              }
            );
          }
        );
      }
    );
  }
);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
