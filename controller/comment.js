const mongoose = require('mongoose');
const express = require('express');
const commentRouter = express.Router();
const hotcommentRouter = express.Router();
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
  const { userId } = req.query;
  let comments = await Comment.find({ userId: userId }).sort('-date');
  if (!comments) return res.status(400).send('comment is not exist');

  res.send(comments);
});

hotcommentRouter.get('/', async (req, res) => {
  const { hottopicid } = req.query;

  if (hottopicid && hottopicid.length > 7) {
    let comments = await Comment.find({ hotTopicId: hottopicid }).sort('-date');
    if (comments.length === 0) return res.status(400).send('not comments');

    res.send(comments);
  } else {
    return res.status(400).send('input hottopicid');
  }
});

module.exports = { commentRouter, hotcommentRouter };
