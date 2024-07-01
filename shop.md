# Shop Details API
POST /api/shop-details

## Request
```
Content-Type : application/json
```


#### Request Body
```json

    {
    "ID": "Integer", // (Primary Key)
    "shopName": "String",
    "fullName": "String",
    "category": "String('Bakery', 'Medicines', 'Electronics', 'Grocery', 'Cloths', 'Other')",
    "shopAddress": "String",
    "pincode": "BigInt (6-digit number)",
    "whatsappNumber": "BigInt (10-digit number)", 
    "googleAddressLink": "String",
    "deliveryDetails": "Integer",
    "shopPhoto": "File",
    "yourPhotoInsideShop": "File"
}
```
## Response

### Success (200 OK)

```json
{
    "message": "Shop details added successfully"
}
Error (400 Bad Request)
{
    "error": "Invalid request body"
}
