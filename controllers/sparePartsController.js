const SparePart = require('../models/SparePart');
const fs = require('fs');
const path = require('path');

// INDEX - list all spare parts
const SparePart = require('../models/SparePart');

exports.index = async (req, res) => {
  try {
    const parts = await SparePart.find().populate('user');
    res.render('spareparts/index', { parts });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load spare parts');
    res.render('spareparts/index', { parts: [] });
  }
};

// NEW - show form
exports.newForm = (req, res) => {
  res.render('spareparts/new');
};

// CREATE - with photos + owner
exports.create = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const photoPaths = req.files.map(file => file.filename);
    const newPart = new SparePart({
      name,
      price,
      description,
      photos: photoPaths,
      owner: req.session.userId
    });
    await newPart.save();
    req.flash('success', 'Spare part created successfully');
    res.redirect('/spareparts');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not create spare part');
    res.redirect('/spareparts/new');
  }
};

// SHOW - show details + phone
exports.show = async (req, res) => {
  try {
    const part = await SparePart.findById(req.params.id).populate('owner');
    if (!part) {
      req.flash('error', 'Spare part not found');
      return res.redirect('/spareparts');
    }
    res.render('spareparts/show', { part });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not load spare part');
    res.redirect('/spareparts');
  }
};

// EDIT
exports.editForm = async (req, res) => {
  try {
    const part = await SparePart.findById(req.params.id);
    if (!part) {
      req.flash('error', 'Spare part not found');
      return res.redirect('/spareparts');
    }
    res.render('spareparts/edit', { part });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not load edit form');
    res.redirect('/spareparts');
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    await SparePart.findByIdAndUpdate(req.params.id, { name, price, description });
    req.flash('success', 'Spare part updated successfully');
    res.redirect(`/spareparts/${req.params.id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not update spare part');
    res.redirect('/spareparts');
  }
};

// DELETE - also remove photos from disk
exports.delete = async (req, res) => {
  try {
    const part = await SparePart.findById(req.params.id);
    if (!part) {
      req.flash('error', 'Spare part not found');
      return res.redirect('/spareparts');
    }
    part.photos.forEach(photo => {
      fs.unlink(path.join('public/uploads', photo), err => {
        if (err) console.error(err);
      });
    });
    await part.deleteOne();
    req.flash('success', 'Spare part deleted successfully');
    res.redirect('/spareparts');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not delete spare part');
    res.redirect('/spareparts');
  }
};
