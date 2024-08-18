const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const fs = require('fs');
const UUID = require('./models/UUID');
const expressLayouts = require('express-ejs-layouts');
const crypto = require('crypto');

const authRoutes = require('./routes/auth');
const indexRoutes = require('./routes/index');
const adminRoutes = require('./routes/admin');
const scannerRoutes = require('./routes/scanner');

const app = express();
const port = 3008;

const mongoURI = 'mongodb://localhost:27017/attendance_db';

const uuidModel = require("./models/UUID");
const studentModel = require("./models/Student");

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout');

app.use('/', authRoutes);
app.use('/', indexRoutes);
app.use('/', adminRoutes);
app.use('/', scannerRoutes);

async function generateAndStoreUUID() {
  const newUUID = uuidv4();
  const uuidDoc = new UUID({ uuid: newUUID });
  await uuidDoc.save();
  const qrCodePath = path.join(__dirname, 'public', 'qr_codes', 'latest.png');
  await QRCode.toFile(qrCodePath, newUUID);
  console.log('New UUID and QR code generated:', newUUID);
}

app.get('/downloadQR', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'qr_codes', 'latest.png');
  res.download(filePath, 'latest.png', (err) => {
    if (err) {
      console.error('Error downloading QR code:', err);
      res.status(500).send('Error downloading QR code');
    }
  });
});

cron.schedule('0 0 * * *', () => {
  generateAndStoreUUID();
});

// Generate the initial UUID
generateAndStoreUUID();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
