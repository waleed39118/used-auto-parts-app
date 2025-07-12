const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
const User = require('./models/User');
const SparePart = require('./models/SparePart');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Set view engine and views folder
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files & body parser
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Session & flash
app.use(session({
  secret: 'secret-session-key',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

// Middleware to make flash messages & user available in views
app.use(async (req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.userId = req.session.userId ?? null;
  res.locals.user = null;

  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      res.locals.user = user;
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  }
  next();
});

// Async error handler wrapper helper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Import routes
app.use('/users', require('./routes/users'));
app.use('/spareparts', require('./routes/spareparts'));

// Home route with async error handling
app.get('/', asyncHandler(async (req, res) => {
  const parts = await SparePart.find();
  res.render('index', { parts, userId: req.session.userId });
}));

// 404 handler
app.use((req, res) => {
  res.status(404).render('404');
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler caught an error:', err);
  res.status(err.status || 500);

  // Render an error page or send JSON
  res.render('error', { error: err }); 
});

// Handle uncaught exceptions 
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

// Start server
const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
