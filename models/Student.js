const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  fullname: String,
  rollNumber: String,
  email: String,
  password: String,
  attendance: [
    {
      date: Date,
      present: Boolean,
      uuid: String 
    }
  ],
  latestSubmittedUUID: String
});

studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

studentSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
