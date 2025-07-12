const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Show register form
router.get('/register', (req, res) => {
  res.render('register');
});

// Handle registration
router.post('/register', async (req, res) => {
  try {
    const { username, password, phone } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      req.flash('error', 'Username already taken');
      return res.redirect('/users/register');
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = new User({ username, phone, passwordHash });
    await user.save();
    req.flash('success', 'Registration successful! Please login.');
    res.redirect('/users/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Registration failed.');
    res.redirect('/users/register');
  }
});

// Show login form
router.get('/login', (req, res) => {
  res.render('login');
});

// Handle login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      req.flash('error', 'Invalid username or password');
      return res.redirect('/users/login');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      req.flash('error', 'Invalid username or password');
      return res.redirect('/users/login');
    }
    req.session.userId = user._id;
    req.flash('success', 'Logged in successfully');
    res.redirect('/');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Login failed');
    res.redirect('/users/login');
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
