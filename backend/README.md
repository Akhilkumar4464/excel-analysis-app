# Excel Analysis App Backend

A Node.js backend for the Excel Analysis App with MongoDB integration.

## Features

- **User Authentication**: JWT-based authentication system
- **File Upload**: Excel file upload and processing
- **Data Analysis**: Automatic data analysis and insights generation
- **MongoDB Integration**: Full MongoDB support with Mongoose
- **RESTful API**: Clean and organized API endpoints

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **XLSX** - Excel file processing

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```bash
MONGODB_URI=mongodb+srv://akhilsharma:akhil123@cluster0.qu0s4y9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=development
```

3. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Excel Files
- `POST /api/excel/upload` - Upload Excel file
- `GET /api/excel/files` - Get user's files
- `GET /api/excel/files/:id` - Get specific file
- `DELETE /api/excel/files/:id` - Delete file
- `GET /api/excel/files/:id/analyze` - Analyze file data

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id/role` - Update user role
- `GET /api/users/stats/overview` - Get user statistics

## File Structure

```
backend/
├── models/
│   ├── User.js
│   └── ExcelFile.js
├── routes/
│   ├── auth.js
│   ├── excel.js
│   └── users.js
├── middleware/
│   └── auth.js
├── uploads/
├── .env
├── server.js
└── package.json
```

## Usage

1. Start the backend server
2. Use the frontend to interact with the API
3. Upload Excel files for analysis
4. View processed data and insights

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- File type validation
- Request size limits
- CORS protection
