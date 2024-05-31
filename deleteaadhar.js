const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 2004;

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1212",
  database: "elocalhood"
});

app.use(bodyParser.json()); // Parse application/json
app.use(bodyParser.urlencoded({ extended: true })); // Parse application/x-www-form-urlencoded

// API endpoint to handle Aadhar details deletion
app.delete("/delete_aadhar/:id", (req, res) => {
  const aadharId = req.params.id;

  // Construct the delete query
  const deleteQuery = `DELETE FROM aadhar WHERE id=${aadharId}`;

  // Execute the delete query
  pool.query(deleteQuery, (err, result) => {
    if (err) {
      console.log("MySQL Query error in the aadhar table", err);
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

    console.log("Aadhar Details Deleted Successfully");
    return res.status(200).json({
      Message: "Aadhar Details Deleted Successfully"
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
