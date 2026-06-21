# AuraCRM

A modern, AI-powered Customer Relationship Management (CRM) platform designed to streamline customer interactions, automate marketing campaigns, and provide intelligent insights for business growth.

![AuraCRM](https://img.shields.io/badge/AuraCRM-v1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node](https://img.shields.io/badge/Node-18.x-green)

## 🚀 Live Deployment
Experience the AI-powered CRM in action!

🌐 Live Preview: https://xenocrm.pages.dev/login
(Hosted on Cloudflare Pages ❤️)



## 🌟 Features

- **AI-Powered Campaign Management**
  - Smart campaign suggestions
  - Automated content generation
  - Performance analytics and insights

- **Advanced Customer Segmentation**
  - Dynamic segment creation
  - Real-time audience size calculation
  - Multi-criteria filtering

- **Comprehensive Customer Management**
  - Detailed customer profiles
  - Interaction history tracking
  - Custom field support

- **Secure Authentication**
  - Email/Password authentication
  - Google OAuth integration
  - Role-based access control

- **Modern Tech Stack**
  - React 18 with Vite
  - Node.js backend
  - MongoDB database
  - Real-time message broker

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/auracrm.git
   cd auracrm
   ```

2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install

   # Install message broker dependencies
   cd ../message-broker
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Backend (.env)
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Frontend (.env)
   VITE_API_URL=http://localhost:5000/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. Start the development servers:
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server
   cd ../frontend
   npm run dev

   # Start message broker
   cd ../message-broker
   npm run dev
   ```

## 📁 Project Structure

```
auracrm/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context providers
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   └── public/           # Static assets
│
├── backend/               # Node.js backend API
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Custom middleware
│   │   └── config/       # Configuration files
│   └── tests/            # Backend tests
│
└── message-broker/        # Message broker service
    ├── src/
    │   ├── consumers/    # Message consumers
    │   ├── producers/    # Message producers
    │   └── config/       # Broker configuration
    └── tests/            # Message broker tests
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/auracrm
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test

# Run message broker tests
cd message-broker
npm test
```

## 📝 API Documentation

API documentation is available at `/api/docs` when running the backend server in development mode.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Rajul Mishra**
- GitHub: [@rajulmishra](https://github.com/beyonder07)
- LinkedIn: [Rajul Mishra](https://www.linkedin.com/in/rajul-mishra-621548258/)

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)


<!-- START_STATS_SECTION -->
### 📊 Auto-Update Stats
- **Last Active:** 6/21/2026, 12:22:35 PM
- **Latest Focus:** Advanced ES Modules & ESM/CJS Interop
- **Current Streak Status:** Active 🔥
- **Commit Mode:** Automated Daily Log System
<!-- END_STATS_SECTION -->
