# QuirkyTalk - Modern Forum Platform

QuirkyTalk is a full-stack forum application that provides a modern, interactive platform for discussions. Built with React, Node.js, Express, and MongoDB, it offers a rich set of features for users to engage in meaningful conversations.

## 🌟 Features

### Frontend
- Modern, responsive UI with dark/light mode support
- Interactive user interface with animations
- Real-time updates for posts and comments
- Dynamic avatar generation
- Advanced search and filtering
- Category-based organization
- Trending posts based on engagement
- User profile management
- Responsive design for all devices

### Backend
- RESTful API architecture
- JWT-based authentication
- Real-time notifications
- Rate limiting and security features
- Avatar generation and caching
- MongoDB database integration
- WebSocket support for real-time features
- File upload handling

## 🛠 Tech Stack

### Frontend
- React 18
- React Router v6
- Bootstrap 5
- SCSS/CSS
- Axios
- WebSocket
- Context API

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Socket.io
- Multer

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd forum_1
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/forum
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000
```

Start the frontend development server:
```bash
npm start
```

## 📁 Project Structure

```
forum_1/
├── frontend/           # React frontend application
│   ├── public/        # Static files
│   │   └── index.html # Main HTML file
│   ├── src/           # Source code
│   │   ├── components # Reusable components
│   │   ├── contexts   # React contexts
│   │   ├── pages      # Page components
│   │   ├── utils      # Utility functions
│   │   ├── styles     # CSS/SCSS files
│   │   └── data       # Static data
│   └── package.json   # Frontend dependencies
│
├── backend/           # Node.js backend application
│   ├── src/          # Source code
│   │   ├── controllers # Request handlers
│   │   ├── models     # Database models
│   │   ├── routes     # API routes
│   │   ├── middleware # Custom middleware
│   │   └── utils      # Utility functions
│   └── package.json   # Backend dependencies
│
└── README.md         # This file
```

## 🔑 Key Features in Detail

### Authentication System
- Secure user registration and login
- JWT-based session management
- Password hashing with bcrypt
- Protected routes and API endpoints

### Post Management
- Create, edit, and delete posts
- Rich text editing
- Image upload support
- Category organization
- Like and comment functionality

### Real-time Features
- Live comment updates
- Instant notifications
- WebSocket integration
- Post engagement tracking

### User Experience
- Dark/light mode support
- Responsive design
- Interactive UI elements
- Avatar customization
- Search and filtering

## 🛡 Security Features

- Rate limiting for API endpoints
- Input validation and sanitization
- CORS protection
- Secure password handling
- JWT token management
- Error handling middleware

## 🧪 Testing

### Frontend
```bash
cd frontend
npm test
```

### Backend
```bash
cd backend
npm test
```

## 📚 API Documentation

Detailed API documentation is available in the backend README.md file.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, please open an issue in the repository or contact the maintainers.

## 🙏 Acknowledgments

- Bootstrap for the UI framework
- MongoDB for the database
- React for the frontend framework
- Express for the backend framework 