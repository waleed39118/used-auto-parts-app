const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const SparePart = require('../models/SparePart');

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Allowed image types
const allowedTypes = /jpeg|jpg|png|gif|bmp|webp/;
const fileFilter = (req, file, cb) => {
  const mimetype = file.mimetype.toLowerCase();
  if (allowedTypes.test(mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({ storage,
  fileFilter,
  imits: { fileSize: 5 *1024 * 1024 }   //5 MB file size limit
 });

// List all spare parts
router.get('/', async (req, res) => {
  try {
    const parts = await SparePart.find();
    res.render('spareparts/index', { parts });
  } catch (err) {
    req.flash('error', 'Failed to load spare parts.');
    res.redirect('/');
  }
});

// Render form to add new spare part
router.get('/new', (req, res) => {
  if (!req.session.userId) {
    req.flash('error', 'You must be logged in to add a spare part.');
    return res.redirect('/users/login');
  }
  res.render('spareparts/new');
});

// Handle new spare part creation
router.post('/new', upload.array('photos', 5), async (req, res) => {
  try {
    const { name, description, price, phone } = req.body;
    if (!req.session.userId) {
      req.flash('error', 'You must be logged in to add a spare part.');
      return res.redirect('/users/login');
    }

    const photoFilenames = req.files.map(file => '/uploads/' + file.filename);

    const newPart = new SparePart({
      name,
      description,
      price,
      phone,
      photos: photoFilenames,
      owner: req.session.userId
    });

    await newPart.save();

    req.flash('success', 'Spare part added successfully!');
    res.redirect('/');
  } catch (error) {
    console.error('Error adding spare part:', error);
    req.flash('error', 'Failed to add spare part. Please try again.');
    res.redirect('/spareparts/new');
  }
});

module.exports = router;
