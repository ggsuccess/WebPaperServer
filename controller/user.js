const mongoose = require('mongoose');
const express = require('express');

const userSchema = new mongoose.Schema({
  name: String,
  pw: String,
  category: String,
  follow: String,
  bookmark: [String],
  comment: [String]
});
const User = mongoose.model('userlist', userSchema);
