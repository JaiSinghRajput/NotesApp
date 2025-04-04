# NotesVala

NotesVala is a modern note-taking application with a robust backend API built using Node.js and Express.js.

## Project Structure

```
NotesVala/
├── Backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middlewares/    # Custom middleware functions
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   ├── app.js          # Express application setup
│   │   └── index.js        # Application entry point
│   ├── public/             # Static files
│   ├── .env                # Environment variables
│   ├── sample.env          # Sample environment variables
│   └── package.json        # Project dependencies and scripts
```

## Features

- User authentication and authorization
- Note creation, reading, updating, and deletion
- File uploads with Cloudinary integration
- Secure password hashing with bcrypt
- JWT-based authentication
- MongoDB database integration
- CORS enabled
- Cookie-based session management

## Prerequisites

- Node.js (Latest LTS version recommended)
- PNPM package manager
- MongoDB database
- Cloudinary account (for file uploads)

## Environment Variables

Create a `.env` file in the Backend directory with the following variables:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Installation

1. Clone the repository
2. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Create a `.env` file based on `sample.env`
5. Start the development server:
   ```bash
   pnpm dev
   ```

## Available Scripts

- `pnpm start`: Start the production server
- `pnpm dev`: Start the development server with hot-reload

## Dependencies

### Main Dependencies
- express: ^4.18.2
- mongoose: ^8.0.0
- bcryptjs: ^3.0.2
- jsonwebtoken: ^9.0.2
- cloudinary: ^2.6.0
- multer: ^1.4.5-lts.2
- cors: ^2.8.5
- cookie-parser: ^1.4.7
- dotenv: ^16.3.1

### Development Dependencies
- nodemon: ^3.0.0

## License

This project is licensed under the MIT License. 