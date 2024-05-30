const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 2009;

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1212",
  database: "elocalhood"
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API endpoint to handle shop details update
app.put("/update_shop/:id", (req, res) => {
  // Update logic here
});

// API endpoint to handle shop details deletion by ShopID
app.delete("/delete_shop/:id", (req, res) => {
  const shopId = req.params.id;

  // Construct the delete query
  const deleteQuery = `DELETE FROM shop WHERE ShopID=${shopId}`;

  // Execute the delete query
  pool.query(deleteQuery, (err, result) => {
    if (err) {
      console.log("MySQL Query error in the shop table", err);
      return res.status(500).json({
        Message: "Internal server Error"
      });
    }

    if (result.affectedRows === 0) {
      console.log("No rows deleted. Either ID not present in the database or no matching records found.");
      return res.status(404).json({
        Error: "No rows deleted. Either ID not present in the database or no matching records found."
      });
    }

    console.log("Shop Details Deleted Successfully");
    return res.status(200).json({
      Message: "Shop Details Deleted Successfully"
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
