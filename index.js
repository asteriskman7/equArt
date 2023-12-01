/*
  TODO:
    add detailed information about image generation
    add detailed information about how to use the tool
    add link to this tool in posted messages
    add text to readme to point to this tool
    add button to generate random seed and redraw the image
*/

class App {
  constructor() {
    this.UI = {};
    'inputSeed,inputEqu,inputCMin,inputCRange,colorRange,bgenEqu,bgenImg,cmain,msgDiv'.split(`,`).forEach( id => {
      this.UI[id] = document.getElementById(id);
    });

    this.UI.bgenEqu.onclick = () => this.genEqu();
    this.UI.bgenImg.onclick = () => this.genImg();
    this.UI.inputCMin.oninput = () => this.updateColorRange();
    this.UI.inputCRange.oninput = () => this.updateColorRange();

    this.UI.inputSeed.value = (new Date()).getTime();
    this.genEqu();

  }

  setMsg(msg) {
    if (msg.length === 0) {
      this.UI.msgDiv.style.display = 'none';
    } else {
      this.UI.msgDiv.style.display = 'block';
      this.UI.msgDiv.innerText = msg;
    }
  }

  genEqu() {
    const seedStr = this.UI.inputSeed.value;
    const seed = parseInt(seedStr);
    this.setMsg('');

    if (!isNaN(seed) && seed !== undefined) {
      const eai = new EquArtImg(seed, this.UI.cmain);
      this.UI.inputEqu.value = eai.equationString;
      this.UI.inputCMin.value = eai.colorMin;
      this.UI.inputCRange.value = eai.colorRange;
      this.updateColorRange();
    } else {
      this.UI.inputEqu.value = '';
      this.setMsg('Illegal seed. Must be an integer');
    }
  }

  genImg() {
    const seedStr = this.UI.inputSeed.value;
    let seed = parseInt(seedStr);
    this.setMsg('');

    if (isNaN(seed) || seed === undefined) {
      this.UI.inputSeed.value = 0;
      seed = 0;
    }
    const equ = this.UI.inputEqu.value.replaceAll(' ', '');
    const infix = EquArtImg.strToInfix(equ);
    const f = EquArtImg.infixToPostfix(infix);
    const equChk = EquArtImg.postfixToInfix(f).replaceAll(' ', '');
    if (equ !== equChk) {
      this.setMsg(`Equation parse failure.\nYour equation:${equ}\nParsed result: ${equChk}`);
      console.log(equ);
      console.log(equChk);
    }
    const eai = new EquArtImg(seed, this.UI.cmain, f, this.colorMin, this.colorRange);
  }

  updateColorRange() {
    const min = parseFloat(this.UI.inputCMin.value);
    const range = parseFloat(this.UI.inputCRange.value);
    this.colorMin = min;
    this.colorRange = range;
    this.updateColorRangeStyle(min, range);
  }

  updateColorRangeStyle(min, range) {
    const step = range / 12;
    this.UI.colorRange.style.background = `linear-gradient(90deg,
      hsl(${min + 0 * step}, 100%, 50%),
      hsl(${min + 1 * step}, 100%, 50%),
      hsl(${min + 2 * step}, 100%, 50%),
      hsl(${min + 3 * step}, 100%, 50%),
      hsl(${min + 4 * step}, 100%, 50%),
      hsl(${min + 5 * step}, 100%, 50%),
      hsl(${min + 6 * step}, 100%, 50%),
      hsl(${min + 7 * step}, 100%, 50%),
      hsl(${min + 8 * step}, 100%, 50%),
      hsl(${min + 9 * step}, 100%, 50%),
      hsl(${min + 10* step}, 100%, 50%),
      hsl(${min + 11* step}, 100%, 50%),
      hsl(${min + 12* step}, 100%, 50%)
    )`;

    this.unbounce();
  }

  unbounce() {
    if (this.unbounceTimer !== undefined) {
      clearTimeout(this.unbounceTimer);
    }

    this.unbounceTimer = setTimeout(() => this.genImg(), 100);
  }

}

const app = new App();
