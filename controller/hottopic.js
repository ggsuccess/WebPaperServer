const mongoose = require('mongoose');
const express = require('express');

const hotTopicSchema = new mongoose.Schema({
  articleList: [String],
  comments: [String],
  count: Number,
  topic: String,
  url: String,
  text: String
});

const HotTopic = mongoose.model('hottopic', hotTopicSchema);
