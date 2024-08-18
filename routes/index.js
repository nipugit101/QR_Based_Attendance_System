const express = require('express');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const UUID = require('../models/UUID');
const path = require('path');

const router = express.Router();
const secret = 'your_jwt_secret';

// Middleware to protect routes
const protect = async (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, secret);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).send('Not authorized, token failed');
    }
  } else {
    res.status(401).send('Not authorized, no token');
  }
};

// Route for the root URL
router.get('/', (req, res) => {
  res.redirect('/register');
});

// Index page
router.get('/index', protect, async (req, res) => {
  const user = await Student.findById(req.user.id);
  const idcount = await UUID.countDocuments({});
  const attendanceCount = user.attendance.length;
  const studentname = user.fullname;
  const studentroll = user.rollNumber;
  res.render('index', { title: 'Home', user, idcount, attendanceCount, studentroll, studentname });
});

// Scan QR page
router.get('/scan-qr', protect, async (req, res) => {
  res.render('qr-code');
});

// Serve QR code
router.get('/qr-code', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/qr_codes/latest.png'));
});


router.get("/scan-qr-admin",(req,res)=>{
  res.render('scan-qr-admin');
})

// Download QR code
router.post('/downloadQR', protect, (req, res) => {
  const file = path.join(__dirname, '../public/qr_codes/latest.png');
  res.download(file, 'latest.png', (err) => {
    if (err) {
      console.log('Error downloading the file:', err);
      res.status(500).send('Error downloading the file');
    }
  });
});

// Verify UUID
router.post('/verify-uuid', protect, async (req, res) => {
  const { uuid } = req.body;
  const currentUUID = await UUID.findOne().sort({ date: -1 });
  const user = await Student.findById(req.user.id);

  if (currentUUID && currentUUID.uuid === uuid) {
    if (user.latestSubmittedUUID !== uuid) {
      await Student.findByIdAndUpdate(req.user.id, {
        $push: { attendance: { date: new Date(), present: true, uuid } },
        latestSubmittedUUID: uuid
      });
      res.render('qr-code', { title: 'Scan QR', alreadySubmitted: true, message: 'UUID is valid. Attendance marked.' });
    } else {
      res.render('qr-code', { title: 'Scan QR', alreadySubmitted: true, message: 'You have already submitted this UUID.' });
    }
  } else {
    res.render('qr-code', { title: 'Scan QR', alreadySubmitted: false, message: 'Enter Id' });
  }
});

// Attendance page
router.get('/attendance', protect, async (req, res) => {
  const user = await Student.findById(req.user.id);
  const totalClasses = await UUID.countDocuments();
  const attendedClasses = user.attendance.filter(record => record.present).length;
  res.render('attendance', { title: 'Your Attendance', attendedClasses, totalClasses });
});

// Logout
router.get('/logout', (req, res) => {
  res.cookie('token', "");
  res.redirect('/login');
});

module.exports = router;
