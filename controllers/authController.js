const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.registerForm = (req, res) => {
  res.render('auth/register');
};

exports.register = async (req, res) => {
  try {
    const { username, phone, password, password2 } = req.body;
    if (!username || !phone || !password || !password2) {
      req.flash('error', 'All fields are required');
      return res.redirect('/register');
    }
    if (password !== password2) {
      req.flash('error', 'Passwords do not match');
      return res.redirect('/register');
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      req.flash('error', 'Username already exists');
      return res.redirect('/register');
    }
    const hashed = await bcrypt.hash(password, 12);
    const user = new User({ username, phone, password: hashed });
    await user.save();
    req.flash('success', 'Registration successful! You can now log in.');
    res.redirect('/login');
  } catch (e) {
    req.flash('error', 'Something went wrong');
    res.redirect('/register');
  }
};

exports.loginForm = (req, res) => {
  res.render('auth/login');
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    req.flash('error', 'Please provide username and password');
    return res.redirect('/login');
  }
  const user = await User.findOne({ username });
  if (!user) {
    req.flash('error', 'Invalid username or password');
    return res.redirect('/login');
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    req.flash('error', 'Invalid username or password');
    return res.redirect('/login');
  }
  req.session.user = user;
  req.flash('success', 'Welcome back!');
  res.redirect('/spareparts');
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/login');
};
