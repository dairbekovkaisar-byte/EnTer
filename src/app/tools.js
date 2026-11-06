/* Exam tools: a calculator with its own parser (no eval) and the periodic table. */
const CALC = (function () {
  function evaluate(src) {
    var s = String(src).replace(/\s+/g, ''), i = 0;
    function peek() { return s[i]; }
    function expr() {
      var v = term();
      while (peek() === '+' || peek() === '−') { var op = s[i++]; var r = term(); v = op === '+' ? v + r : v - r; }
      return v;
    }
    function term() {
      var v = unary();
      while (peek() === '×' || peek() === '÷') { var op = s[i++]; var r = unary(); if (op === '÷' && r === 0) throw new Error('div0'); v = op === '×' ? v * r : v / r; }
      return v;
    }
    function unary() {
      if (peek() === '−') { i++; return -unary(); }
      return postfix();
    }
    function postfix() {
      var v = primary();
      while (peek() === '²' || peek() === '%') { if (s[i++] === '²') v = v * v; else v = v / 100; }
      return v;
    }
    function primary() {
      var c = peek();
      if (c === undefined) throw new Error('end');
      if (c === '√') { i++; var r = postfix(); if (r < 0) throw new Error('root'); return Math.sqrt(r); }
      if (c === 'π') { i++; return Math.PI; }
      if (c === '(') { i++; var v = expr(); if (peek() === ')') i++; return v; }
      var m = /^\d+(,\d*)?/.exec(s.slice(i));
      if (!m) throw new Error('bad');
      i += m[0].length;
      return parseFloat(m[0].replace(',', '.'));
    }
    var out = expr();
    if (i < s.length) throw new Error('bad');
    if (!isFinite(out)) throw new Error('inf');
    return out;
  }
  function format(n) {
    var r = Math.round(n * 1e8) / 1e8;
    return String(r).replace('.', ',').replace('-', '−');
  }
  return { evaluate: evaluate, format: format };
})();

const PERIODIC = (function () {
  var raw = 'H 1.008,He 4.003,Li 6.94,Be 9.012,B 10.81,C 12.011,N 14.007,O 15.999,F 18.998,Ne 20.18,Na 22.99,Mg 24.305,Al 26.982,Si 28.085,P 30.974,S 32.06,Cl 35.45,Ar 39.948,K 39.098,Ca 40.078,Sc 44.956,Ti 47.867,V 50.942,Cr 51.996,Mn 54.938,Fe 55.845,Co 58.933,Ni 58.693,Cu 63.546,Zn 65.38,Ga 69.723,Ge 72.63,As 74.922,Se 78.971,Br 79.904,Kr 83.798,Rb 85.468,Sr 87.62,Y 88.906,Zr 91.224,Nb 92.906,Mo 95.95,Tc 98,Ru 101.07,Rh 102.91,Pd 106.42,Ag 107.87,Cd 112.41,In 114.82,Sn 118.71,Sb 121.76,Te 127.6,I 126.9,Xe 131.29,Cs 132.91,Ba 137.33,La 138.91,Ce 140.12,Pr 140.91,Nd 144.24,Pm 145,Sm 150.36,Eu 151.96,Gd 157.25,Tb 158.93,Dy 162.5,Ho 164.93,Er 167.26,Tm 168.93,Yb 173.05,Lu 174.97,Hf 178.49,Ta 180.95,W 183.84,Re 186.21,Os 190.23,Ir 192.22,Pt 195.08,Au 196.97,Hg 200.59,Tl 204.38,Pb 207.2,Bi 208.98,Po 209,At 210,Rn 222,Fr 223,Ra 226,Ac 227,Th 232.04,Pa 231.04,U 238.03,Np 237,Pu 244,Am 243,Cm 247,Bk 247,Cf 251,Es 252,Fm 257,Md 258,No 259,Lr 266,Rf 267,Db 268,Sg 269,Bh 270,Hs 277,Mt 278,Ds 281,Rg 282,Cn 285,Nh 286,Fl 289,Mc 290,Lv 293,Ts 294,Og 294'.split(',');
  function place(n) {
    if (n === 1) return [1, 1];
    if (n === 2) return [1, 18];
    if (n <= 4) return [2, n - 2];
    if (n <= 10) return [2, n + 8];
    if (n <= 12) return [3, n - 10];
    if (n <= 18) return [3, n];
    if (n <= 36) return [4, n - 18];
    if (n <= 54) return [5, n - 36];
    if (n <= 56) return [6, n - 54];
    if (n <= 71) return [9, n - 54];
    if (n <= 86) return [6, n - 68];
    if (n <= 88) return [7, n - 86];
    if (n <= 103) return [10, n - 86];
    return [7, n - 100];
  }
  return raw.map(function (x, i) { var p = x.split(' '), n = i + 1, at = place(n); return { n: n, sym: p[0], mass: p[1].replace('.', ','), row: at[0], col: at[1] }; });
})();
