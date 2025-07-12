function ensureAuthenticated(req, res, next) {
  if (req.session.userId) return next();
  req.flash('error', 'Please log in.');
  res.redirect('/login');
}
module.exports = { ensureAuthenticated };
