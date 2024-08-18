const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

const router = express.Router();
const secret = 'your_jwt_secret';

// Register route
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

router.post('/register', async (req, res) => {
  const { fullname, rollNumber, email, password } = req.body;
  const student = new Student({ fullname, rollNumber, email, password });
  await student.save();
  res.redirect('/login');
});

// Login route
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

router.post('/login', async (req, res) => {
  const { email, password, isAdmin } = req.body;
  const Model = isAdmin ? Admin : Student;
  const user = await Model.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    const token = jwt.sign({ id: user._id, isAdmin }, secret, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/index');
  } else {
    res.status(401).send('Invalid email or password');
  }
});

module.exports = router;
