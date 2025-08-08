# Excel Analyzer Backend

A comprehensive backend for an Excel analysis application built with Node.js, Express, and MongoDB.

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **Excel File Upload**: Support for .xlsx files with processing and analysis
- **Data Analysis**: Chart data endpoints for visualization
- **User Management**: Profile management and account settings
- **Admin Panel**: Admin-only routes for user management

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer for handling file uploads
- **Security**: Helmet, CORS, Rate limiting
- **Excel Processing**: XLSX library for Excel file processing

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Configure MongoDB:
   - Install MongoDB locally or use MongoDB Atlas
   - Update the `MONGODB_URI` in `.env`

5. Start the server:
   ```bash
   npm start
   ```

## Environment Variables

- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT secret key
- `JWT_EXPIRE`: JWT expiration time
- `MAX_FILE_SIZE`: Maximum file upload size (default: 10MB)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### File Upload
- `POST /api/files/upload` - Upload Excel file
- `GET /api/files` - Get user's files
- `GET /api/files/:id` - Get file details
- `DELETE /api/files/:id` - Delete file

### Data Analysis
- `GET /api/data/file/:id` - Get file data
- `GET /api/data/file/:id/summary` - Get data summary
- `GET /api/data/file/:id/chart-data` - Get chart-ready data

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/stats` - Get user statistics

## Usage

1. Register a new account
2. Upload Excel files
3. Process and analyze data
4. View charts and visualizations
5. Manage account settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Submit a pull request

## License

MIT License
