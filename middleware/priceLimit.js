module.exports = (req, res, next) => {
  if (req.body.price && req.body.price > 500) {
    req.flash('error', 'Price must be below 500 BHD');
    return res.redirect('back');
  }
  next();
};
