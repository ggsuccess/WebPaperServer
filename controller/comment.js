const mongoose = require('mongoose');
const express = require('express');
const commentRouter = express.Router();

const Comment = mongoose.model(
  'comments',
  new mongoose.Schema({
    userId: String,
    hotTopicId: String,
    text: String,
    date: String
  })
);

commentRouter.post('/', async (req, res) => {
  const { userId, hotTopicId, text, date } = req.body;

  let comment = new Comment({
    userId: userId,
    hotTopicId: hotTopicId,
    text: text,
    date: date
  });
  comment.save();
  res.send('ok');
});

module.exports = { commentRouter };
