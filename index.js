
module.exports = parse;

function parse(str) {
  const cleanStr = str.replace(/^\s+|\s+$/, '');
  return new Parser(cleanStr).parse();
}

class Parser {
  constructor(str) {
    this.str = str;
  }

  /**
   * Parse the string `Parser#string`
   */
  parse() {
    const vals = [];

    while (this.str.length) {
      const obj = this.value();
      if (!obj) throw new Error(`failed to parse near '${this.str.slice(0, 10)}...'`);
      vals.push(obj);
    }

    return vals;
  }

  value() {
    this.str = this.str.replace(/^\s+/, '');
    return this.operator()
      || this.number()
      || this.color()
      || this.gradient()
      || this.calc()
      || this.url()
      || this.var()
      || this.ident()
      || this.string()
      || this.comma();
  }

  // Types
  skip(m) {
    this.str = this.str.slice(m.length);
  }
  comma() {
    const m = /^, */.exec(this.str);
    if (!m) return;
    this.skip(m[0]);
    return { type: 'comma', string: ',' };
  }
  operator() {
    const m = /^\/ */.exec(this.str);
    if (!m) return;
    this.skip(m[0]);
    return { type: 'operator', value: '/' };
  }

  ident() {
    const m = /^([\w-]+) */.exec(this.str);
    if (!m) return;
    this.skip(m[0]);
    return {
      type: 'ident',
      string: m[1],
    };
  }

  int() {
    const m = /^(([-+]?\d+)([^\s\/]+)?) */.exec(this.str);
    if (!m) return;
    this.skip(m[0]);
    const n = ~~m[2];
    const u = m[3];

    return {
      type: 'number',
      string: m[1],
      unit: u || '',
      value: n,
    };
  }

  float() {
    const m = /^(((?:[-+]?\d+)?\.\d+)([^\s\/]+)?) */.exec(this.str);
    if (!m) return;
    this.skip(m[0]);
    const n = parseFloat(m[2]);
    const u = m[3];

    return {
      type: 'number',
      string: m[1],
      unit: u || '',
      value: n,
    };
  }
  number() {
    return this.float() || this.int();
  }

  double() {
    const m = /^"([^"]*)" */.exec(this.str);
    if (!m) return m;
    this.skip(m[0]);
    return {
      type: 'string',
      quote: '"',
      string: `"${m[1]}"`,
      value: m[1],
    };
  }

  single() {
    const m = /^'([^']*)' */.exec(this.str);
    if (!m) return m;
    this.skip(m[0]);
    return {
      type: 'string',
      quote: "'",
      string: `'${m[1]}'`,
      value: m[1],
    };
  }

  string() {
    return this.single() || this.double();
  }

  color() {
    const m = /^(rgba?\([^)]*\)) */.exec(this.str);
    if (!m) return m;
    this.skip(m[0]);
    return {
      type: 'color',
      value: m[1],
    };
  }

  url() {
    const m = /^(url\([^)]*\)) */.exec(this.str);
    if (!m) return m;
    this.skip(m[0]);
    return {
      type: 'url',
      value: m[1],
    };
  }

  var() {
    const m = /^var/.exec(this.str);
    if (!m) return m;
    this.skip(m[0]);

    const varStr = readToMatchingParen(this.str);
    this.skip(varStr);
    return {
      type: 'variable',
      value: m[0] + varStr,
    };
  }

  calc() {
    const m = /^calc/.exec(this.str);
    if (!m) return m;
    this.skip(m[0]);

    const calcStr = readToMatchingParen(this.str);
    this.skip(calcStr);
    return {
      type: 'calc',
      value: m[0] + calcStr,
    };
  }

  gradient() {
    const m = /^linear-gradient/.exec(this.str);
    if (!m) return m;
    this.skip(m[0]);

    const gradientStr = readToMatchingParen(this.str);
    this.skip(gradientStr);
    return {
      type: 'gradient',
      value: m[0] + gradientStr,
    };
  }
}


// === Helpers ===

function readToMatchingParen(str) {
  if (str[0] !== '(') {
    throw new Error('expected opening paren');
  }

  let opens = 0;
  let i;
  for (i = 0; i < str.length; i++) {
    if (str[i] === '(') {
      opens++;
    } else if (str[i] === ')') {
      opens--;
    }

    if (opens === 0) {
      break;
    }
  }

  if (opens !== 0) {
    throw new Error('Failed parsing: No matching paren');
  }

  return str.slice(0, i + 1);
}
