/* Generated tasks: the answer is computed, never typed by hand.
   Every generator returns {tp, type, text, opts, ans, why, simple?, mem?, list?}. */
var QGEN = (function () {
  function rng(seed) { var s = (seed * 2654435761) >>> 0 || 1; return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  function int(r, a, b) { return a + Math.floor(r() * (b - a + 1)); }
  function pick(r, arr) { return arr[int(r, 0, arr.length - 1)]; }
  function money(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₸'; }
  function num(n) { return String(Math.round(n * 1000) / 1000).replace('.', ',').replace('-', '−'); }
  function shuffle(r, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = int(r, 0, i); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  /* four distinct options, the right one first before shuffling */
  function single(r, right, wrong, fmt) {
    fmt = fmt || String;
    var seen = {}, list = [];
    [right].concat(wrong).forEach(function (v) { var s = fmt(v); if (!seen[s] && list.length < 4) { seen[s] = 1; list.push(s); } });
    var bump = 1;
    while (list.length < 4) { var s = fmt(right + bump); if (!seen[s]) { seen[s] = 1; list.push(s); } bump = bump > 0 ? -bump : -bump + 1; }
    var order = shuffle(r, list);
    return { opts: order, ans: order.indexOf(fmt(right)) };
  }
  function pair(r, right, wrongs) { /* text options: repeats are dropped */
    var key = function (x) { return JSON.stringify(x); }, seen = {}, list = [right];
    seen[key(right)] = 1;
    wrongs.forEach(function (w) { if (!seen[key(w)] && list.length < 4) { seen[key(w)] = 1; list.push(w); } });
    var order = shuffle(r, list);
    return { opts: order, ans: order.indexOf(right) };
  }
  function merge(a, b) { Object.keys(b).forEach(function (k) { a[k] = b[k]; }); return a; }
  function sub(n) { return String(n).replace(/\d/g, function (d) { return '₀₁₂₃₄₅₆₇₈₉'[+d]; }); }
  /* a signed term of a polynomial: '+ 3x', '− x', nothing for zero */
  function term(v, s) { s = s || ''; if (!v) return ''; var abs = Math.abs(v); return ' ' + (v < 0 ? '− ' : '+ ') + (abs === 1 && s ? '' : abs) + s; }

  var MLIT = [
    function (r) { var p = int(r, 3, 40) * 1000, d = pick(r, [10, 15, 20, 25, 30, 40, 50]), res = p * (100 - d) / 100;
      return merge({ tp: 0, text: ['Куртка стоила ' + money(p) + '. Её уценили на ' + d + '%. Сколько она стоит теперь?', 'Күртеше ' + money(p) + ' тұрды. Бағасы ' + d + '%-ға төмендетілді. Енді ол қанша тұрады?'], why: [d + '% от ' + money(p) + ' это ' + money(p - res) + '. Остаётся ' + money(res) + '.', money(p) + ' сомасының ' + d + '%-ы — ' + money(p - res) + '. ' + money(res) + ' қалады.'], simple: ['Найди скидку и вычти её из цены: ' + p + ' × ' + d + ' : 100 = ' + (p - res) + '.', 'Жеңілдікті тауып, бағадан шегер: ' + p + ' × ' + d + ' : 100 = ' + (p - res) + '.'] }, single(r, res, [p - res, p - d * 100, p * d / 100 + p], money)); },
    function (r) { var n = pick(r, [20, 25, 40, 50]), k = int(r, 2, n - 2), res = k * 100 / n;
      return merge({ tp: 0, text: ['В классе ' + n + ' учеников, ' + k + ' из них занимаются спортом. Какой это процент?', 'Сыныпта ' + n + ' оқушы бар, олардың ' + k + '-і спортпен айналысады. Бұл қанша пайыз?'], why: [k + ' : ' + n + ' × 100 = ' + num(res) + '%.', k + ' : ' + n + ' × 100 = ' + num(res) + '%.'] }, single(r, res, [res + 10, res - 5 > 0 ? res - 5 : res + 5, k, 100 - res], function (v) { return num(v) + '%'; })); },
    function (r) { var a = int(r, 2, 6), per = int(r, 3, 9) * 100, c = a + int(r, 1, 6), res = per * c;
      return merge({ tp: 1, text: [a + ' кг яблок стоят ' + money(per * a) + '. Сколько стоят ' + c + ' кг?', a + ' кг алма ' + money(per * a) + ' тұрады. ' + c + ' кг қанша тұрады?'], why: ['1 кг стоит ' + money(per) + '. Значит ' + c + ' кг стоят ' + money(res) + '.', '1 кг ' + money(per) + ' тұрады. Демек ' + c + ' кг ' + money(res) + ' тұрады.'] }, single(r, res, [res + per, res - per, per * a + c * 100], money)); },
    function (r) { var v = pick(r, [40, 50, 60, 70, 80, 90]), t = int(r, 2, 6), res = v * t;
      return merge({ tp: 1, text: ['Автобус едет со скоростью ' + v + ' км/ч. Какой путь он проедет за ' + t + ' ч?', 'Автобус ' + v + ' км/сағ жылдамдықпен жүреді. Ол ' + t + ' сағатта қанша жол жүреді?'], why: ['Путь равен скорости, умноженной на время: ' + v + ' × ' + t + ' = ' + res + ' км.', 'Жол жылдамдық пен уақыттың көбейтіндісіне тең: ' + v + ' × ' + t + ' = ' + res + ' км.'] }, single(r, res, [res + v, res - v, v + t * 10], function (x) { return x + ' км'; })); },
    function (r) { var a = int(r, 2, 6) * 100, b = int(r, 2, 6) * 100, c = int(r, 2, 8) * 100, na = int(r, 1, 3), nb = int(r, 1, 3), nc = int(r, 1, 3), res = a * na + b * nb + c * nc;
      return merge({ tp: 2, list: ['Хлеб: ' + money(a) + '\nМолоко: ' + money(b) + '\nСыр: ' + money(c), 'Нан: ' + money(a) + '\nСүт: ' + money(b) + '\nІрімшік: ' + money(c)], text: ['Сколько стоит покупка: хлеб ' + na + ' шт., молоко ' + nb + ' шт., сыр ' + nc + ' шт.?', 'Сатып алу қанша тұрады: нан ' + na + ' дана, сүт ' + nb + ' дана, ірімшік ' + nc + ' дана?'], why: [a + ' × ' + na + ' + ' + b + ' × ' + nb + ' + ' + c + ' × ' + nc + ' = ' + money(res) + '.', a + ' × ' + na + ' + ' + b + ' × ' + nb + ' + ' + c + ' × ' + nc + ' = ' + money(res) + '.'] }, single(r, res, [res + a, res - b, a + b + c], money)); },
    function (r) { var vals = [int(r, 10, 40), int(r, 10, 40), int(r, 10, 40), int(r, 10, 40)], best = Math.max.apply(null, vals), names = [['Пн', 'Дс'], ['Вт', 'Сс'], ['Ср', 'Ср'], ['Чт', 'Бс']];
      if (vals.filter(function (x) { return x === best; }).length > 1) { vals[0] = best + 3; best = vals[0]; }
      var i = vals.indexOf(best);
      var o = [0, 1, 2, 3];
      return { tp: 2, list: ['Продано билетов:\nПн: ' + vals[0] + '\nВт: ' + vals[1] + '\nСр: ' + vals[2] + '\nЧт: ' + vals[3], 'Сатылған билеттер:\nДс: ' + vals[0] + '\nСс: ' + vals[1] + '\nСр: ' + vals[2] + '\nБс: ' + vals[3]], text: ['В какой день продали больше всего билетов?', 'Қай күні ең көп билет сатылды?'], opts: o.map(function (k) { return names[k]; }), ans: i, why: ['Самое большое число в таблице: ' + best + '.', 'Кестедегі ең үлкен сан: ' + best + '.'] }; },
    function (r) { var a = int(r, 2, 9), d = int(r, 2, 7), s = [a, a + d, a + 2 * d, a + 3 * d], res = a + 4 * d;
      return merge({ tp: 3, text: ['Какое число идёт следующим: ' + s.join(', ') + ', ...?', 'Келесі сан қандай: ' + s.join(', ') + ', ...?'], why: ['Каждое число больше предыдущего на ' + d + '. Следующее: ' + res + '.', 'Әр сан алдыңғысынан ' + d + '-ге артық. Келесісі: ' + res + '.'] }, single(r, res, [res + d, res - 1, res + 1])); },
    function (r) { var b = int(r, 12, 20), d = int(r, 2, 4), sum = b + b + d;
      return merge({ tp: 3, text: ['Айгуль старше Болата на ' + d + ' года. Сумма их возрастов равна ' + sum + '. Сколько лет Болату?', 'Айгүл Болаттан ' + d + ' жас үлкен. Екеуінің жасының қосындысы ' + sum + '. Болат нешеде?'], why: ['Убери разницу: ' + sum + ' − ' + d + ' = ' + (sum - d) + '. Это два одинаковых возраста, значит Болату ' + (sum - d) + ' : 2 = ' + b + '.', 'Айырманы алып таста: ' + sum + ' − ' + d + ' = ' + (sum - d) + '. Бұл екі бірдей жас, демек Болат ' + (sum - d) + ' : 2 = ' + b + ' жаста.'] }, single(r, b, [b + d, sum - b + 1, b - 1])); },
    function (r) { var red = int(r, 2, 6), blue = int(r, 2, 6), tot = red + blue, g = function (a, b) { return b ? g(b, a % b) : a; }, k = g(red, tot);
      var fmt = function (a, b) { var q = g(a, b); return (a / q) + '/' + (b / q); };
      var right = fmt(red, tot);
      var o = pair(r, right, [fmt(blue, tot) === right ? fmt(red, tot + 1) : fmt(blue, tot), fmt(1, tot) === right ? fmt(2, tot + 1) : fmt(1, tot), fmt(red, tot + 2)]);
      return merge({ tp: 4, text: ['В мешке лежат шары: красных ' + red + ', синих ' + blue + '. Какова вероятность достать красный?', 'Қапта ' + red + ' қызыл және ' + blue + ' көк шар бар. Қызыл шар алу ықтималдығы қандай?'], why: ['Всего шаров ' + tot + ', красных ' + red + '. Вероятность ' + right + '.', 'Барлығы ' + tot + ' шар, қызылы ' + red + '. Ықтималдық ' + right + '.'] }, o); },
    function (r) { var n = int(r, 60, 90), xs = [n - 4, n + 2, n + 6, n - 2, n - 2], res = n;
      return merge({ tp: 4, text: ['Оценки за тест: ' + xs.join(', ') + '. Чему равно среднее?', 'Тест ұпайлары: ' + xs.join(', ') + '. Орташа мәні нешеге тең?'], why: ['Сумма ' + xs.reduce(function (a, b) { return a + b; }, 0) + ', чисел 5. Среднее: ' + res + '.', 'Қосындысы ' + xs.reduce(function (a, b) { return a + b; }, 0) + ', сан 5. Орташасы: ' + res + '.'] }, single(r, res, [res + 2, res - 2, res + 4])); }
  ];

  var MATH = [
    function (r) { var a = int(r, 2, 9), x = int(r, -9, 12) || 3, b = int(r, 1, 20), c = a * x + b;
      return merge({ tp: 0, type: 'single', text: ['Реши уравнение: ' + a + 'x + ' + b + ' = ' + num(c) + '.', 'Теңдеуді шеш: ' + a + 'x + ' + b + ' = ' + num(c) + '.'], why: [a + 'x = ' + num(c - b) + ', значит x = ' + num(x) + '.', a + 'x = ' + num(c - b) + ', демек x = ' + num(x) + '.'], simple: ['Перенеси ' + b + ' вправо, потом раздели на ' + a + '.', b + ' санын оң жаққа шығарып, ' + a + '-ге бөл.'] }, single(r, x, [x + 2, -x, x - 3], num)); },
    function (r) { var a = int(r, 2, 6), b = int(r, 2, 9), res = (a + b) * (a + b);
      return merge({ tp: 0, type: 'single', text: ['Вычисли: ' + a + '² + 2 · ' + a + ' · ' + b + ' + ' + b + '².', 'Есепте: ' + a + '² + 2 · ' + a + ' · ' + b + ' + ' + b + '².'], why: ['Это квадрат суммы: (' + a + ' + ' + b + ')² = ' + res + '.', 'Бұл қосындының квадраты: (' + a + ' + ' + b + ')² = ' + res + '.'], mem: ['(a + b)² = a² + 2ab + b².', '(a + b)² = a² + 2ab + b².'] }, single(r, res, [a * a + b * b, res + a, res - b])); },
    function (r) { var b = pick(r, [2, 3, 5]), n = int(r, 2, 4), res = n;
      return merge({ tp: 0, type: 'single', text: ['Вычисли: log' + '₀₁₂₃₄₅'[b] + ' ' + Math.pow(b, n) + '.', 'Есепте: log' + '₀₁₂₃₄₅'[b] + ' ' + Math.pow(b, n) + '.'], why: [b + ' в степени ' + n + ' равно ' + Math.pow(b, n) + ', поэтому логарифм равен ' + n + '.', b + ' санының ' + n + '-дәрежесі ' + Math.pow(b, n) + ', сондықтан логарифм ' + n + '-ге тең.'] }, single(r, res, [res + 1, res - 1 || res + 2, b])); },
    function (r) { var a = int(r, 1, 7), d = int(r, 2, 6), n = int(r, 5, 12), res = a + (n - 1) * d;
      return merge({ tp: 0, type: 'single', text: ['В арифметической прогрессии a₁ = ' + a + ', d = ' + d + '. Найди a' + sub(n) + '.', 'Арифметикалық прогрессияда a₁ = ' + a + ', d = ' + d + '. a' + sub(n) + ' мәнін тап.'], why: ['aₙ = a₁ + (n − 1)d = ' + a + ' + ' + (n - 1) + ' · ' + d + ' = ' + res + '.', 'aₙ = a₁ + (n − 1)d = ' + a + ' + ' + (n - 1) + ' · ' + d + ' = ' + res + '.'] }, single(r, res, [a + n * d, res - d - 1, a * n + d])); },
    function (r) { var a = int(r, 2, 6), k = int(r, -5, 8), b = int(r, 1, 9), c = a * k + b;
      var right = 'x > ' + num(k);
      var o = pair(r, right, ['x < ' + num(k), 'x > ' + num(k + 1), 'x < ' + num(k - 1)]);
      return merge({ tp: 1, type: 'single', text: ['Реши неравенство: ' + a + 'x + ' + b + ' > ' + num(c) + '.', 'Теңсіздікті шеш: ' + a + 'x + ' + b + ' > ' + num(c) + '.'], why: [a + 'x > ' + num(c - b) + ', делим на положительное ' + a + ': x > ' + num(k) + '.', a + 'x > ' + num(c - b) + ', оң ' + a + ' санына бөлеміз: x > ' + num(k) + '.'] }, o); },
    function (r) { var p = int(r, -4, 3) || 1, q = p + int(r, 2, 7); var f1 = '(x' + term(-p) + ')(x' + term(-q) + ')';
      var right = '(' + num(p) + '; ' + num(q) + ')';
      var o = pair(r, right, ['(−∞; ' + num(p) + ') ∪ (' + num(q) + '; +∞)', '(' + num(p - 1) + '; ' + num(q) + ')', '(' + num(p) + '; ' + num(q + 1) + ')']);
      return merge({ tp: 1, type: 'single', text: ['Реши неравенство: ' + f1 + ' < 0.', 'Теңсіздікті шеш: ' + f1 + ' < 0.'], why: ['Ветви параболы идут вверх, поэтому значения меньше нуля между корнями ' + num(p) + ' и ' + num(q) + '.', 'Парабола тармақтары жоғары, сондықтан теріс мәндер ' + num(p) + ' және ' + num(q) + ' түбірлерінің арасында.'] }, o); },
    function (r) { var k = int(r, 2, 7), b = int(r, -6, 9), x = int(r, -4, 6), res = k * x + b;
      return merge({ tp: 2, type: 'single', text: ['Дана функция f(x) = ' + k + 'x' + term(b) + '. Найди f(' + num(x) + ').', 'f(x) = ' + k + 'x' + term(b) + ' функциясы берілген. f(' + num(x) + ') мәнін тап.'], why: ['Подставь x = ' + num(x) + ': ' + k + ' · (' + num(x) + ')' + term(b) + ' = ' + num(res) + '.', 'x = ' + num(x) + ' қой: ' + k + ' · (' + num(x) + ')' + term(b) + ' = ' + num(res) + '.'] }, single(r, res, [res + k, res - b, k + b + x], num)); },
    function (r) { var h = int(r, -5, 6) || 2, a = int(r, 1, 3), c = int(r, -4, 6), bb = -2 * a * h;
      return merge({ tp: 2, type: 'single', text: ['Найди абсциссу вершины параболы y = ' + (a === 1 ? '' : a) + 'x²' + term(bb, 'x') + term(c) + '.', 'y = ' + (a === 1 ? '' : a) + 'x²' + term(bb, 'x') + term(c) + ' параболасы төбесінің абсциссасын тап.'], why: ['x = −b / (2a) = ' + num(-bb) + ' / ' + (2 * a) + ' = ' + num(h) + '.', 'x = −b / (2a) = ' + num(-bb) + ' / ' + (2 * a) + ' = ' + num(h) + '.'], mem: ['Вершина параболы: x = −b / (2a).', 'Парабола төбесі: x = −b / (2a).'] }, single(r, h, [-h, h + 2, h - 3], num)); },
    function (r) { var rows = [['sin 30°', '1/2'], ['cos 60°', '1/2'], ['sin 90°', '1'], ['cos 0°', '1'], ['tg 45°', '1'], ['cos 90°', '0'], ['sin 0°', '0'], ['sin 60°', '√3/2'], ['cos 30°', '√3/2'], ['sin 45°', '√2/2'], ['cos 45°', '√2/2'], ['tg 60°', '√3'], ['cos 180°', '−1'], ['sin 270°', '−1']];
      var row = pick(r, rows);
      var o = pair(r, row[1], ['0', '1', '1/2', '√2/2', '√3/2', '−1', '√3'].filter(function (x) { return x !== row[1]; }).sort(function () { return r() - 0.5; }).slice(0, 3));
      return merge({ tp: 3, type: 'single', text: ['Чему равно ' + row[0] + '?', row[0] + ' неге тең?'], why: [row[0] + ' = ' + row[1] + '.', row[0] + ' = ' + row[1] + '.'], mem: ['Значения для 0°, 30°, 45°, 60° и 90° стоит знать наизусть.', '0°, 30°, 45°, 60° және 90° мәндерін жатқа білген жөн.'] }, o); },
    function (r) { var s = pick(r, [['3/5', '4/5'], ['5/13', '12/13'], ['8/17', '15/17'], ['4/5', '3/5'], ['12/13', '5/13']]);
      var o = pair(r, s[1], ['1/5', '2/5', '7/13', '9/17', '1/13'].concat(s[0]).filter(function (x) { return x !== s[1]; }).sort(function () { return r() - 0.5; }).slice(0, 3));
      return merge({ tp: 3, type: 'single', text: ['Угол α острый, sin α = ' + s[0] + '. Найди cos α.', 'α — сүйір бұрыш, sin α = ' + s[0] + '. cos α мәнін тап.'], why: ['sin²α + cos²α = 1, поэтому cos α = √(1 − sin²α) = ' + s[1] + '.', 'sin²α + cos²α = 1, сондықтан cos α = √(1 − sin²α) = ' + s[1] + '.'], mem: ['Основное тождество: sin²α + cos²α = 1.', 'Негізгі тепе-теңдік: sin²α + cos²α = 1.'] }, o); },
    function (r) { var a = int(r, 2, 6), n = int(r, 2, 4), x = int(r, 1, 3), res = a * n * Math.pow(x, n - 1);
      return merge({ tp: 4, type: 'single', text: ['Найди f′(' + x + '), если f(x) = ' + a + 'x' + (n === 2 ? '²' : n === 3 ? '³' : '⁴') + '.', 'f(x) = ' + a + 'x' + (n === 2 ? '²' : n === 3 ? '³' : '⁴') + ' болса, f′(' + x + ') мәнін тап.'], why: ['f′(x) = ' + (a * n) + 'x' + (n - 1 === 1 ? '' : n - 1 === 2 ? '²' : '³') + '. При x = ' + x + ' получаем ' + res + '.', 'f′(x) = ' + (a * n) + 'x' + (n - 1 === 1 ? '' : n - 1 === 2 ? '²' : '³') + '. x = ' + x + ' болғанда ' + res + ' шығады.'], mem: ['(xⁿ)′ = n · xⁿ⁻¹.', '(xⁿ)′ = n · xⁿ⁻¹.'] }, single(r, res, [a * Math.pow(x, n), res + a, a * n * Math.pow(x, n)])); },
    function (r) { var a = pick(r, [2, 4, 6, 8]), k = int(r, 1, 5), res = a * k * k / 2;
      return merge({ tp: 4, type: 'single', text: ['Вычисли интеграл от 0 до ' + k + ' функции f(x) = ' + a + 'x.', '0-ден ' + k + '-ге дейін f(x) = ' + a + 'x функциясының интегралын есепте.'], why: ['Первообразная ' + (a / 2) + 'x². Подставляем: ' + (a / 2) + ' · ' + (k * k) + ' = ' + res + '.', 'Алғашқы функция ' + (a / 2) + 'x². Қоямыз: ' + (a / 2) + ' · ' + (k * k) + ' = ' + res + '.'] }, single(r, res, [a * k, res * 2, res + k])); },
    function (r) { var t = pick(r, [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25]]);
      return merge({ tp: 5, type: 'single', text: ['Катеты прямоугольного треугольника равны ' + t[0] + ' и ' + t[1] + '. Найди гипотенузу.', 'Тікбұрышты үшбұрыштың катеттері ' + t[0] + ' және ' + t[1] + '. Гипотенузаны тап.'], why: ['По теореме Пифагора: √(' + (t[0] * t[0]) + ' + ' + (t[1] * t[1]) + ') = ' + t[2] + '.', 'Пифагор теоремасы бойынша: √(' + (t[0] * t[0]) + ' + ' + (t[1] * t[1]) + ') = ' + t[2] + '.'] }, single(r, t[2], [t[0] + t[1], t[2] + 1, t[1] + 1])); },
    function (r) { var a = int(r, 20, 80), b = int(r, 20, 150 - a - 5), c = 180 - a - b;
      return merge({ tp: 5, type: 'single', text: ['Два угла треугольника равны ' + a + '° и ' + b + '°. Найди третий угол.', 'Үшбұрыштың екі бұрышы ' + a + '° және ' + b + '°. Үшінші бұрышты тап.'], why: ['Сумма углов треугольника 180°: 180 − ' + a + ' − ' + b + ' = ' + c + '°.', 'Үшбұрыш бұрыштарының қосындысы 180°: 180 − ' + a + ' − ' + b + ' = ' + c + '°.'] }, single(r, c, [360 - a - b, c + 10, 90], function (x) { return x + '°'; })); },
    function (r) { var R = int(r, 3, 9), res = R * R;
      var right = res + 'π';
      var o = pair(r, right, [(2 * R) + 'π', (res * 2) + 'π', (res + R) + 'π']);
      return merge({ tp: 5, type: 'single', text: ['Найди площадь круга радиуса ' + R + '.', 'Радиусы ' + R + ' дөңгелектің ауданын тап.'], why: ['S = πR² = ' + right + '.', 'S = πR² = ' + right + '.'] }, o); },
    function (r) { var a = int(r, 2, 8), res = a * a * a;
      return merge({ tp: 6, type: 'single', text: ['Найди объём куба с ребром ' + a + '.', 'Қыры ' + a + ' куб көлемін тап.'], why: ['V = a³ = ' + res + '.', 'V = a³ = ' + res + '.'] }, single(r, res, [a * a * 6, a * 12, res + a])); },
    function (r) { var R = int(r, 3, 6), h = int(r, 2, 9), res = R * R * h;
      var right = res + 'π';
      var o = pair(r, right, [(2 * R * h) + 'π', (R * h) + 'π', (res + h) + 'π']);
      return merge({ tp: 6, type: 'single', text: ['Найди объём цилиндра: радиус основания ' + R + ', высота ' + h + '.', 'Цилиндр көлемін тап: табан радиусы ' + R + ', биіктігі ' + h + '.'], why: ['V = πR²h = ' + right + '.', 'V = πR²h = ' + right + '.'] }, o); },
    function (r) { var a = int(r, 2, 7), b = int(r, 2, 7), c = int(r, 2, 7), res = 2 * (a * b + b * c + a * c);
      return merge({ tp: 6, type: 'single', text: ['Найди площадь поверхности параллелепипеда с рёбрами ' + a + ', ' + b + ', ' + c + '.', 'Қырлары ' + a + ', ' + b + ', ' + c + ' параллелепипед бетінің ауданын тап.'], why: ['S = 2(ab + bc + ac) = ' + res + '.', 'S = 2(ab + bc + ac) = ' + res + '.'] }, single(r, res, [a * b * c, a * b + b * c + a * c, res + 2])); },
    /* context */
    function (r) { var w = int(r, 4, 12), l = w + int(r, 2, 8), p = int(r, 2, 6) * 100, res = w * l * p;
      return merge({ tp: 5, type: 'context', list: ['Прямоугольный участок имеет ширину ' + w + ' м и длину ' + l + ' м. Квадратный метр газона стоит ' + money(p) + '.', 'Тікбұрышты учаскенің ені ' + w + ' м, ұзындығы ' + l + ' м. Шөптің бір шаршы метрі ' + money(p) + ' тұрады.'], text: ['Сколько будет стоить газон на весь участок?', 'Бүкіл учаскеге шөп қанша тұрады?'], why: ['Площадь ' + (w * l) + ' м². Умножаем на цену: ' + money(res) + '.', 'Ауданы ' + (w * l) + ' м². Бағаға көбейтеміз: ' + money(res) + '.'] }, single(r, res, [2 * (w + l) * p, res + p, w * l + p], money)); },
    function (r) { var s = int(r, 4, 9) * 10, v1 = pick(r, [10, 12, 15, 20]), v2 = pick(r, [25, 30, 40, 50]), t = s / (v1 + v2);
      if (Math.round(t * 2) !== t * 2) { v1 = 20; v2 = 40; s = 120; t = 2; }
      return merge({ tp: 0, type: 'context', list: ['Из двух сёл навстречу друг другу выехали велосипедист и автомобиль. Расстояние между сёлами ' + s + ' км, скорость велосипедиста ' + v1 + ' км/ч, автомобиля ' + v2 + ' км/ч.', 'Екі ауылдан бір-біріне қарама-қарсы велосипедші мен автокөлік шықты. Ауылдардың арасы ' + s + ' км, велосипедшінің жылдамдығы ' + v1 + ' км/сағ, автокөліктікі ' + v2 + ' км/сағ.'], text: ['Через сколько часов они встретятся?', 'Олар неше сағаттан кейін кездеседі?'], why: ['Скорость сближения ' + (v1 + v2) + ' км/ч. Время: ' + s + ' : ' + (v1 + v2) + ' = ' + num(t) + ' ч.', 'Жақындасу жылдамдығы ' + (v1 + v2) + ' км/сағ. Уақыт: ' + s + ' : ' + (v1 + v2) + ' = ' + num(t) + ' сағ.'] }, single(r, t, [t + 1, t + 0.5, s / Math.abs(v2 - v1) === t ? t + 2 : s / Math.abs(v2 - v1)], num)); },
    function (r) { var p = int(r, 2, 10) * 10000, y = pick(r, [10, 12, 15, 20]), res = p * (1 + y / 100) * (1 + y / 100);
      return merge({ tp: 0, type: 'context', list: ['На вклад положили ' + money(p) + '. Банк начисляет ' + y + '% годовых, проценты добавляются к вкладу раз в год.', 'Салымға ' + money(p) + ' салынды. Банк жылына ' + y + '% есептейді, пайыз салымға жылына бір рет қосылады.'], text: ['Сколько будет на вкладе через 2 года?', '2 жылдан кейін салымда қанша болады?'], why: [money(p).slice(0, -2) + ' × ' + num(1 + y / 100) + ' × ' + num(1 + y / 100) + ' = ' + money(Math.round(res)) + '.', money(p).slice(0, -2) + ' × ' + num(1 + y / 100) + ' × ' + num(1 + y / 100) + ' = ' + money(Math.round(res)) + '.'] }, single(r, Math.round(res), [Math.round(p * (1 + 2 * y / 100)), Math.round(p * (1 + y / 100)), Math.round(res) + 1000], money)); },
    /* matching */
    function (r) { var sets = [[['x²', '2x'], ['x³', '3x²'], ['sin x', 'cos x']], [['eˣ', 'eˣ'], ['ln x', '1/x'], ['cos x', '−sin x']], [['x⁴', '4x³'], ['√x', '1/(2√x)'], ['tg x', '1/cos²x']]];
      var s = pick(r, sets), rights = s.map(function (x) { return x[1]; });
      var names = ['А', 'Б', 'В'];
      var perm = shuffle(r, [0, 1, 2]);
      var listR = s.map(function (x, i) { return (i + 1) + ') f(x) = ' + x[0]; }).join('\n') + '\n' + perm.map(function (k, i) { return names[i] + ') ' + rights[k]; }).join('\n');
      var map = s.map(function (_, i) { return (i + 1) + names[perm.indexOf(i)]; }).join(', ');
      var wrongs = [[1, 0, 2], [2, 1, 0], [1, 2, 0], [2, 0, 1], [0, 2, 1]].map(function (w) { return s.map(function (_, i) { return (i + 1) + names[perm.indexOf(w[i])]; }).join(', '); });
      var o = pair(r, map, wrongs.filter(function (x) { return x !== map; }).slice(0, 3));
      return merge({ tp: 4, type: 'match', list: [listR, listR], text: ['Соотнеси функцию и её производную.', 'Функция мен оның туындысын сәйкестендір.'], why: ['Верное соответствие: ' + map + '.', 'Дұрыс сәйкестік: ' + map + '.'] }, o); },
    function (r) { var sets = [[['Площадь круга', 'πR²', 'Дөңгелек ауданы'], ['Длина окружности', '2πR', 'Шеңбер ұзындығы'], ['Площадь квадрата', 'a²', 'Шаршы ауданы']], [['Объём куба', 'a³', 'Куб көлемі'], ['Объём цилиндра', 'πR²h', 'Цилиндр көлемі'], ['Объём шара', '(4/3)πR³', 'Шар көлемі']], [['Площадь прямоугольника', 'ab', 'Тіктөртбұрыш ауданы'], ['Площадь треугольника', 'ah/2', 'Үшбұрыш ауданы'], ['Площадь трапеции', '(a + b)h/2', 'Трапеция ауданы']]];
      var s = pick(r, sets), names = ['А', 'Б', 'В'], perm = shuffle(r, [0, 1, 2]);
      var right = perm.map(function (k, i) { return names[i] + ') ' + s[k][1]; }).join('\n');
      var listR = s.map(function (x, i) { return (i + 1) + ') ' + x[0]; }).join('\n') + '\n' + right, listK = s.map(function (x, i) { return (i + 1) + ') ' + x[2]; }).join('\n') + '\n' + right;
      var map = s.map(function (_, i) { return (i + 1) + names[perm.indexOf(i)]; }).join(', ');
      var wrongs = [[1, 0, 2], [2, 1, 0], [1, 2, 0], [2, 0, 1], [0, 2, 1]].map(function (w) { return s.map(function (_, i) { return (i + 1) + names[perm.indexOf(w[i])]; }).join(', '); });
      var o = pair(r, map, wrongs.filter(function (x) { return x !== map; }).slice(0, 3));
      return merge({ tp: 5, type: 'match', list: [listR, listK], text: ['Соотнеси величину и формулу.', 'Шама мен формуланы сәйкестендір.'], why: ['Верное соответствие: ' + map + '.', 'Дұрыс сәйкестік: ' + map + '.'] }, o); },
    /* several answers */
    function (r) { var p = int(r, -5, 5), q = p + int(r, 1, 6), b = -(p + q) || 0, c = p * q || 0;
      var pool = [p, q], extra = [p - 1, q + 1, -p === p ? p + 3 : -p, -q === q ? q + 2 : -q, p + q, q + 3, p - 3];
      extra.forEach(function (v) { if (pool.indexOf(v) < 0 && pool.length < 6) pool.push(v); });
      var order = shuffle(r, pool), ans = [order.indexOf(p), order.indexOf(q)].sort(function (x, y) { return x - y; });
      return { tp: 0, type: 'multi', text: ['Выбери все корни уравнения x²' + term(b, 'x') + term(c) + ' = 0.', 'x²' + term(b, 'x') + term(c) + ' = 0 теңдеуінің барлық түбірін таңда.'], opts: order.map(num), ans: ans, why: ['По теореме Виета корни ' + num(p) + ' и ' + num(q) + ': их сумма ' + num(-b) + ', произведение ' + num(c) + '.', 'Виет теоремасы бойынша түбірлер ' + num(p) + ' және ' + num(q) + ': қосындысы ' + num(-b) + ', көбейтіндісі ' + num(c) + '.'] }; },
    function (r) { var n = pick(r, [12, 18, 20, 24, 28, 30, 36, 40]), pool = [], xs = shuffle(r, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]).slice(0, 6);
      var order = xs, ans = [];
      order.forEach(function (v, i) { if (n % v === 0) ans.push(i); });
      if (!ans.length) { order[0] = 2; ans = [0]; }
      return { tp: 0, type: 'multi', text: ['Выбери все делители числа ' + n + '.', n + ' санының барлық бөлгішін таңда.'], opts: order.map(String), ans: ans, why: ['Делители из списка: ' + ans.map(function (i) { return order[i]; }).join(', ') + '.', 'Тізімдегі бөлгіштер: ' + ans.map(function (i) { return order[i]; }).join(', ') + '.'] }; },
    function (r) { var k = int(r, 2, 5), cands = shuffle(r, [['y = ' + k + 'x + 1', 1], ['y = −' + k + 'x + 2', 0], ['y = x³', 1], ['y = −x³', 0], ['y = 2ˣ', 1], ['y = (1/2)ˣ', 0]]);
      var ans = []; cands.forEach(function (c, i) { if (c[1]) ans.push(i); });
      return { tp: 2, type: 'multi', text: ['Выбери все функции, которые возрастают на всей числовой прямой.', 'Бүкіл сан түзуінде өсетін барлық функцияны таңда.'], opts: cands.map(function (c) { return c[0]; }), ans: ans, why: ['Возрастают: ' + ans.map(function (i) { return cands[i][0]; }).join('; ') + '.', 'Өсетіндер: ' + ans.map(function (i) { return cands[i][0]; }).join('; ') + '.'] }; }
  ];

  var PHYS = [
    function (r) { var v = int(r, 2, 30), t = int(r, 2, 10), s = v * t;
      return merge({ tp: 0, type: 'single', text: ['Тело прошло ' + s + ' м за ' + t + ' с. Найди среднюю скорость.', 'Дене ' + t + ' с ішінде ' + s + ' м жол жүрді. Орташа жылдамдықты тап.'], why: ['v = s / t = ' + s + ' / ' + t + ' = ' + num(v) + ' м/с.', 'v = s / t = ' + s + ' / ' + t + ' = ' + num(v) + ' м/с.'], mem: ['Скорость это путь за единицу времени.', 'Жылдамдық — уақыт бірлігіндегі жол.'] }, single(r, v, [s * t, v + 2, t], function (x) { return num(x) + ' м/с'; })); },
    function (r) { var m = int(r, 2, 20), a = int(r, 2, 6), F = m * a;
      return merge({ tp: 0, type: 'single', text: ['Тело массой ' + m + ' кг движется с ускорением ' + a + ' м/с². Какая сила на него действует?', 'Массасы ' + m + ' кг дене ' + a + ' м/с² үдеумен қозғалады. Оған қандай күш әсер етеді?'], why: ['Второй закон Ньютона: F = ma = ' + F + ' Н.', 'Ньютонның екінші заңы: F = ma = ' + F + ' Н.'], mem: ['F = ma: сила равна массе, умноженной на ускорение.', 'F = ma: күш масса мен үдеудің көбейтіндісіне тең.'] }, single(r, F, [m + a, F + m, F - a], function (x) { return x + ' Н'; })); },
    function (r) { var m = int(r, 1, 10), v = int(r, 2, 10), E = m * v * v / 2;
      return merge({ tp: 0, type: 'single', text: ['Найди кинетическую энергию тела массой ' + m + ' кг при скорости ' + v + ' м/с.', 'Массасы ' + m + ' кг, жылдамдығы ' + v + ' м/с дененің кинетикалық энергиясын тап.'], why: ['E = mv² / 2 = ' + m + ' · ' + (v * v) + ' / 2 = ' + num(E) + ' Дж.', 'E = mv² / 2 = ' + m + ' · ' + (v * v) + ' / 2 = ' + num(E) + ' Дж.'] }, single(r, E, [m * v, m * v * v, E + v], function (x) { return num(x) + ' Дж'; })); },
    function (r) { var F = int(r, 5, 40) * 10, s = int(r, 2, 12), A = F * s;
      return merge({ tp: 0, type: 'single', text: ['Сила ' + F + ' Н переместила тело на ' + s + ' м в направлении силы. Какую работу она совершила?', F + ' Н күш денені күш бағытында ' + s + ' м-ге жылжытты. Ол қандай жұмыс істеді?'], why: ['A = Fs = ' + A + ' Дж.', 'A = Fs = ' + A + ' Дж.'] }, single(r, A, [F + s, A + F, F * (s + 1)], function (x) { return x + ' Дж'; })); },
    function (r) { var m = int(r, 2, 40), g = 10, F = m * g;
      return merge({ tp: 0, type: 'single', text: ['Найди силу тяжести, действующую на тело массой ' + m + ' кг (g = 10 м/с²).', 'Массасы ' + m + ' кг денеге әсер ететін ауырлық күшін тап (g = 10 м/с²).'], why: ['F = mg = ' + F + ' Н.', 'F = mg = ' + F + ' Н.'] }, single(r, F, [m, F + 10, F / 2], function (x) { return num(x) + ' Н'; })); },
    function (r) { var c = pick(r, [[4200, 'воды', 'судың'], [900, 'алюминия', 'алюминийдің'], [460, 'железа', 'темірдің']]), m = int(r, 2, 5), d = int(r, 2, 8) * 10, Q = c[0] * m * d;
      return merge({ tp: 1, type: 'single', text: ['Сколько теплоты нужно, чтобы нагреть ' + m + ' кг ' + c[1] + ' на ' + d + ' °C? Удельная теплоёмкость ' + c[0] + ' Дж/(кг·°C).', m + ' кг ' + c[2] + ' температурасын ' + d + ' °C-қа арттыру үшін қанша жылу керек? Меншікті жылусыйымдылығы ' + c[0] + ' Дж/(кг·°C).'], why: ['Q = cmΔt = ' + c[0] + ' · ' + m + ' · ' + d + ' = ' + money(Q).slice(0, -2) + ' Дж.', 'Q = cmΔt = ' + c[0] + ' · ' + m + ' · ' + d + ' = ' + money(Q).slice(0, -2) + ' Дж.'] }, single(r, Q, [c[0] * m, c[0] * d, Q * 2], function (x) { return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' Дж'; })); },
    function (r) { var t = pick(r, [0, 27, 77, 127, 227]), T = t + 273;
      return merge({ tp: 1, type: 'single', text: ['Температура газа ' + t + ' °C. Чему она равна по шкале Кельвина?', 'Газ температурасы ' + t + ' °C. Кельвин шкаласы бойынша ол неге тең?'], why: ['T = t + 273 = ' + T + ' К.', 'T = t + 273 = ' + T + ' К.'] }, single(r, T, [t, T + 100, Math.abs(t - 273) === T ? T + 10 : Math.abs(t - 273)], function (x) { return x + ' К'; })); },
    function (r) { var p = int(r, 1, 5) * 100000, V = int(r, 1, 6), k = pick(r, [2, 3, 4]);
      return merge({ tp: 1, type: 'single', text: ['При постоянной температуре объём газа уменьшили в ' + k + ' раза. Как изменится давление?', 'Тұрақты температурада газ көлемі ' + k + ' есе азайтылды. Қысым қалай өзгереді?'], why: ['Закон Бойля — Мариотта: pV = const. Давление вырастет в ' + k + ' раза.', 'Бойль — Мариотт заңы: pV = const. Қысым ' + k + ' есе артады.'] }, pair(r, ['Увеличится в ' + k + ' раза', k + ' есе артады'], [['Уменьшится в ' + k + ' раза', k + ' есе азаяды'], ['Не изменится', 'Өзгермейді'], ['Увеличится в ' + (k * k) + ' раза', (k * k) + ' есе артады']])); },
    function (r) { var U = int(r, 2, 24) * 5, R = pick(r, [2, 4, 5, 10, 20]), I = U / R;
      return merge({ tp: 2, type: 'single', text: ['Напряжение на резисторе ' + U + ' В, его сопротивление ' + R + ' Ом. Найди силу тока.', 'Резистордағы кернеу ' + U + ' В, кедергісі ' + R + ' Ом. Ток күшін тап.'], why: ['Закон Ома: I = U / R = ' + num(I) + ' А.', 'Ом заңы: I = U / R = ' + num(I) + ' А.'], mem: ['Закон Ома: I = U / R.', 'Ом заңы: I = U / R.'] }, single(r, I, [U * R, I + 1, R / U], function (x) { return num(x) + ' А'; })); },
    function (r) { var pr = pick(r, [[2, 2], [3, 3], [4, 4], [6, 6], [10, 10], [12, 12], [2, 3], [3, 6], [4, 12], [6, 12], [10, 15], [20, 30]]), a = pr[0], b = pr[1], s = a + b, p = a * b / (a + b);
      return merge({ tp: 2, type: 'single', text: ['Два резистора ' + a + ' Ом и ' + b + ' Ом соединены параллельно. Найди общее сопротивление.', a + ' Ом және ' + b + ' Ом екі резистор параллель жалғанған. Жалпы кедергіні тап.'], why: ['R = R₁R₂ / (R₁ + R₂) = ' + (a * b) + ' / ' + s + ' = ' + num(p) + ' Ом.', 'R = R₁R₂ / (R₁ + R₂) = ' + (a * b) + ' / ' + s + ' = ' + num(p) + ' Ом.'] }, single(r, p, [s, a * b, p + 1], function (x) { return num(x) + ' Ом'; })); },
    function (r) { var U = pick(r, [12, 24, 110, 220]), I = int(r, 1, 10), P = U * I;
      return merge({ tp: 2, type: 'single', text: ['Прибор работает при напряжении ' + U + ' В и токе ' + I + ' А. Какова его мощность?', 'Құрылғы ' + U + ' В кернеуде және ' + I + ' А токта жұмыс істейді. Оның қуаты қандай?'], why: ['P = UI = ' + P + ' Вт.', 'P = UI = ' + P + ' Вт.'] }, single(r, P, [U + I, P + U, Math.round(U / I)], function (x) { return x + ' Вт'; })); },
    function (r) { var f = pick(r, [2, 4, 5, 10, 20, 50]), lam = pick(r, [2, 3, 5, 10]), v = f * lam;
      return merge({ tp: 3, type: 'single', text: ['Волна имеет частоту ' + f + ' Гц и длину ' + lam + ' м. Найди скорость волны.', 'Толқын жиілігі ' + f + ' Гц, ұзындығы ' + lam + ' м. Толқын жылдамдығын тап.'], why: ['v = λν = ' + v + ' м/с.', 'v = λν = ' + v + ' м/с.'] }, single(r, v, [f + lam, v + f, lam / f], function (x) { return num(x) + ' м/с'; })); },
    function (r) { var f = pick(r, [2, 4, 5, 10, 20, 25, 50]), T = 1 / f;
      return merge({ tp: 3, type: 'single', text: ['Частота колебаний ' + f + ' Гц. Найди период.', 'Тербеліс жиілігі ' + f + ' Гц. Периодты тап.'], why: ['T = 1 / ν = ' + num(T) + ' с.', 'T = 1 / ν = ' + num(T) + ' с.'] }, single(r, T, [f, T * 2, T + 1], function (x) { return num(x) + ' с'; })); },
    function (r) { var F = pick(r, [0.1, 0.2, 0.25, 0.5, 1, 2]), D = 1 / F;
      return merge({ tp: 4, type: 'single', text: ['Фокусное расстояние линзы ' + num(F) + ' м. Найди её оптическую силу.', 'Линзаның фокус аралығы ' + num(F) + ' м. Оның оптикалық күшін тап.'], why: ['D = 1 / F = ' + num(D) + ' дптр.', 'D = 1 / F = ' + num(D) + ' дптр.'] }, single(r, D, [F, D * 2, D + 1], function (x) { return num(x) + ' дптр'; })); },
    function (r) { var a = int(r, 10, 80);
      return merge({ tp: 4, type: 'single', text: ['Луч падает на зеркало под углом ' + a + '° к перпендикуляру. Чему равен угол отражения?', 'Сәуле айнаға перпендикулярға ' + a + '° бұрышпен түседі. Шағылу бұрышы неге тең?'], why: ['Угол отражения равен углу падения: ' + a + '°.', 'Шағылу бұрышы түсу бұрышына тең: ' + a + '°.'] }, single(r, a, [90 - a, 180 - a, 2 * a], function (x) { return x + '°'; })); },
    function (r) { var els = [['углерода', 'көміртек', 6, 12], ['кислорода', 'оттек', 8, 16], ['натрия', 'натрий', 11, 23], ['алюминия', 'алюминий', 13, 27], ['железа', 'темір', 26, 56], ['урана', 'уран', 92, 238]], e = pick(r, els), n = e[3] - e[2];
      return merge({ tp: 5, type: 'single', text: ['Сколько нейтронов в ядре атома ' + e[0] + ' (Z = ' + e[2] + ', A = ' + e[3] + ')?', e[1].charAt(0).toUpperCase() + e[1].slice(1) + ' атомының ядросында қанша нейтрон бар (Z = ' + e[2] + ', A = ' + e[3] + ')?'], why: ['N = A − Z = ' + e[3] + ' − ' + e[2] + ' = ' + n + '.', 'N = A − Z = ' + e[3] + ' − ' + e[2] + ' = ' + n + '.'], mem: ['Массовое число это протоны плюс нейтроны.', 'Массалық сан — протондар мен нейтрондардың қосындысы.'] }, single(r, n, [e[2], e[3], n + 2])); },
    function (r) { var N = pick(r, [800, 1600, 3200, 6400]), k = pick(r, [1, 2, 3]), left = N / Math.pow(2, k);
      return merge({ tp: 5, type: 'single', text: ['Было ' + N + ' радиоактивных ядер. Сколько останется через ' + k + ' период' + (k === 1 ? '' : 'а') + ' полураспада?', N + ' радиоактивті ядро болды. ' + k + ' жартылай ыдырау периодынан кейін қаншасы қалады?'], why: ['Каждый период число ядер уменьшается вдвое: ' + N + ' / ' + Math.pow(2, k) + ' = ' + left + '.', 'Әр периодта ядро саны екі есе азаяды: ' + N + ' / ' + Math.pow(2, k) + ' = ' + left + '.'] }, single(r, left, [left / 2, N, left * 3 > N ? left + 100 : left * 3])); },
    /* context */
    function (r) { var v = pick(r, [10, 15, 20, 25, 30]), a = pick(r, [2, 5]), t = v / a;
      return merge({ tp: 0, type: 'context', list: ['Автомобиль ехал со скоростью ' + v + ' м/с и начал тормозить. Ускорение при торможении ' + a + ' м/с².', 'Автокөлік ' + v + ' м/с жылдамдықпен келе жатып, тежей бастады. Тежеу үдеуі ' + a + ' м/с².'], text: ['Через сколько секунд он остановится?', 'Ол неше секундтан кейін тоқтайды?'], why: ['t = v / a = ' + v + ' / ' + a + ' = ' + num(t) + ' с.', 't = v / a = ' + v + ' / ' + a + ' = ' + num(t) + ' с.'] }, single(r, t, [v * a, t + 2, t * 2], function (x) { return num(x) + ' с'; })); },
    function (r) { var P = pick(r, [1000, 1500, 2000]), h = pick(r, [2, 3, 4]), price = pick(r, [20, 25, 30]), kWh = P / 1000 * h, cost = kWh * price;
      return merge({ tp: 2, type: 'context', list: ['Обогреватель мощностью ' + P + ' Вт работает ' + h + ' ч. Один киловатт-час стоит ' + price + ' ₸.', 'Қуаты ' + P + ' Вт жылытқыш ' + h + ' сағат жұмыс істейді. Бір киловатт-сағат ' + price + ' ₸ тұрады.'], text: ['Сколько стоит потреблённая энергия?', 'Жұмсалған энергия қанша тұрады?'], why: ['Энергия ' + num(kWh) + ' кВт·ч. Стоимость: ' + num(kWh) + ' × ' + price + ' = ' + num(cost) + ' ₸.', 'Энергия ' + num(kWh) + ' кВт·сағ. Құны: ' + num(kWh) + ' × ' + price + ' = ' + num(cost) + ' ₸.'] }, single(r, cost, [P * h * price, cost + price, kWh], function (x) { return Number.isInteger(x) ? money(x) : num(x) + ' ₸'; })); },
    function (r) { var m = int(r, 40, 80), S = pick(r, [2, 4, 5]) / 100, p = m * 10 / S;
      return merge({ tp: 0, type: 'context', list: ['Человек массой ' + m + ' кг стоит на полу. Площадь опоры ' + num(S) + ' м² (g = 10 м/с²).', 'Массасы ' + m + ' кг адам еденде тұр. Тірек ауданы ' + num(S) + ' м² (g = 10 м/с²).'], text: ['Какое давление он оказывает на пол?', 'Ол еденге қандай қысым түсіреді?'], why: ['p = F / S = ' + (m * 10) + ' / ' + num(S) + ' = ' + money(Math.round(p)).slice(0, -2) + ' Па.', 'p = F / S = ' + (m * 10) + ' / ' + num(S) + ' = ' + money(Math.round(p)).slice(0, -2) + ' Па.'] }, single(r, p, [m / S, p / 2, p + 1000], function (x) { return String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' Па'; })); },
    /* matching */
    function (r) { var sets = [[['Сила', 'ньютон', 'Күш'], ['Работа', 'джоуль', 'Жұмыс'], ['Мощность', 'ватт', 'Қуат']], [['Напряжение', 'вольт', 'Кернеу'], ['Сила тока', 'ампер', 'Ток күші'], ['Сопротивление', 'ом', 'Кедергі']], [['Давление', 'паскаль', 'Қысым'], ['Частота', 'герц', 'Жиілік'], ['Заряд', 'кулон', 'Заряд']]];
      var setI = int(r, 0, 2), s = sets[setI], names = ['А', 'Б', 'В'], perm = shuffle(r, [0, 1, 2]);
      var right = perm.map(function (k, i) { return names[i] + ') ' + s[k][1]; }).join('\n');
      var listR = s.map(function (x, i) { return (i + 1) + ') ' + x[0]; }).join('\n') + '\n' + right, listK = s.map(function (x, i) { return (i + 1) + ') ' + x[2]; }).join('\n') + '\n' + right;
      var map = s.map(function (_, i) { return (i + 1) + names[perm.indexOf(i)]; }).join(', ');
      var wrongs = [[1, 0, 2], [2, 1, 0], [1, 2, 0], [2, 0, 1], [0, 2, 1]].map(function (w) { return s.map(function (_, i) { return (i + 1) + names[perm.indexOf(w[i])]; }).join(', '); });
      var o = pair(r, map, wrongs.filter(function (x) { return x !== map; }).slice(0, 3));
      return merge({ tp: setI === 1 ? 2 : 0, type: 'match', list: [listR, listK], text: ['Соотнеси величину и её единицу.', 'Шама мен оның өлшем бірлігін сәйкестендір.'], why: ['Верное соответствие: ' + map + '.', 'Дұрыс сәйкестік: ' + map + '.'] }, o); },
    function (r) { var sets = [[['Закон Ома', 'I = U / R', 'Ом заңы'], ['Второй закон Ньютона', 'F = ma', 'Ньютонның екінші заңы'], ['Кинетическая энергия', 'E = mv² / 2', 'Кинетикалық энергия']], [['Давление', 'p = F / S', 'Қысым'], ['Работа', 'A = Fs', 'Жұмыс'], ['Плотность', 'ρ = m / V', 'Тығыздық']], [['Период', 'T = 1 / ν', 'Период'], ['Скорость волны', 'v = λν', 'Толқын жылдамдығы'], ['Оптическая сила', 'D = 1 / F', 'Оптикалық күш']]];
      var s = pick(r, sets), names = ['А', 'Б', 'В'], perm = shuffle(r, [0, 1, 2]);
      var right = perm.map(function (k, i) { return names[i] + ') ' + s[k][1]; }).join('\n');
      var listR = s.map(function (x, i) { return (i + 1) + ') ' + x[0]; }).join('\n') + '\n' + right, listK = s.map(function (x, i) { return (i + 1) + ') ' + x[2]; }).join('\n') + '\n' + right;
      var map = s.map(function (_, i) { return (i + 1) + names[perm.indexOf(i)]; }).join(', ');
      var wrongs = [[1, 0, 2], [2, 1, 0], [1, 2, 0], [2, 0, 1], [0, 2, 1]].map(function (w) { return s.map(function (_, i) { return (i + 1) + names[perm.indexOf(w[i])]; }).join(', '); });
      var o = pair(r, map, wrongs.filter(function (x) { return x !== map; }).slice(0, 3));
      return merge({ tp: 0, type: 'match', list: [listR, listK], text: ['Соотнеси величину и формулу.', 'Шама мен формуланы сәйкестендір.'], why: ['Верное соответствие: ' + map + '.', 'Дұрыс сәйкестік: ' + map + '.'] }, o); },
    /* several answers */
    function (r) { var items = shuffle(r, [[['Скорость', 'Жылдамдық'], 1], [['Сила', 'Күш'], 1], [['Ускорение', 'Үдеу'], 1], [['Масса', 'Масса'], 0], [['Время', 'Уақыт'], 0], [['Температура', 'Температура'], 0], [['Импульс', 'Импульс'], 1], [['Работа', 'Жұмыс'], 0]]).slice(0, 6);
      if (!items.some(function (x) { return x[1]; })) items[0] = [['Сила', 'Күш'], 1];
      var ans = []; items.forEach(function (x, i) { if (x[1]) ans.push(i); });
      return { tp: 0, type: 'multi', text: ['Выбери все векторные величины.', 'Барлық векторлық шаманы таңда.'], opts: items.map(function (x) { return x[0]; }), ans: ans, why: ['У векторной величины есть направление. Масса, время, температура и работа направления не имеют.', 'Векторлық шаманың бағыты болады. Массада, уақытта, температурада және жұмыста бағыт жоқ.'] }; },
    function (r) { var items = shuffle(r, [[['Гамма-излучение', 'Гамма-сәулелену'], 1], [['Рентгеновское излучение', 'Рентген сәулеленуі'], 1], [['Видимый свет', 'Көрінетін жарық'], 1], [['Радиоволны', 'Радиотолқындар'], 1], [['Звук', 'Дыбыс'], 0], [['Ультразвук', 'Ультрадыбыс'], 0], [['Морские волны', 'Теңіз толқындары'], 0]]).slice(0, 6);
      var ans = []; items.forEach(function (x, i) { if (x[1]) ans.push(i); });
      return { tp: 3, type: 'multi', text: ['Выбери все электромагнитные волны.', 'Барлық электромагниттік толқынды таңда.'], opts: items.map(function (x) { return x[0]; }), ans: ans, why: ['Звук, ультразвук и морские волны механические. Остальные электромагнитные.', 'Дыбыс, ультрадыбыс және теңіз толқындары механикалық. Қалғандары электромагниттік.'] }; },
    function (r) { var items = shuffle(r, [['Удельное сопротивление', 'Меншікті кедергі', 0], ['Сила тока', 'Ток күші', 1], ['Тепло, которое выделяется за минуту', 'Бір минутта бөлінетін жылу', 1], ['Мощность тока', 'Ток қуаты', 1], ['Масса проводника', 'Өткізгіш массасы', 0], ['Длина проводника', 'Өткізгіш ұзындығы', 0]]);
      var ans = []; items.forEach(function (x, i) { if (x[2]) ans.push(i); });
      return { tp: 2, type: 'multi', text: ['Сопротивление проводника не менялось, а напряжение выросло. Какие величины тоже выросли?', 'Өткізгіш кедергісі өзгермеді, ал кернеу артты. Тағы қандай шамалар артты?'], opts: items.map(function (x) { return [x[0], x[1]]; }), ans: ans, why: ['I = U / R и P = UI: при росте напряжения растут ток и мощность, а значит и выделяемое тепло. Удельное сопротивление, масса и длина проводника от напряжения не зависят.', 'I = U / R және P = UI: кернеу артса, ток пен қуат, демек бөлінетін жылу да артады. Меншікті кедергі, өткізгіштің массасы мен ұзындығы кернеуге байланысты емес.'] }; }
  ];
  /* facts with several right answers: [topic, text, right options, wrong options, why] */
  [
    [0, ['Выбери все величины, которые измеряются в джоулях.', 'Джоульмен өлшенетін барлық шаманы таңда.'], [['Работа', 'Жұмыс'], ['Кинетическая энергия', 'Кинетикалық энергия'], ['Количество теплоты', 'Жылу мөлшері']], [['Сила', 'Күш'], ['Мощность', 'Қуат'], ['Давление', 'Қысым']], ['Работа, энергия и теплота измеряются в джоулях. Сила в ньютонах, мощность в ваттах, давление в паскалях.', 'Жұмыс, энергия және жылу джоульмен өлшенеді. Күш ньютонмен, қуат ваттпен, қысым паскальмен өлшенеді.']],
    [0, ['Выбери все основные единицы СИ.', 'ХБЖ-ның барлық негізгі бірлігін таңда.'], [['Метр', 'Метр'], ['Килограмм', 'Килограмм'], ['Секунда', 'Секунд'], ['Ампер', 'Ампер']], [['Ньютон', 'Ньютон'], ['Джоуль', 'Джоуль']], ['Ньютон и джоуль это производные единицы, их выражают через основные.', 'Ньютон мен джоуль туынды бірліктер, олар негізгі бірліктер арқылы өрнектеледі.']],
    [1, ['Выбери все изопроцессы.', 'Барлық изопроцесті таңда.'], [['Изотермический', 'Изотермиялық'], ['Изобарный', 'Изобаралық'], ['Изохорный', 'Изохоралық']], [['Плавление', 'Балқу'], ['Диффузия', 'Диффузия'], ['Испарение', 'Булану']], ['В изопроцессе постоянна одна величина: температура, давление или объём.', 'Изопроцесте бір шама тұрақты: температура, қысым немесе көлем.']],
    [2, ['Выбери все хорошие проводники электрического тока.', 'Электр тогын жақсы өткізетін барлық материалды таңда.'], [['Медь', 'Мыс'], ['Алюминий', 'Алюминий'], ['Серебро', 'Күміс']], [['Резина', 'Резеңке'], ['Стекло', 'Шыны'], ['Фарфор', 'Фарфор']], ['Металлы хорошо проводят ток. Резина, стекло и фарфор это диэлектрики.', 'Металдар токты жақсы өткізеді. Резеңке, шыны және фарфор — диэлектриктер.']],
    [5, ['Выбери все частицы, из которых состоит ядро атома.', 'Атом ядросын құрайтын барлық бөлшекті таңда.'], [['Протон', 'Протон'], ['Нейтрон', 'Нейтрон']], [['Электрон', 'Электрон'], ['Фотон', 'Фотон'], ['Позитрон', 'Позитрон']], ['Ядро состоит из протонов и нейтронов. Электроны движутся вокруг ядра.', 'Ядро протондар мен нейтрондардан тұрады. Электрондар ядроны айнала қозғалады.']]
  ].forEach(function (f) {
    PHYS.push(function (r) {
      var all = shuffle(r, f[2].concat(f[3])), ans = [];
      all.forEach(function (o, i) { if (f[2].indexOf(o) >= 0) ans.push(i); });
      return { tp: f[0], type: 'multi', text: f[1], opts: all, ans: ans, why: f[4] };
    });
  });
  return { MLIT: MLIT, MATH: MATH, PHYS: PHYS, rng: rng, h: { int: int, pick: pick, shuffle: shuffle, single: single, pair: pair, merge: merge, money: money, num: num, term: term, sub: sub } };
})();
