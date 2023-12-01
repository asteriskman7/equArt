const inBrowser = (typeof navigator) !== 'undefined';

console.log('inBrowser', inBrowser);

const fs = inBrowser ? undefined : require('fs');
const Canvas = inBrowser ? undefined : require('canvas');


class EquArtImg {
  constructor(seed, canvas, f, colorMin, colorRange) {
    this.imgSize = 512;
    this.cellSize = 2;
    this.canvas = inBrowser ? canvas : Canvas.createCanvas(this.imgSize, this.imgSize);
    this.ctx = this.canvas.getContext('2d');

    this.width = Math.floor(this.imgSize / this.cellSize);
    this.height = this.width;

    this.initialSeed = seed;
    this.seed = seed;

    this.symbolMap = {
      e: [
        {c: 10, s: ['x']}, 
        {c: 10, s: ['y']},
        {c: 10, s: ['e', 'e', '+']},
        {c: 10, s: ['e', 'e', '*']},
        {c: 10, s: ['e', 'e', '/']},
        {c: 10, s: ['e', 'e', '^']},
        {c: 1, s: ['e', 'e', 'p']},
        {c: 1, s: ['e', 's']},
        {c: 1, s: ['e', 't']},
        {c: 1, s: ['e', 'l']},
        {c: 1, s: ['e', 'e', '<']}
      ]
    };

    if (f === undefined) {
      this.genImg();
    } else {
      this.renderEqu(f, colorMin, colorRange);
    }
  }

