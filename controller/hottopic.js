const mongoose = require('mongoose');
const express = require('express');
const request = require('request');
const hottopicRouter = express.Router();
const API_KEY_COOKIE = require('../key');
const BING_ENDPOINT = 'https://api.cognitive.microsoft.com/bing/v7.0/news';
const {
  getCategory,
  Sports,
  Business,
  Entertainment,
  Health,
  Politics,
  Products,
  ScienceAndTechnology
} = require('./category');

let categoryArr = [
  Sports,
  Business,
  Entertainment,
  Health,
  Politics,
  Products,
  ScienceAndTechnology
];

const HotTopic = mongoose.model(
  'hottopic',
  new mongoose.Schema({
    articleList: Array,
    count: Number,
    topic: String,
    url: String,
    text: String,
    del: String,
    img: String
  })
);

const LinkedNews = mongoose.model(
  'linkednews',
  new mongoose.Schema({
    category: String,
    url: String,
    name: String,
    img: String,
    count: 0,
    provider: String,
    date: String,
    description: String,
    topicurl: String
  })
);

function getKeyword(query) {
  let count = 0;
  for (let i = 0; i < query.length; i++) {
    if (query[i] === ' ') count++;
    if (count === 3) {
      return query.slice(0, i);
    }
  }
}

function saveLinkedArticle(query, key, lang, category, count) {
  query = getKeyword(query);
  console.log('검색어', query);

  let options =
    'mkt=' + lang + '&category=' + category + '&count=' + count + '&offset=0';
  // console.log(options);
  if (query) {
    var queryurl =
      BING_ENDPOINT +
      '/search' +
      '?q=' +
      encodeURIComponent(query) +
      '&' +
      options;
  } else {
    var queryurl = BING_ENDPOINT + '?' + options;
  }

  var option = {
    url: queryurl,
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      Accept: 'application/json'
    }
  };

  request.get(option, async (err, res, body) => {
    if (!err && res.statusCode == 200) {
      let info = JSON.parse(body);
      // console.log(info);
      try {
        for (let i = 0; i < info.value.length; i++) {
          let news = info.value[i];
          let Model = getCategory(news.category);
          if (Model) {
            let model = await Model.find({ url: news.url });
            model.keyword = query;
            await model.save();
          }
          // let article = new LinkedNews({
          //   category: news.category,
          //   url: news.url,
          //   name: news.name,
          //   img: news.image ? news.image.thumbnail.contentUrl : '',
          //   count: 0,
          //   provider: news.provider[0].name,
          //   description: news.description,
          //   date: news.datePublished
          // });
          // result.push(article);
          // console.log(article);
        }
      } catch (err) {
        console.log(err);
      }
    }
  });
}

async function getHotTopic() {
  let model;
  let result = [];
  try {
    for (let i = 0; i < categoryArr.length; i++) {
      // console.log(categoryArr[i]);
      model = await categoryArr[i].find().sort('-count');
      result.push(model[0]);
    }
  } catch (err) {
    console.log(err);
  }
  // console.log('===================', result);

  HotTopic.deleteMany({ del: 'del' }, async (err, data) => {
    if (err) {
      console.log('에러', err);
    } else {
      console.log('결과', data);
    }
  });

  for (let i = 0; i < result.length; i++) {
    let hottopic = new HotTopic({
      articleList: [],
      count: result[i].count,
      img: result[i].img,
      topic: result[i].name,
      url: result[i].url,
      text: result[i].description,
      del: 'del'
    });
    await hottopic.save();

    saveLinkedArticle(
      result[i].name,
      API_KEY_COOKIE,
      'en-us',
      result[i].category,
      20
    );
    let Model = getCategory(result[i].category);
    try {
      let model = await Model.find({ keyword: result[i].keyword });

      hottopic.articleList = model;
      await hottopic.save();
    } catch (err) {
      console.log(err);
    }
  }
}

hottopicRouter.get('/', async (req, res) => {
  try {
    let hottopic = await HotTopic.find().sort('-count');
    res.send(hottopic);
  } catch (err) {
    console.log(err);
  }
});

//최대 다섯개 의 핫토픽
//존재하는 내용 모두 제거
//각 카테고리별 탑 7개 선별 후 배치

module.exports = { getHotTopic, hottopicRouter };
