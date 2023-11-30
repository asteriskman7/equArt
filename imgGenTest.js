"use strict";

//test file to use the EquArtImg.js file to generate an image in node without
//  posting anything

const fs = require('fs');
const EquArtImg = require('./EquArtImg');


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

  console.log('IMAGE GENERATED', tmpfile);
  console.log(msg);
}

console.log('loaded');

postImg();
//postTxt('Hello Art!');
