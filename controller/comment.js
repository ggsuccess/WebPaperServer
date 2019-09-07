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
  await comment.save();
  res.send('ok');
});

commentRouter.get('/', async (req, res) => {
  const { userId } = req.body;
  let comments = await Comment.find({ userId: userId }).sort('-date');
  if (!comments) return res.status(400).send('comment is not exist');

  res.send(comments);
});

module.exports = { commentRouter };
