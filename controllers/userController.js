const User = require('../models/User');
const SparePart = require('../models/SparePart');

exports.listUsers = async (req, res) => {
  const users = await User.find();
  res.render('users/list', { users });
};

exports.userProfile = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    req.flash('error', 'User not found');
    return res.redirect('/users');
  }
  const spareParts = await SparePart.find({ owner: user._id });
  res.render('users/profile', { user, spareParts });
};
