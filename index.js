/*
  TODO:
    display error messages
    add detailed information about image generation
    add detailed information about how to use the tool
    add link to this tool in posted messages
*/

class App {
  constructor() {
    this.UI = {};
    'inputSeed,inputEqu,bgenEqu,bgenImg,cmain,msgDiv'.split(`,`).forEach( id => {
      this.UI[id] = document.getElementById(id);
    });

    this.UI.bgenEqu.onclick = () => this.genEqu();
    this.UI.bgenImg.onclick = () => this.genImg();

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

    if (!isNaN(seed) && seed !== undefined) {
      const eai = new EquArtImg(seed, this.UI.cmain);
      this.UI.inputEqu.value = eai.equationString;
    } else {
      this.UI.inputEqu.value = 'Illegal seed. Must be an integer';
    }
  }

  genImg() {
    const seedStr = this.UI.inputSeed.value;
    let seed = parseInt(seedStr);

    if (isNaN(seed) || seed === undefined) {
      this.UI.inputSeed.value = 0;
      seed = 0;
    }
    const equ = this.UI.inputEqu.value;
    const infix = EquArtImg.strToInfix(equ);
    const f = EquArtImg.infixToPostfix(infix);
    const eai = new EquArtImg(seed, this.UI.cmain, f);


  }

}

const app = new App();
