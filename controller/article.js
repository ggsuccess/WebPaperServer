const mongoose = require('mongoose');
const express = require('express');

const articleSchema = new mongoose.Schema({
  category: String,
  url: String,
  img: String,
  count: Number,
  keword: [String],
  editor: String
});

const Article = mongoose.model('article', articleSchema);
