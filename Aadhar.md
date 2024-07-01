# User aadhar API
```
POST /v1/aadhar
```

### Request Headers
```
Content-Type : application/json
```

## Request Body
```json
   
   {
    "Full Name": "String",
    "Aadhar Card Image (Front)": "Image File (jpg, png, jpeg)",
    "Aadhar Card Image (Back)": "Image File (jpg, png, jpeg)",
    "Aadhar Card Number": "BigInt (12 digits)",
    "Passport Photo": "Image File (jpg, png, jpeg)",
    "Bank Account Number": "BigInt(8-16 characters)",
    "UPI ID": "String (xxxxxxxxxx@ybl/@axl)",
    "QR Code Image": "Image File"
}

```

## Response
```json
200 OK
{
    "message": "Aadhar card verification successful."
}

400 Bad Request
{
    "error": "Invalid Aadhar card number."
}

404 Not Found
{
    "error": "Aadhar card images not found."
}

500 Internal Server Error
{
    "error": "Internal server error. Please try again later."
}
