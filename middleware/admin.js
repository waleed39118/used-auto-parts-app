const User = require('../models/User');

async function ensureAdmin(req, res, next) {
  if (!req.session.userId) {
    req.flash('error', 'Please log in.');
    return res.redirect('/login');
  }
  const user = await User.findById(req.session.userId);
  if (user && user.isAdmin) return next();
  req.flash('error', 'Access denied.');
  res.redirect('/');
}
module.exports = { ensureAdmin };
