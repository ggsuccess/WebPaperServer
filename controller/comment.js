const mongoose = require('mongoose');
const express = require('express');
const commentRouter = express.Router();
const hotcommentRouter = express.Router();
const auth = require('../middleware/auth');
const { User } = require('./user');

const Comment = mongoose.model(
  'comments',
  new mongoose.Schema({
    userId: String,
    hotTopicId: String,
    text: String,
    date: String
  })
);

commentRouter.post('/', auth, async (req, res) => {
  console.log(req);
  const { userId, hotTopicId, text, date } = req.body;
  let comment = new Comment({
    userId: userId,
    hotTopicId: hotTopicId,
    text: text,
    date: date
  });
  let user = await User.find({ email: userId });
  user[0].comment.push(comment);

  await user[0].save();
  await comment.save();
  res.send('ok');
});

// const customer = await Customer.findByIdAndUpdate(req.params.id,
//   {
//     name: req.body.name,
//     isGold: req.body.isGold,
//     phone: req.body.phone
//   }, { new: true });

commentRouter.get('/', async (req, res, next) => {
  const { userId } = req.query;

  let comments = await Comment.find({ userId: userId }).sort('-date');
  if (!comments) return res.status(400).send('comment is not exist');
  res.send(comments);
});

hotcommentRouter.get('/', async (req, res) => {
  const { hottopicid } = req.query;

  try {
    if (hottopicid && hottopicid.length > 7) {
      let comments = await Comment.find({ hotTopicId: hottopicid }).sort(
        '-date'
      );
      if (comments.length === 0) return res.status(400).send('not comments');

      res.send(comments);
    } else {
      return res.status(400).send('input hottopicid');
    }
  } catch (err) {
    res.status(500).send('something wrong in get hottopic comments');
  }
});

module.exports = { commentRouter, hotcommentRouter };
