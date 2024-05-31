const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 2008;

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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API endpoint to handle shop details update
app.put("/update_shop/:id", upload.fields([
  { name: "ShopPhoto", maxCount: 1 },
  { name: "OwnerPhoto", maxCount: 1 }
]), (req, res) => {
  const shopId = req.params.id;
  const { ShopName, Category, ShopAddress, Pincode, WhatsappNumber, DeliveryDetails } = req.body;
  const { ShopPhoto = {}, OwnerPhoto = {} } = req.files || {};

  // Construct the update query
  let updateQuery = "UPDATE shop SET ";
  let updateFields = [];
  if (ShopName) updateFields.push(`ShopName='${ShopName}'`);
  if (Category) updateFields.push(`Category='${Category}'`);
  if (ShopAddress) updateFields.push(`ShopAddress='${ShopAddress}'`);
  if (Pincode) updateFields.push(`Pincode='${Pincode}'`);
  if (WhatsappNumber) updateFields.push(`WhatsappNumber='${WhatsappNumber}'`);
  if (DeliveryDetails) updateFields.push(`DeliveryDetails='${DeliveryDetails}'`);
  if (ShopPhoto[0]) updateFields.push(`ShopPhoto='${ShopPhoto[0].filename}'`);
  if (OwnerPhoto[0]) updateFields.push(`OwnerPhoto='${OwnerPhoto[0].filename}'`);
  updateQuery += updateFields.join(", ") + ` WHERE ShopID=${shopId}`;

  pool.query(updateQuery, (err, result) => {
    if (err) {
      console.log("MySQL Query error in the shop table", err);
      return res.status(500).json({
        Message: "Internal server Error"
      });
    }

    if (result.affectedRows === 0) {
      console.log("No rows updated. Either ID not present in the database or shop details already updated.");
      return res.status(409).json({
        Error: "No rows updated. Either ID not present in the database or shop details already updated."
      });
    }

    console.log("Shop Details Updated Successfully");
    return res.status(200).json({
      Message: "Shop Details Updated Successfully"
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
