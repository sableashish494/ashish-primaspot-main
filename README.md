#  Instagram Influencer

A comprehensive web application for viewing Instagram profiles, posts, and reels with advanced analytics and database integration. Built with modern web technologies and featuring a clean, responsive UI.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)](https://mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🎯 Core Functionality
- **Profile Analysis**: View complete Instagram profile information including bio, follower stats, and profile picture
- **Content Browsing**: Browse recent posts and reels in a responsive grid layout
- **Dual Data Sources**: Fetch fresh data from Instagram API or load cached data from database
- **Advanced Analytics**: Comprehensive analytics with interactive charts and metrics
- **Image Proxy**: CORS-free image loading through server proxy

### 📊 Analytics Dashboard
- **Engagement Metrics**: Average likes, comments, and engagement rates
- **Content Performance**: Compare posts vs reels performance
- **Visual Charts**: Interactive charts using Chart.js (doughnut, bar, radar, line)
- **Trend Analysis**: Engagement patterns over time
- **Comparative Insights**: Detailed breakdown of content types

### 🎨 User Interface
- **Modern Design**: Instagram-inspired UI with gradient backgrounds
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations**: Hover effects and transitions
- **Loading States**: Visual feedback during data operations
- **Error Handling**: User-friendly error messages and retry options

### 🗄️ Database Integration
- **MongoDB Storage**: Persistent data storage with optimized schemas
- **Fast Queries**: Indexed database for quick data retrieval
- **Data Persistence**: Save and load profile data between sessions
- **Automatic Backup**: Fresh data automatically saved to database

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Axios** - HTTP client for API requests

### Frontend
- **Vanilla JavaScript** - No framework dependencies
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with flexbox/grid
- **Chart.js** - Interactive charts and graphs

### Development Tools
- **dotenv** - Environment variable management
- **ES6+** - Modern JavaScript features

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download here](https://mongodb.com/try/download/community)
- **Instagram Session ID** - Required for API access
- **Git** - For version control

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/instagram-profile-viewer.git
cd instagram-profile-viewer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the project root:

```env
# Instagram API Configuration
INSTAGRAM_SESSIONID=your_instagram_session_id_here

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/instagram_profiles
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/instagram_profiles

# Server Configuration
PORT=3001
```

### 4. Start the Application

```bash
# Development mode
npm start

# Or with nodemon for auto-restart
npm run dev
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3001
```

## ⚙️ Configuration

### Instagram Session ID Setup

1. **Login to Instagram** in your browser
2. **Open Developer Tools** (F12)
3. **Go to Application/Storage tab**
4. **Find Cookies** and locate `sessionid`
5. **Copy the value** and add to `.env` file

### MongoDB Setup

#### Local MongoDB
```bash
# Start MongoDB service
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## 🎯 Usage

### Basic Usage

1. **Enter Username**: Type Instagram username (without @)
2. **Choose Data Source**:
   - **"Fetch Fresh Data"** - Gets new data from Instagram API
   - **"📊 Load from Database"** - Loads previously saved data
3. **View Results**: Browse profile, posts, reels, and analytics
4. **Toggle Views**: Switch between posts, reels, and analytics tabs

### Advanced Features

#### Analytics Dashboard
- **Profile Summary**: Overview of total content and engagement
- **Posts Analytics**: Detailed metrics for regular posts
- **Reels Analytics**: Performance data for video content
- **Engagement Insights**: Comparative analysis and trends

#### Database Operations
- **Automatic Saving**: Fresh data is automatically saved to database
- **Fast Loading**: Database queries are much faster than API calls
- **Data Persistence**: User data persists between sessions
- **Bulk Operations**: Efficient handling of large datasets

## 📚 API Documentation

### Endpoints

#### Profile Data
```http
POST /api/fetch-profile
Content-Type: application/json

{
  "username": "cristiano"
}
```

#### Database Operations
```http
GET /api/db/user/:username          # Get user data from database
GET /api/db/user/:username/exists   # Check if user exists
GET /api/db/users                   # List all users
GET /api/db/analytics/:username     # Get analytics data
```

#### Image Proxy
```http
GET /api/image?url=encoded_image_url
```

### Response Format

```json
{
  "profile": {
    "username": "cristiano",
    "full_name": "Cristiano Ronaldo",
    "bio": "Footballer",
    "profile_picture": "https://...",
    "posts": 1000,
    "followers": 500000000,
    "following": 500
  },
  "posts": [...],
  "reels": [...]
}
```

## 📁 Project Structure

```
instagram-profile-viewer/
├── 📁 config/
│   └── database.js              # MongoDB connection configuration
├── 📁 models/
│   ├── Profile.js               # Profile data schema
│   ├── Post.js                  # Posts data schema
│   └── Reel.js                  # Reels data schema
├── 📁 routes/
│   └── databaseRoutes.js        # Database API routes
├── 📁 services/
│   └── databaseService.js       # Database operations
├── 📄 index.html                 # Main HTML file
├── 📄 styles.css                 # CSS styles
├── 📄 script.js                  # Frontend JavaScript
├── 📄 server.js                  # Express server
├── 📄 backend.js                 # Instagram API scraper
├── 📄 package.json               # Dependencies and scripts
└── 📄 README.md                  # This file
```

## 🗄️ Database Schema

### Profile Collection
```javascript
{
  username: String,           // Unique identifier
  data: Mixed,               // Complete profile JSON
  last_updated: Date,        // Last update timestamp
  createdAt: Date,           // Creation timestamp
  updatedAt: Date            // Last modification timestamp
}
```

### Posts Collection
```javascript
{
  username: String,           // User identifier
  data: [Mixed],             // Array of post objects
  last_updated: Date,        // Last update timestamp
  createdAt: Date,           // Creation timestamp
  updatedAt: Date            // Last modification timestamp
}
```

### Reels Collection
```javascript
{
  username: String,           // User identifier
  data: [Mixed],             // Array of reel objects
  last_updated: Date,        // Last update timestamp
  createdAt: Date,           // Creation timestamp
  updatedAt: Date            // Last modification timestamp
}
```

## 🚀 Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://...
INSTAGRAM_SESSIONID=...
```

### Production Build
```bash
# Install production dependencies
npm install --production

# Start application
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check MongoDB service
sudo systemctl status mongod

# Check connection string
echo $MONGODB_URI
```

#### 2. Instagram API Errors
- **Invalid Session ID**: Update session ID in `.env`
- **Rate Limiting**: Wait before making new requests
- **Private Account**: Try public accounts only

#### 3. Image Loading Issues
- **CORS Errors**: Images are proxied through server
- **Network Issues**: Check internet connection
- **Invalid URLs**: Verify Instagram URLs

#### 4. Server Won't Start
```bash
# Check port availability
lsof -i :3001

# Check Node.js version
node --version

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm start

# Check database connection
npm run db:test
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### 1. Fork the Repository
```bash
git fork https://github.com/yourusername/instagram-profile-viewer.git
```

### 2. Create Feature Branch
```bash
git checkout -b feature/amazing-feature
```

### 3. Make Changes
- Follow existing code style
- Add tests for new features
- Update documentation

### 4. Commit Changes
```bash
git commit -m "Add amazing feature"
```

### 5. Push to Branch
```bash
git push origin feature/amazing-feature
```

### 6. Create Pull Request
- Describe your changes
- Link any related issues
- Request review from maintainers

### Development Guidelines
- Use meaningful commit messages
- Follow ESLint configuration
- Write comprehensive tests
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Instagram** - For providing the API
- **Chart.js** - For beautiful charts
- **MongoDB** - For database functionality
- **Express.js** - For the web framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/instagram-profile-viewer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/instagram-profile-viewer/discussions)
- **Email**: support@example.com

---

**Built with ❤️ for the Instagram community**
