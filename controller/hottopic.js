const mongoose = require('mongoose');
const express = require('express');

const HotTopic = mongoose.model(
  'hottopic',
  new mongoose.Schema({
    articleList: [String],
    count: Number,
    topic: String,
    url: String,
    text: String
  })
);

//최대 다섯개 의 핫토픽
//각 카테고리별 탑 7개 선별 후 배치
