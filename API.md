# NotesVala API Documentation

This document provides detailed information about the NotesVala API endpoints for frontend developers.

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Rate Limiting

The API implements rate limiting to prevent abuse and ensure fair usage:

### General API Rate Limits
- 100 requests per IP address per 15 minutes
- Applies to all endpoints except authentication
- Headers included in response:
  - `RateLimit-Limit`: Maximum requests allowed
  - `RateLimit-Remaining`: Remaining requests
  - `RateLimit-Reset`: Time when the limit resets

### Authentication Rate Limits
- 5 requests per IP address per 15 minutes
- Applies to login and registration endpoints
- Stricter limits to prevent brute force attacks

### Rate Limit Exceeded Response
```json
{
    "statusCode": 429,
    "message": "Too many requests from this IP, please try again after 15 minutes",
    "success": false
}
```

## File Upload Restrictions

### Size Limits
- Maximum file size: 10MB
- Files exceeding this limit will receive a 400 Bad Request error

### File Type Restrictions
- Only PDF files are allowed
- Other file types will receive a 400 Bad Request error
- Content-Type must be `application/pdf`

### User File Limits
- Maximum 100 files per user
- Attempting to upload more will receive a 400 Bad Request error
- Error message: "Maximum file limit (100) reached for your account"

### File Upload Error Responses
```json
{
    "statusCode": 400,
    "message": "Only PDF files are allowed",
    "success": false
}
```
or
```json
{
    "statusCode": 400,
    "message": "File size exceeds 10MB limit",
    "success": false
}
```
or
```json
{
    "statusCode": 400,
    "message": "Maximum file limit (100) reached for your account",
    "success": false
}
```

## API Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
    "username": "string",
    "email": "string",
    "password": "string"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
    "email": "string",
    "password": "string"
}
```

### User Management

#### Get Current User
```http
GET /user/account
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /user/update-profile
Authorization: Bearer <token>
Content-Type: application/json

{
    "username": "string",
    "email": "string"
}
```

#### Logout User
```http
POST /user/logout
Authorization: Bearer <token>
```

#### Refresh Access Token
```http
POST /user/refresh-access
```

#### Reset Password
```http
PUT /user/reset-password
Content-Type: application/json

{
    "email": "string"
}
```

#### Delete Account
```http
DELETE /user/delete-account
Authorization: Bearer <token>
```

#### Get All Users (Admin Only)
```http
GET /user/all
Authorization: Bearer <token>
```

#### Make User Admin (Admin Only)
```http
POST /user/make-admin
Authorization: Bearer <token>
Content-Type: application/json

{
    "userId": "string"
}
```

### Notes Management

#### Upload Note
```http
POST /notes/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

pdfFile: <file>
```

#### Delete Note
```http
DELETE /notes/:id
Authorization: Bearer <token>
```

#### Get Note File URL
```http
GET /notes/file/:id
Authorization: Bearer <token>
```

#### Search Notes
```http
GET /notes/search
Authorization: Bearer <token>
Query Parameters:
  - query: string (search term)
  - page: number (default: 1)
  - limit: number (default: 10)
```

## Response Formats

### Success Response
```json
{
    "statusCode": 200,
    "data": {},
    "message": "string",
    "success": true
}
```

### Error Response
```json
{
    "statusCode": number,
    "message": "string",
    "success": false,
    "errors": []
}
```

## Common HTTP Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## Best Practices

1. Always include error handling in your requests
2. Implement token refresh logic
3. Cache responses when appropriate
4. Implement retry logic for failed requests
5. Handle file upload progress
6. Validate data before sending to the API
7. Use appropriate content types for requests
8. Implement proper loading states
9. Handle offline scenarios
10. Implement proper error messages for users
11. Monitor rate limit headers to prevent hitting limits
12. Implement file size validation before upload
13. Check file type before upload
14. Track user's file count to prevent hitting limits

## Testing

For testing purposes, you can use the following test account:

```
Email: test@example.com
Password: Test@123
```

## Support

For API-related issues or questions, please contact the backend team or raise an issue in the repository. 