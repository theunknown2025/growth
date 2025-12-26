#!/bin/bash

################################################################################
# Manual CORS Fix Script
# Use this if git pull fails
################################################################################

BACKEND_DIR="/var/www/growth-ai/api-gateway-growth"
APP_USER="growthai"

echo "Applying CORS fix manually..."

# Backup original file
cp ${BACKEND_DIR}/app.js ${BACKEND_DIR}/app.js.backup

# Create the fixed app.js
cat > ${BACKEND_DIR}/app.js <<'EOF'
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const { sessionSecret } = require('./conf');
const { corsvar } = require('./conf');
const path = require('path');

// ROUTES
const authRoutes = require('./src/routes/authRoutes');
const evaluationRoutes = require('./src/routes/evaluationRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const analysisRoutes = require('./src/routes/analysisRoutes');
const assignementsRoutes = require('./src/routes/assignementsRoutes');

// CREATE APPLICATION
const app = express();

// DATABASE
require('./src/config/db');

// CORS Middleware: allow requests from multiple origins
const allowedOrigins = corsvar.origin ? corsvar.origin.split(',').map(o => o.trim()) : ['http://localhost:3000'];
app.use(cors({
	origin: function (origin, callback) {
		// Allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true);
		
		// Check if origin is in allowed list
		if (allowedOrigins.includes(origin) || 
		    allowedOrigins.some(allowed => origin.startsWith(allowed)) ||
		    origin.includes('172.166.106.2') || // Allow IP access
		    origin.includes('localhost') ||
		    origin.includes('127.0.0.1')) {
			return callback(null, true);
		}
		
		// For development, allow all origins (remove in production)
		if (process.env.NODE_ENV !== 'production') {
			return callback(null, true);
		}
		
		callback(new Error('Not allowed by CORS'));
	},
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
	exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Other Middleware
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
	session({
		resave: false,
		saveUninitialized: false,
		secret: sessionSecret,
	})
);
// Serve static files from the 'documents' directory
app.use('/documents', express.static(path.join(__dirname, 'src', 'documents')));

// API routes
app.use('/api/v1/users', authRoutes);
app.use('/api/v1/evaluation', evaluationRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/analysis', analysisRoutes);
app.use('/api/v1/assignements', assignementsRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
EOF

# Set ownership
chown ${APP_USER}:${APP_USER} ${BACKEND_DIR}/app.js

echo "CORS fix applied!"
echo "Backup saved to: ${BACKEND_DIR}/app.js.backup"
echo ""
echo "Next steps:"
echo "1. Update .env file: sudo nano ${BACKEND_DIR}/.env"
echo "2. Set: CORS_ORIGIN=http://172.166.106.2,https://yourdomain.com"
echo "3. Restart backend: sudo -u ${APP_USER} pm2 restart growth-ai-backend"

