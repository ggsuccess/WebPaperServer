const mongoose = require('mongoose');
const express = require('express');
const request = require('request');
const hottopicRouter = express.Router();
const { API_KEY_COOKIE } = require('../key');
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
    img: String,
    category: String
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
    keyword: String
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
  // console.log('검색어', query);

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
      let info = JSON.parse(body); //query로 검색한 기사객체 배열

      try {
        for (let i = 0; i < info.value.length; i++) {
          let news = info.value[i];
          // console.log('뉴스객체', news);
          if (news.category) {
            let model = new LinkedNews({
              category: news.category,
              url: news.url,
              name: news.name,
              img: news.image.thumbnail.contentUrl,
              count: 0,
              date: news.datePublished,
              keyword: query
            });

            await LinkedNews.find({ url: model.url }, (err, docs) => {
              if (!err && docs.length === 0) {
                model.save();
              }
            });
          }
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
    //result  각 카테고리별 최대 조회수 기사 배열
    let hottopic = new HotTopic({
      articleList: [],
      count: result[i].count,
      img: result[i].img,
      topic: result[i].name,
      url: result[i].url,
      text: result[i].description,
      del: 'del',
      category: result[i].category
    });
    await hottopic.save();

    saveLinkedArticle(
      //각 기사제목 앞 세단어 검색
      result[i].name,
      API_KEY_COOKIE,
      'en-us',
      result[i].category,
      20
    );
    let keyword = getKeyword(result[i].name);
    console.log(keyword);
    try {
      let linkednews = await LinkedNews.find({ keyword: keyword });
      console.log('===========', linkednews);
      hottopic.articleList = linkednews;
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
