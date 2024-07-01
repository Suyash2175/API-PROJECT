# Order Details API
GET /api/order-details

## Request
```
Content-Type : application/json
```


#### Request Body
```json

    {
  "orderId": "integer",
  "sellerId": "integer",
  "productId": "integer",
  "price": "decimal",
  "time": "string (YYYY-MM-DD HH:mm:ss in Asia/Kolkata timezone)",
  "status": "string",
  "typeOfProduct": "string"
}


```
## Response

### Success (200 OK)

```json
{
    "message": "order details "
}
Error (404 Not found)
{
  "error": "Order not found",
  "message": "No order found with the provided ID"
}
Error (500  Internal Server Error)

{
  "error": "Failed to fetch order information",
  "message": "Detailed error message"
}
