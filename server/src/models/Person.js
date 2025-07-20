const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  contactEmail: { type: String, required: true, unique: true },
  totalSpent: { type: Number, default: 0 },
  visitCount: { type: Number, default: 0 },
  lastVisit: { type: Date },
});

const Person = mongoose.model('Person', personSchema);

module.exports = Person;