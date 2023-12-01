/*
  TODO:
    add link to this tool in posted messages
    add text to readme to point to this tool
*/

class App {
  constructor() {
    this.UI = {};
    'inputSeed,inputEqu,inputCMin,inputCRange,colorRange,bgenEqu,bgenImg,brnd,cmain,msgDiv'.split(`,`).forEach( id => {
      this.UI[id] = document.getElementById(id);
    });

    this.UI.bgenEqu.onclick = () => this.genEqu();
    this.UI.bgenImg.onclick = () => this.genImg();
    this.UI.brnd.onclick = () => this.rndSeed();
    this.UI.inputCMin.oninput = () => this.updateColorRange();
    this.UI.inputCRange.oninput = () => this.updateColorRange();

    if (!this.getURL()) {
      this.UI.inputSeed.value = (new Date()).getTime();
      this.genEqu();
    }


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
      this.updateColorRange(false);
      this.setURL('seed');
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
    this.setURL('equ');
  }

  updateColorRange(redraw) {
    const min = parseFloat(this.UI.inputCMin.value);
    const range = parseFloat(this.UI.inputCRange.value);
    this.colorMin = min;
    this.colorRange = range;
    this.updateColorRangeStyle(min, range, redraw);
  }

  updateColorRangeStyle(min, range, redraw = true) {
    const step = range / 12;
    this.UI.colorRange.style.background = `linear-gradient(90deg,
      hsl(${min + 0 * step}, 75%, 50%),
      hsl(${min + 1 * step}, 75%, 50%),
      hsl(${min + 2 * step}, 75%, 50%),
      hsl(${min + 3 * step}, 75%, 50%),
      hsl(${min + 4 * step}, 75%, 50%),
      hsl(${min + 5 * step}, 75%, 50%),
      hsl(${min + 6 * step}, 75%, 50%),
      hsl(${min + 7 * step}, 75%, 50%),
      hsl(${min + 8 * step}, 75%, 50%),
      hsl(${min + 9 * step}, 75%, 50%),
      hsl(${min + 10* step}, 75%, 50%),
      hsl(${min + 11* step}, 75%, 50%),
      hsl(${min + 12* step}, 75%, 50%)
    )`;

    if (redraw) {
      this.unbounce();
    }
  }

  unbounce() {
    if (this.unbounceTimer !== undefined) {
      clearTimeout(this.unbounceTimer);
    }

    this.unbounceTimer = setTimeout(() => this.genImg(), 100);
  }

  rndSeed() {
    const seed = Math.round(Number.MAX_SAFE_INTEGER * Math.random());
    this.UI.inputSeed.value = seed;
    this.genEqu();
  }

  setURL(mode) {
    if (mode === 'seed') {
      window.history.replaceState({}, '', `${location.pathname}?seed=${this.UI.inputSeed.value}`);
    } else {
      //convert + to %2b to encode correctly and remove spaces to save bytes
      const equ = this.UI.inputEqu.value.replaceAll('+', '%2b').replaceAll(' ', '');
      window.history.replaceState({}, '', `${location.pathname}?equ=${equ}&color=${this.colorMin}&range=${this.colorRange}`);
    }
  }

  getURL() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const querySeed = urlParams.get('seed');
    const queryEqu = urlParams.get('equ');
    console.log('equ', queryEqu);
    const queryMinColor = urlParams.get('color');
    const queryRange = urlParams.get('range');

    if (querySeed === null && queryEqu === null) {
      return false;
    }

    if (querySeed !== null && queryEqu === null) {
      this.UI.inputSeed.value = querySeed;
      this.genEqu();
    } else if (querySeed === null && queryEqu !== null) {
      this.UI.inputSeed.value = '0';
      this.UI.inputEqu.value = queryEqu;
      this.colorMin = queryMinColor === null ? 0 : parseFloat(queryMinColor);
      this.colorRange = queryRange === null ? 360 : parseFloat(queryRange);

      this.UI.inputCMin.value = this.colorMin;
      this.UI.inputCRange.value = this.colorRange;

      this.genImg();
    }

    return true;
  }
}

const app = new App();
