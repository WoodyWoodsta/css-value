
module.exports = parse;

function parse(str) {
  const cleanStr = str.replace(/^\s+|\s+$/, '');
  return new Parser(cleanStr).parse();
}

function Parser(str) {
  this.str = str;
}

Parser.prototype.skip = function(m) {
  this.str = this.str.slice(m.length);
};

Parser.prototype.comma = function() {
  const m = /^, */.exec(this.str);
  if (!m) return;
  this.skip(m[0]);
  return { type: 'comma', string: ',' };
};

Parser.prototype.operator = function() {
  const m = /^\/ */.exec(this.str);
  if (!m) return;
  this.skip(m[0]);
  return { type: 'operator', value: '/' };
};

Parser.prototype.ident = function() {
  const m = /^([\w-]+) */.exec(this.str);
  if (!m) return;
  this.skip(m[0]);
  return {
    type: 'ident',
    string: m[1],
  };
};

Parser.prototype.int = function() {
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
};

Parser.prototype.float = function() {
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
};

Parser.prototype.number = function() {
  return this.float() || this.int();
};

Parser.prototype.double = function() {
  const m = /^"([^"]*)" */.exec(this.str);
  if (!m) return m;
  this.skip(m[0]);
  return {
    type: 'string',
    quote: '"',
    string: `"${m[1]}"`,
    value: m[1],
  };
};

Parser.prototype.single = function() {
  const m = /^'([^']*)' */.exec(this.str);
  if (!m) return m;
  this.skip(m[0]);
  return {
    type: 'string',
    quote: "'",
    string: `'${m[1]}'`,
    value: m[1],
  };
};

Parser.prototype.string = function() {
  return this.single() || this.double();
};

Parser.prototype.color = function() {
  const m = /^(rgba?\([^)]*\)) */.exec(this.str);
  if (!m) return m;
  this.skip(m[0]);
  return {
    type: 'color',
    value: m[1],
  };
};

Parser.prototype.url = function() {
  const m = /^(url\([^)]*\)) */.exec(this.str);
  if (!m) return m;
  this.skip(m[0]);
  return {
    type: 'url',
    value: m[1],
  };
};

Parser.prototype.var = function() {
  const m = /^(var\([^)]*\)*) */.exec(this.str);
  if (!m) return m;
  this.skip(m[0]);
  return {
    type: 'variable',
    value: m[1],
  };
};

Parser.prototype.calc = function() {
  const m = /^(calc\([^)]*\)*) */.exec(this.str);
  if (!m) return m;
  this.skip(m[0]);
  return {
    type: 'calc',
    value: m[1],
  };
};

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

Parser.prototype.gradient = function() {
  const m = /^linear-gradient/.exec(this.str);
  if (!m) return m;
  this.skip(m[0]);

  const gradientStr = readToMatchingParen(this.str);
  this.skip(gradientStr);
  return {
    type: 'gradient',
    value: m[0] + gradientStr,
  };
};

Parser.prototype.value = function() {
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
};

Parser.prototype.parse = function() {
  const vals = [];

  while (this.str.length) {
    const obj = this.value();
    if (!obj) throw new Error(`failed to parse near '${this.str.slice(0, 10)}...'`);
    vals.push(obj);
  }

  return vals;
};
