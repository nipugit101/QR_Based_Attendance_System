const mongoose = require('mongoose');
const Admin = require('./models/Admin'); // Adjust the path accordingly

mongoose.connect('mongodb://localhost/attendance_db');

const createAdmin = async () => {
  const admin = new Admin({
    name: 'Admin',
    email: 'admin@gmail.com',
    password: 'admin101',
  });

  await admin.save();
  console.log('Admin user created');
  mongoose.connection.close();
};

createAdmin().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