  rnd() {
    //return a value in [0, 1)
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  getSymbolFromMap(s, curLen) {
    const sm = this.symbolMap[s];
    if (sm === undefined) {return [s];}
    const minLen = 5;
    const maxLen = 20;
    let v;
    let cards = [];
    let minCard;
    let maxCard;

    if (curLen < minLen) {
      minCard = 2;
      maxCard = sm.length - 1;
    } else if (curLen > maxLen) {
      minCard = 0;
      maxCard = 1;
    } else {
      minCard = 0;
      maxCard = sm.length - 1;
    }

    for (let ci = minCard; ci <= maxCard; ci++) {
      for (let count = 0; count < sm[ci].c; count++) {
        cards.push(sm[ci].s);
      }
    }

    const selectedCardIndex = Math.floor(this.rnd() * cards.length);
    return cards[selectedCardIndex];
  }

  rndFunction() {
    let f = ['e'];

    let anythingToExpand = true;  

    while (anythingToExpand) {
      let ef = [];
      anythingToExpand = false;
      f.forEach( s => {
        const newS = this.getSymbolFromMap(s, f.length);
        anythingToExpand = anythingToExpand || newS.reduce( (acc, e) => {
          return acc || (this.symbolMap[e] !== undefined);
        }, false);
        ef = ef.concat(newS);
      });

      f = ef;
    }

    return f;
  }

  static postfixToInfix(f) {
    const stack = [];

    f.forEach( s => {
      switch (s) {
        case '<': {
          const op1 = stack.pop();
          const op2 = stack.pop();
          stack.push(`(${op2} < ${op1})`)
          break;
        }
        case 's': {
          stack.push(`sin(${stack.pop()})`);
          break;
        }
        case 'a': {
          stack.push(`asin(${stack.pop()})`);
          break;
        }      
        case 't': {
          stack.push(`tan(${stack.pop()})`);
          break;
        }
        case 'l': {
          stack.push(`ln(${stack.pop()})`);
          break;
        }
        case 'x': {
          stack.push('x');
          break;
        }
        case 'y': {
          stack.push('y');
          break;
        }
        case '+': {
          const op1 = stack.pop();
          const op2 = stack.pop();
          stack.push(`(${op2} + ${op1})`);
          break;
        }
        case '*': {
          const op1 = stack.pop();
          const op2 = stack.pop();
          stack.push(`(${op2} * ${op1})`);
          break;
        }
        case '/': {
          const op1 = stack.pop();
          const op2 = stack.pop();
          stack.push(`(${op2} / ${op1})`);        
          break;
        }
        case 'p': {
          const op1 = stack.pop();
          const op2 = stack.pop();
           stack.push(`(${op2} ** ${op1})`);
           break;        
         }
        case '^': {
          const op1 = stack.pop();
          const op2 = stack.pop();
          stack.push(`(${op2} ^ ${op1})`);        
          break;
        }
        default: {
          throw 'unrecognized symbol ' + s;
        }      
      }
    });

    return stack[0];
  }

  static strToInfix(str) {
    str = str.replaceAll(' ', '');
    //need to replace multi-character functions with single characters to make splitting easier
    const fnMap = [
      ['sin', 's'],
      ['asin', 'a'],
      ['tan', 't'],
      ['ln', 'l'],
      ['**', 'p']
    ];

    fnMap.forEach( m => {
      str = str.replaceAll(m[0], m[1]);
    });

    let f = str.split``;
    
    return f;
  }

  static infixToPostfix(f) {
    //when you see an operator, remove the first open parenthesis to the left
    //  and move the operator to the right of the parenthesis at the same level as the one removed
    /*
      (((3+6)*(2-4))+7)
      ((36+*(2-4))+7)
      36+24-*7+
    */
    //we also need to convert prefix parts of the equation into postfix
    //sin(x + y)
    //
    //y x + s
    const curF = f.map( v => {
      if (v !== 'y' && v !== 'x') {
        //then it's an operator
        return {val: v, moved: false};
      } else {
        return {val: v};
      }
    });

    let i;
    let j;

    //convert prefix operators to postfix
    i = 0;
    const prefixChars = 'satl';
    while (i < curF.length) {
      const curElement = curF[i];
      const curSymbol = curElement.val;
      if (prefixChars.indexOf(curSymbol) !== -1 && !curElement.moved) {
        //remove from curF
        const op = curF.splice(i, 1)[0];
        op.moved = true;
        //find the closing paren
        let plevel = 0;
        j = i
        while (j < curF.length) {
          const jval = curF[j].val; 
          if (jval === '(') {
            plevel++;
          }
          if (jval === ')') {
            plevel--;
            if (plevel === 0) {
              curF.splice(j + 1, 0, op);
              break;
            }
          }
          j++;
        }
      } else {
        //skip
        i++;
      }
    }

    i = 0;
    const ignoreChars = '()xysatl';
    while (i < curF.length) {
      const curElement = curF[i];
      const curSymbol = curElement.val;
      if (ignoreChars.indexOf(curSymbol) !== -1) {
        //parenthesis or an operand so nothing to do
        i++;
      } else {
        if (curElement.moved) {
          //operator but already moved
          i++;
        } else {
          //operator so need to make changes
          //remove first ( to the left
          j = i - 1;
          while (j >= 0) {
            if (curF[j].val === '(') {
              curF.splice(j, 1);
              i--; //move back 1 space so we're still pointing at the operator after removing 1 item
              break;
            }
            j--;
          }
          //move the operator to the right
          const op = curF.splice(i, 1)[0];
          op.moved = true;
          let plevel = 0;
          j = i;
          while (j < curF.length) {
            const jval = curF[j].val; 
            if (jval === '(') {
              plevel++;
            }
            if (jval === ')') {
              plevel--;
              if (plevel === -1) {
                curF[j] = op;
                break;
              }
            }
            j++;
          }
        }
      }
    }

    return curF.map(v => v.val).join``.replaceAll(/[()]/g, '').split('');
  }

  evalFunction(f, x, y) {
    const stack = [];

    f.forEach( s => {
      switch (s) {
        case '<': {
          const op1 = stack.pop();
          const op2 = stack.pop();
          stack.push(+(op2 < op1));
          break;
        }
        case 's': {
          stack.push(Math.sin(stack.pop()));
          break;
        }
        case 'a': {
          stack.push(Math.asin(stack.pop()));
          break;
        }      
        case 't': {
          stack.push(Math.tan(stack.pop()));
          break;
        }
        case 'l': {
          stack.push(Math.log(stack.pop()));
          break;
        }
        case 'x': {
          stack.push(x);
          break;
        }
        case 'y': {
          stack.push(y);
          break;
        }
        case '+': {
          const op1 = stack.pop();
          const op2 = stack.pop();
          stack.push(op2 + op1);
          break;
        }
        case '*': {
          const op1 = stack.pop();
          const op2 = stack.pop();
          stack.push(op2 * op1);
          break;
        }
        case '/': {
          const op1 = stack.pop();
          const op2 = stack.pop();
          stack.push(op2 / op1);
          break;
        }
        case 'p': {
          const op1 = stack.pop();
          const op2 = stack.pop();
           stack.push(op2 ** op1);
           break;        
         }
        case '^': {
          const op1 = stack.pop();
          const op2 = stack.pop();
          stack.push(op2 ^ op1);
          break;
        }
        default: {
          throw 'unrecognized symbol ' + s;
        }       
      }
    });

    return stack[0];
  }

  angleDiff(a, b) {
    const phi = Math.abs(b - a) % 360;
    const diff = phi > 180 ? 360 - phi : phi;
    return diff;
  }

  //from https://stackoverflow.com/questions/4570333/string-compression-in-javascript
  en(c){var x='charCodeAt',b,e={},f=c.split(""),d=[],a=f[0],g=256;for(b=1;b<f.length;b++)c=f[b],null!=e[a+c]?a+=c:(d.push(1<a.length?e[a]:a[x](0)),e[a+c]=g,g++,a=c);d.push(1<a.length?e[a]:a[x](0));for(b=0;b<d.length;b++)d[b]=String.fromCharCode(d[b]);return d.join("")}

  getFunctionScore(f) {
    let imgData = new Array(this.width * this.height);

    for (let y = 0; y < this.height; y++) {  
      for (let x = 0; x < this.width; x++) {
        const h = this.evalFunction(f, x, y);      
        //note that the score is based on dh but we draw h. This is because dh is a measure
        // of how close colors are but drawing dh would prevent us from having colors greater than
        // 180
        const dh = (h !== Infinity && h !== -Infinity && !isNaN(h)) ? this.angleDiff(0, h) : 0;               

        imgData[y * this.width + x] = String.fromCharCode(Math.floor(dh * 255 / 360));
      }
    }
    const comp = this.en(imgData.join``);
    const complexValue = comp.length / (this.width * this.height);
    return complexValue;
  }

  genEqu() {
    let f = this.rndFunction();
    let fscore = this.getFunctionScore(f);
    let rerollCount = 0;
    const minScore = 0.06;
    const maxScore = 0.61;
    const maxRerolls = 10;
    while (fscore < minScore || fscore > maxScore && rerollCount < maxRerolls) {
      f = this.rndFunction();
      fscore = this.getFunctionScore(f);
      rerollCount++;
    }
    this.equationString = EquArtImg.postfixToInfix(f);
    this.equationScore = fscore;

    return f;
  }

  renderEqu(f, colorMinArg, colorRangeArg) {
    this.seed = this.initialSeed;
    const colorMin = colorMinArg ?? this.rnd() * 360;
    const colorRange = colorRangeArg ?? this.rnd() * 180 + 180;
    this.colorMin = colorMin;
    this.colorRange = colorRange;
    const sat = 50 + 50 * this.rnd();

    for (let y = 0; y < this.height; y++) {  
      for (let x = 0; x < this.width; x++) {
        const h = this.evalFunction(f, x, y);      
        const s = sat;
        const l = 50;

        const fillh = (h !== Infinity && h !== -Infinity && !isNaN(h)) ? 
          (colorMin + (((h % 360) + 360) % 360) * colorRange / 360) : colorMin;
        this.ctx.fillStyle = `hsl(${fillh}, ${s}%, ${l}%)`;
        this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
      }
    }
  }

  genImg() {
    const f = this.genEqu();
    this.renderEqu(f);
  }

  toFile(filename) {
    const buf = this.canvas.toBuffer();
    fs.writeFileSync(filename, buf);
  }

  getStream() {
    return this.canvas.createPNGStream();
  }
  
  getBuffer() {
    return this.canvas.toBuffer();
  }
}


if (!inBrowser) {
  exports.EquArtImg = EquArtImg;
}
