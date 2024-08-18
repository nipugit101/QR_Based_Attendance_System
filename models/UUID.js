const mongoose = require('mongoose');

const uuidSchema = new mongoose.Schema({
  uuid: String,
  date: { type: Date, default: Date.now },
});

const UUID = mongoose.model('UUID', uuidSchema);
module.exports = UUID;
