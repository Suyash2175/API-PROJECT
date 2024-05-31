const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 2004;

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1212",
  database: "elocalhood"
});

const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }
});

app.use(bodyParser.json()); // Parse application/json
app.use(bodyParser.urlencoded({ extended: true })); // Parse application/x-www-form-urlencoded

// API endpoint to handle Aadhar details update
app.put("/update_aadhar/:id", upload.fields([
  { name: "aadharFrontImage", maxCount: 1 },
  { name: "aadharBackImage", maxCount: 1 },
  { name: "passportPhoto", maxCount: 1 },
  { name: "qrCodeImage", maxCount: 1 }
]), (req, res) => {
  const aadharId = req.params.id;
  const { fullname, aadharNumber, bankAccountNumber, upiId } = req.body;
  const { aadharFrontImage, aadharBackImage, passportPhoto, qrCodeImage } = req.files;

  // Construct the update query
  let updateQuery = "UPDATE aadhar SET ";
  let updateFields = [];
  if (fullname) updateFields.push(`fullname='${fullname}'`);
  if (aadharNumber) updateFields.push(`aadharNumber='${aadharNumber}'`);
  if (bankAccountNumber) updateFields.push(`bankAccountNumber='${bankAccountNumber}'`);
  if (upiId) updateFields.push(`upiId='${upiId}'`);
  if (aadharFrontImage) updateFields.push(`aadharFrontImage='${aadharFrontImage[0].filename}'`);
  if (aadharBackImage) updateFields.push(`aadharBackImage='${aadharBackImage[0].filename}'`);
  if (passportPhoto) updateFields.push(`passportPhoto='${passportPhoto[0].filename}'`);
  if (qrCodeImage) updateFields.push(`qrCodeImage='${qrCodeImage[0].filename}'`);

  // Check if there are fields to update
  if (updateFields.length > 0) {
    updateQuery += updateFields.join(", ") + ` WHERE id=${aadharId}`;
  } else {
    // Handle case where no fields are provided for update
    return res.status(400).json({
      Error: "No fields provided for update"
    });
  }

  pool.query(updateQuery, (err, result) => {
    if (err) {
      console.log("MySQL Query error in the aadhar table", err);
      return res.status(500).json({
        Message: "Internal server Error"
      });
    }

    if (result.affectedRows === 0) {
      console.log("No rows updated. Either ID not present in the database or aadhar details already updated.");
      return res.status(409).json({
        Error: "No rows updated. Either ID not present in the database or aadhar details already updated."
      });
    }

    console.log("Aadhar Details Updated Successfully");
    return res.status(200).json({
      Message: "Aadhar Details Updated Successfully"
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
