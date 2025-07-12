const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const SparePart = require('../models/SparePart');

// Middleware to check if user is admin (example, adjust logic as needed)
function isAdmin(req, res, next) {
  if (!req.session.userId || !req.session.isAdmin) {
    req.flash('error', 'You must be an admin to access this page.');
    return res.redirect('/auth/login');
  }
  next();
}

// Multer setup for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Admin dashboard (list all spare parts)
router.get('/', isAdmin, async (req, res) => {
  try {
    const parts = await SparePart.find();
    res.render('admin/index', { parts });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load spare parts.');
    res.redirect('/');
  }
});

// Show form to add new spare part
router.get('/spareparts/new', isAdmin, (req, res) => {
  res.render('admin/new');
});

// Create new spare part
router.post('/spareparts', isAdmin, upload.array('photos', 5), async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const photos = req.files ? req.files.map(f => '/uploads/' + f.filename) : [];
    const part = new SparePart({ name, price, description, photos });
    await part.save();
    req.flash('success', 'Spare part created.');
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to create spare part.');
    res.redirect('/admin/spareparts/new');
  }
});

// Show edit form
router.get('/spareparts/:id/edit', isAdmin, async (req, res) => {
  try {
    const part = await SparePart.findById(req.params.id);
    if (!part) {
      req.flash('error', 'Spare part not found.');
      return res.redirect('/admin');
    }
    res.render('admin/edit', { part });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load spare part.');
    res.redirect('/admin');
  }
});

// Update spare part
router.put('/spareparts/:id', isAdmin, upload.array('photos', 5), async (req, res) => {
  try {
    const part = await SparePart.findById(req.params.id);
    if (!part) {
      req.flash('error', 'Spare part not found.');
      return res.redirect('/admin');
    }
    const { name, price, description } = req.body;
    part.name = name;
    part.price = price;
    part.description = description;

    if (req.files && req.files.length) {
      const newPhotos = req.files.map(f => '/uploads/' + f.filename);
      part.photos = part.photos.concat(newPhotos);
    }

    await part.save();
    req.flash('success', 'Spare part updated.');
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update spare part.');
    res.redirect('/admin');
  }
});

// Delete spare part
router.delete('/spareparts/:id', isAdmin, async (req, res) => {
  try {
    const part = await SparePart.findById(req.params.id);
    if (!part) {
      req.flash('error', 'Spare part not found.');
      return res.redirect('/admin');
    }

    // Remove photos from disk
    part.photos.forEach(photoPath => {
      const fullPath = path.join(__dirname, '..', 'public', photoPath);
      fs.unlink(fullPath, err => {
        if (err) console.error('Failed to delete photo:', err);
      });
    });

    await SparePart.findByIdAndDelete(req.params.id);
    req.flash('success', 'Spare part deleted.');
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to delete spare part.');
    res.redirect('/admin');
  }
});

module.exports = router;
