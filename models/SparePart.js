const mongoose = require('mongoose');

const sparePartSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: Number,
  phone: String,
  photos: [String],
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true });

module.exports = mongoose.model('SparePart', sparePartSchema);
