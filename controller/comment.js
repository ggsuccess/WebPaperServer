const mongoose = require('mongoose');
const express = require('express');

const commentSchema = new mongoose.Schema({
  userId: String,
  hotTopicId: String,
  text: String,
  date: String
});

const Comment = mongoose.model('comment', commentSchema);
