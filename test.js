/* Мини-проверка логики фильтра и поиска: подставляем заглушку DOM и
   прогоняем реальный код из _tests.js. */
function El(id){
  this.id = id; this.children = []; this.innerHTML = ''; this.textContent = '';
  this.value = ''; this.hidden = false; this.dataset = {}; this.className = '';
  this.classList = { toggle: function(){}, contains: function(){ return false; }, add:function(){}, remove:function(){} };
  this.handlers = {};
}
El.prototype.addEventListener = function(k, f){ this.handlers[k] = f; };
El.prototype.appendChild = function(c){ this.children.push(c); };
El.prototype.querySelectorAll = function(){ return this.children; };
El.prototype.querySelector = function(){ return null; };
El.prototype.scrollIntoView = function(){};

var store = {};
['ttTumors','ttFilters','ttBody','ttCount','ttEmpty','ttSearch','ttNote','heroTumors','tests']
  .forEach(function(id){ store[id] = new El(id); });

global.document = {
  getElementById: function(id){ return store[id] || null; },
  createElement: function(){ return new El('new'); },
  querySelectorAll: function(){ return []; }
};
global.window = global;

/* Берём код ровно из block.html, чтобы тест проверял то, что уходит в прод. */
var fs = require('fs');
var page = fs.readFileSync('block.html', 'utf8');
var a = page.indexOf('/* ============ Перечень исследований');
var b = page.indexOf('/* ============ FAQ ============ */', a);
new Function(page.slice(a, b))();

function rowsShown(){ return (store.ttBody.innerHTML.match(/<tr>/g) || []).length; }
function search(q){
  store.ttSearch.value = q;
  store.ttSearch.handlers.input();
  return rowsShown();
}
function tumor(key){
  var chip = store.ttTumors.children.filter(function(c){ return c.dataset.tumor === key; })[0];
  chip.handlers.click();
  return rowsShown();
}

var fails = 0;
function check(name, got, want){
  var ok = (typeof want === 'function') ? want(got) : got === want;
  if(!ok) fails++;
  console.log((ok ? 'OK  ' : 'FAIL') + '  ' + name + ' → ' + got + (ok ? '' : ' (ожидалось ' + want + ')'));
}

check('всего строк', rowsShown(), 34);
check('поиск "palb 2"', search('palb 2'), 1);
check('в результате — BRCA NGS', /BRCA1 и BRCA2 методом NGS/.test(store.ttBody.innerHTML), true);
check('код 1463 в строке', /1463/.test(store.ttBody.innerHTML), true);
check('поиск "PALB2"', search('PALB2'), 1);
check('поиск "palb2" строчными', search('palb2'), 1);
check('поиск по коду 1463', search('1463'), 1);
check('поиск "BRCA"', search('brca'), 2);
check('поиск "pd l1"', search('pd l1'), 3);
check('поиск "her2"', search('her2'), function(v){ return v >= 3; });
check('поиск "cd117" (синоним KIT)', search('cd117'), 1);
check('поиск "рмж"', search('рмж'), function(v){ return v > 5; });
check('поиск ерунды', search('йцукен'), 0);
check('пустой результат отрисован', /ничего не нашлось/.test(store.ttEmpty.innerHTML), true);
search('');
check('фильтр «Молочная железа»', tumor('breast'), function(v){ return v > 5 && v < 34; });
check('универсальные тесты видны при любом фильтре', /NTRK/.test(store.ttBody.innerHTML), true);
check('подсказка о локализации показана', store.ttNote.hidden === false, true);
check('фильтр «ГИСО»', tumor('gist'), function(v){ return v >= 3; });
check('CKIT/PDGFRA в ГИСО', /CKIT и PDGFRA/.test(store.ttBody.innerHTML), true);
check('фильтр «Детские опухоли»', tumor('pediatric'), function(v){ return v >= 4; });
check('MYCN в детских', /MYCN/.test(store.ttBody.innerHTML), true);
check('фильтр «Все» вернул всё', tumor('all'), 34);
check('поиск внутри фильтра', (tumor('lung'), search('egfr')), 2);

console.log(fails ? '\n' + fails + ' проверок упало' : '\nвсе проверки прошли');
process.exit(fails ? 1 : 0);
