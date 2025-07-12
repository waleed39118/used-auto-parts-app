const mongoose = require('mongoose');
const CarModelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});
module.exports = mongoose.model('CarModel', CarModelSchema);
