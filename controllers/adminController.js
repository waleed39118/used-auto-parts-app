const User = require('../models/User');
const SparePart = require('../models/SparePart');

exports.dashboard = async (req, res) => {
  const users = await User.find();
  const spareParts = await SparePart.find().populate('owner carModel carType location');
  res.render('admin/dashboard', { users, spareParts });
};
