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

// CORS Middleware: allow requests from http://localhost:3001
app.use(cors({
	origin:  corsvar.origin,
	credentials: true
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