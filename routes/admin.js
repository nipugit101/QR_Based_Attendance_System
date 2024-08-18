const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');  
const Student = require('../models/Student');
const UUID = require('../models/UUID');

const router = express.Router();
const secret = 'your_jwt_secret';

// Middleware to protect admin routes
const protectAdmin = async (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, secret);
      if (decoded.isAdmin) {
        req.user = decoded;
        next();
      } else {
        res.status(401).send('Not authorized, not an admin');
      }
    } catch (error) {
      res.status(401).send('Not authorized, token failed');
    }
  } else {
    res.status(401).send('Not authorized, no token');
  }
};

// Admin login route
router.get('/admin-login', (req, res) => {
  res.render('admin-login', { title: 'Admin Login'});
});

router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (admin && await admin.matchPassword(password)) {
    const token = jwt.sign({ id: admin._id, isAdmin: true }, secret, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/admin');
  } else {
    res.status(401).send('Invalid email or password');
  }
});

// Admin page
router.get('/admin', protectAdmin, async (req, res) => {
  const students = await Student.find();
  const totalClasses = await UUID.countDocuments();
  res.render('admin', { title: 'Admin Dashboard', students, totalClasses});
});

module.exports = router;
