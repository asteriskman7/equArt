"use strict";

require('dotenv').config();
const fs = require('fs');
const Mastodon = require('mastodon');
const EquArtImg = require('./EquArtImg');


const M = new Mastodon({
  access_token: process.env.ACCESS_TOKEN,
  timeout_ms: 60*1000,
  api_url: 'https://botsin.space/api/v1/'
});

function postMsg() {
  const msg = 'Hello world';

  //TODO: generate image
  //TODO: attach image to post
  //TODO: include equation info in post status
  //TODO: include some hashtags in post status

  M.post('statuses', {
    status: msg 
  }, (err, data, response) => {
    console.log('ERR:', err);
    console.log('DATA:', data);
    console.log('RESP:', response);
  });
}

let lastDate = (new Date()).getDate();

function tick() {
  const curDate = (new Date()).getDate();
  if (curDate !== lastDate) {
    console.log('POSTING @', new Date());
    postMsg();
    lastDate = curDate;
  }
}

//tick every 5 minutes
setInterval(tick, 1000 * 60 * 5);

console.log('loaded');
