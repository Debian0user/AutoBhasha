//==============================
//SERVER CONFIGURATION
//==============================

//==============================
//VARIABLES
//==============================

const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const despatchRoutes = require('./routes/despatchRoutes');
const acquiredRoutes = require('./routes/acquiredRoutes'); 

const app = express();
const port = process.env.PORT || 3000;

const initDatabase = require("./utils/initDatabase");

//====================================
//MIDDLEWARE 
//====================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware should come BEFORE routes
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,  // SET TRUE ONCE ENABLED WITH HTTPS
        maxAge: 24 * 60 * 60 * 1000  // 1 DAY
    }
}));

app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/users', userRoutes);
app.use('/api/despatch', despatchRoutes);
app.use('/api/acquired', acquiredRoutes); // NEW: Add acquired routes

//====================================
//ROUTES
//====================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

async function startServer() {
  await initDatabase();

  app.listen(port, () => {
    console.log("Server running on port",port);
  });
}

startServer();
