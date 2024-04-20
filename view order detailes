const express = require('express');
const mysql = require('mysql');
const moment = require('moment-timezone'); // Import the moment-timezone library

const app = express();
const PORT = process.env.PORT || 3003;

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1212',
  database: 'elocalhood'
});

// API endpoint to get order information by ID
app.get('/order/:id', (req, res) => {
  const orderId = req.params.id;

  // Query to fetch order details with associated order descriptions
  const query = `
    SELECT 
      combined_order.*, 
      combined_order.*
    FROM 
      combined_order
    WHERE 
      combined_order.OrderID = ?
  `;

  pool.query(query, [orderId], (error, results) => {
    if (error) {
      console.error('Error fetching order information:', error);
      return res.status(500).json({ error: 'Failed to fetch order information', message: error.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Order not found', message: 'No order found with the provided ID' });
    }

    // Extract relevant information from the results
    const orderInfo = {
      orderId: results[0].OrderID,
      sellerId: results[0].SellerID,
      productId: results[0].ProductID,
      price: results[0].Price,
      // Convert the time to India's timezone (Asia/Kolkata)
      time: moment(results[0].Time).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
      status: results[0].Status,
      typeOfProduct: results[0].TypeOfProduct
    };

    res.json(orderInfo);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
