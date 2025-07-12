const mongoose = require('mongoose');
const CarTypeSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true }
});
module.exports = mongoose.model('CarType', CarTypeSchema);
