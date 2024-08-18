const express = require('express');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const UUID = require('../models/UUID');
const path = require('path');

const router = express.Router();
const secret = 'your_jwt_secret';
const Scan = require('../models/scan');


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

// Route to render the scanning page
router.get('/scanner', protect,(req, res) => {
    res.render('scanner');
});

// Route to handle scanned data
router.post('/scan', protect, async (req, res) => {
    const { data } = req.body;
    const uuid = data;
    try {
        const newScan = new Scan({ data });
        await newScan.save();
        console.log(data);

        const currentUUID = await UUID.findOne().sort({ date: -1 });
        const user = await Student.findById(req.user.id);
    
        if (currentUUID && currentUUID.uuid === uuid) {
            if (user.latestSubmittedUUID !== uuid) {
                await Student.findByIdAndUpdate(req.user.id, {
                    $push: { attendance: { date: new Date(), present: true, uuid } },
                    latestSubmittedUUID: uuid
                });
                return res.json({ success: true, alreadySubmitted: true, message: 'UUID is valid. Attendance marked.' });
            } else {
                return res.json({ success: true, alreadySubmitted: true, message: 'You have already submitted this UUID.' });
            }
        } else {
            return res.json({ success: false, alreadySubmitted: false, message: 'Invalid UUID.' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
});




module.exports = router;
