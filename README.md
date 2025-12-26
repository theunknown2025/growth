# Growth AI

Full-stack application built with Next.js (frontend) and Node.js/Express (backend), featuring AI-powered evaluation and analysis capabilities.

## 🏗️ Project Structure

```
Growth/
├── api-gateway-growth/     # Backend API (Node.js/Express)
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   └── middleware/     # Auth & error handling
│   └── app.js              # Application entry point
│
├── growth-ai/              # Frontend (Next.js 15)
│   ├── src/
│   │   ├── app/           # Next.js app router
│   │   ├── components/    # React components
│   │   └── sections/      # Feature sections
│   └── package.json
│
└── deploy.sh              # VPS deployment script
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x
- MongoDB 7.0+
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/growth-ai.git
   cd growth-ai
   ```

2. **Backend Setup**
   ```bash
   cd api-gateway-growth
   npm install
   cp .env.example .env  # Create .env file
   # Edit .env with your configuration
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd growth-ai
   npm install
   cp .env.example .env.local  # Create .env.local file
   # Edit .env.local with your configuration
   npm run dev
   ```

## 📦 Deployment

### 🚀 Super Simple Deployment (Recommended)

**Just upload `deploy.sh` and run it!**

1. Upload `deploy.sh` to your VPS (using WinSCP)
2. Run in PuTTY:
   ```bash
   chmod +x deploy.sh
   export DOMAIN_NAME=yourdomain.com
   sudo ./deploy.sh
   ```

The script automatically clones from GitHub and handles everything!

**See [SIMPLE_DEPLOYMENT.md](SIMPLE_DEPLOYMENT.md)** for the complete guide.

### 📚 Other Deployment Guides

- **[SIMPLE_DEPLOYMENT.md](SIMPLE_DEPLOYMENT.md)** - ⭐ Easiest deployment method
- **[WINDOWS_DEPLOYMENT.md](WINDOWS_DEPLOYMENT.md)** - Windows (WinSCP/PuTTY) guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
- **[QUICK_START.md](QUICK_START.md)** - Quick deployment reference

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Detailed deployment instructions
- **[PROJECT_AUDIT.md](PROJECT_AUDIT.md)** - Project audit and review
- **[GITHUB_SETUP.md](GITHUB_SETUP.md)** - GitHub setup guide
- **[env.template](env.template)** - Environment variables template

## 🛠️ Technology Stack

### Backend
- Node.js / Express.js
- MongoDB with Mongoose
- JWT Authentication
- OpenAI API Integration

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components

## 🔐 Environment Variables

See [env.template](env.template) for all required environment variables.

### Backend (.env)
- `MONGODB` - MongoDB connection string
- `OPENAI_API_KEY` - OpenAI API key (required)
- `jwtSecret` - JWT secret
- `sessionSecret` - Session secret
- `CORS_ORIGIN` - Frontend URL

### Frontend (.env.local)
- `NEXT_PUBLIC_SERVER_URL` - Server URL
- `NEXT_PUBLIC_BASE_URL` - API base URL

## 📝 Scripts

### Deployment Script
- `deploy.sh` - Complete VPS deployment automation

### GitHub Helper
- `push-to-github.sh` - Helper script to push project to GitHub

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Environment variable protection
- MongoDB authentication

## 📄 License

[Add your license here]

## 👥 Contributors

[Add contributors here]

## 📞 Support

For deployment issues, see [DEPLOYMENT.md](DEPLOYMENT.md) troubleshooting section.

---

**Note**: Make sure to never commit `.env` files or sensitive credentials to the repository.

