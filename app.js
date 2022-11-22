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

function postImg() {
  console.log('POSTMSG');
  const seed = (new Date()).getTime();
  const eai = new EquArtImg.EquArtImg(seed);
  const msg = `Today's equation:
${eai.equationString}

Seed: ${seed}

#GenerativeArt #ArtBot`;

  const tmpfile = `./IMG_${seed}_.png`;

  eai.toFile(tmpfile);

  console.log('IMAGE GENERATED');

  M.post('media', {file: fs.createReadStream(tmpfile)}).then(resp => {
    console.log('MEDIARESP:', resp);
    const mediaID = resp.data.id;
    fs.unlinkSync(tmpfile);
    M.post('statuses', {
      status: msg, 
      media_ids: [mediaID]
    }, (err, data, response) => {
      console.log('ERR:', err);
      console.log('DATA:', data);
      console.log('RESP:', response);
    });
  });
}

function postTxt(msg) {
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
    postImg();
    lastDate = curDate;
  }
}

//tick every 5 minutes
setInterval(tick, 1000 * 60 * 5);

console.log('loaded');

//postImg();
//postTxt('Hello Art!');
