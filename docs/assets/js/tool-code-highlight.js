/* =========================================================
   Tool Code Highlight - 工具页共享语法着色 (自包含, 无外部依赖)
   配色: IDEA Light 风格令牌, 颜色定义在 tool-studio.css (.ts-tok-*)
         深色上下文由各工具页用自己的变量覆盖 (如 json-tool 的 --jd-*)
   API:
     tsCode.highlight(code, lang) -> html 字符串
     tsCode.scan(root)            -> 为 [data-ts-code] 元素一次性着色 (幂等)
   语言: json js python java go php sql bash xml/html css yaml + generic 回退
   安全: 全部文本经 HTML 转义后输出; >100KB 仅转义不着色
   版本: 20260830a
   ========================================================= */
(function () {
  'use strict';

  var ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
  function esc(s) { return s.replace(/[&<>]/g, function (c) { return ESC_MAP[c]; }); }

  var ALIAS = {
    javascript: 'js', js: 'js', ts: 'js', typescript: 'js', jsx: 'js', node: 'js',
    python: 'python', py: 'python', py3: 'python',
    java: 'java', go: 'go', golang: 'go', php: 'php',
    json: 'json', jsonc: 'json', json5: 'json',
    sql: 'sql', mysql: 'sql',
    bash: 'bash', sh: 'bash', shell: 'bash', zsh: 'bash', console: 'bash',
    xml: 'xml', html: 'xml', svg: 'xml',
    css: 'css', yaml: 'yaml', yml: 'yaml'
  };

  var KW = {
    js: ('const let var function return if else for while do switch case break continue new class extends super this typeof instanceof in of async await yield try catch finally throw import export from default delete void debugger static get set true false null undefined NaN Infinity').split(' '),
    python: ('def class return if elif else for while in import from as try except finally raise with lambda yield pass break continue global nonlocal assert del and or not is async await True False None self').split(' '),
    java: ('public private protected class interface enum extends implements static final abstract void int long short byte float double boolean char return if else for while do switch case break continue new this super try catch finally throw throws import package instanceof assert default sealed record var true false null').split(' '),
    go: ('func package import var const type struct interface map chan go defer select switch case default if else for range return break continue fallthrough goto true false nil iota').split(' '),
    php: ('function class public private protected static abstract final return if else elseif foreach for while do switch case break continue new this echo print use namespace require require_once include include_once extends implements interface trait try catch finally throw as list array yield fn match true false null').split(' '),
    sql: ('SELECT FROM WHERE AND OR NOT IN AS JOIN LEFT RIGHT FULL INNER OUTER CROSS ON GROUP BY ORDER HAVING LIMIT OFFSET INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE ALTER DROP INDEX VIEW PRIMARY KEY FOREIGN REFERENCES DISTINCT COUNT SUM AVG MIN MAX CASE WHEN THEN ELSE END NULL IS LIKE BETWEEN UNION ALL EXISTS ASC DESC').split(' '),
    bash: ('if then else elif fi for while until do done case esac function return exit local export echo printf cd source set unset readonly shift in select time').split(' '),
    yaml: ('true false null yes no on off').split(' ')
  };
  var KWSET = {};
  Object.keys(KW).forEach(function (k) {
    var set = {};
    KW[k].forEach(function (w) { set[w] = 1; });
    KWSET[k] = set;
  });

  var IDENT = /[A-Za-z_$][\w$]*/y;
  var WS = /[ \t]+/y;

  /* 字符串规则: 允许行尾未闭合(输入中途也保持着色) */
  var STR_DQ = /"(?:[^"\\\n]|\\.)*"?/y;
  var STR_SQ = /'(?:[^'\\\n]|\\.)*'?/y;

  function peekChar(code, pos) {
    var j = pos;
    while (j < code.length && (code[j] === ' ' || code[j] === '\t')) j++;
    return j < code.length ? code[j] : '';
  }

  /* 各语言: rules = [class|null, 粘性正则] 依序尝试; 之后走标识符分类 */
  var LANGS = {
    json: {
      keyAfterString: true,
      rules: [
        ['ts-tok-punc', /[{}\[\],:]/y],
        ['ts-tok-num', /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y]
      ],
      strings: [STR_DQ]
    },
    js: {
      kwSet: KWSET.js, peekFn: true,
      rules: [
        ['ts-tok-com', /\/\/[^\n]*/y],
        ['ts-tok-com', /\/\*[\s\S]*?(?:\*\/|$)/y],
        ['ts-tok-num', /0[xXbBoO][0-9a-fA-F]+n?|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?n?/y]
      ],
      strings: [STR_DQ, STR_SQ, /`(?:[^`\\]|\\.)*`?/y]
    },
    python: {
      kwSet: KWSET.python, peekFn: true,
      rules: [
        ['ts-tok-com', /#[^\n]*/y],
        ['ts-tok-ann', /@[A-Za-z_]\w*/y],
        ['ts-tok-num', /\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?(?:[jJ])?/y]
      ],
      strings: [/'''[\s\S]*?'''/y, /"""[\s\S]*?"""/y, /(?:[rRbBuUfF]{0,2})(?:'''[\s\S]*?'''|"""[\s\S]*?''')/y, /(?:[rRbBuUfF]{0,2})"(?:[^"\\\n]|\\.)*"?/y, /(?:[rRbBuUfF]{0,2})'(?:[^'\\\n]|\\.)*'?/y]
    },
    java: {
      kwSet: KWSET.java, peekFn: true, capType: true,
      rules: [
        ['ts-tok-com', /\/\/[^\n]*/y],
        ['ts-tok-com', /\/\*[\s\S]*?(?:\*\/|$)/y],
        ['ts-tok-ann', /@[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*/y],
        ['ts-tok-num', /0[xX][0-9a-fA-F_]+[lL]?|\d[\d_]*(?:\.\d*)?(?:[eE][+-]?\d+)?[fFdDlL]?/y]
      ],
      strings: [STR_DQ, /'(?:[^'\\\n]|\\.)*'/y]
    },
    go: {
      kwSet: KWSET.go, peekFn: true, capType: true,
      rules: [
        ['ts-tok-com', /\/\/[^\n]*/y],
        ['ts-tok-com', /\/\*[\s\S]*?(?:\*\/|$)/y],
        ['ts-tok-num', /0[xXpP_]?[0-9a-fA-F_]*(?:\.\d+)?(?:[eE][+-]?\d+)?i?/y]
      ],
      strings: [STR_DQ, /`(?:[^`\\]|\\.)*`?/y, /'(?:[^'\\\n]|\\.)*'/y]
    },
    php: {
      kwSet: KWSET.php, peekFn: true,
      rules: [
        ['ts-tok-kw', /<\?(?:php\b)?/y],
        ['ts-tok-com', /\/\/[^\n]*/y],
        ['ts-tok-com', /#[^\n]*/y],
        ['ts-tok-com', /\/\*[\s\S]*?(?:\*\/|$)/y],
        ['ts-tok-num', /0[xX][0-9a-fA-F]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y]
      ],
      strings: [STR_DQ, STR_SQ]
    },
    sql: {
      kwSet: KWSET.sql, ciKw: true, peekFn: true,
      rules: [
        ['ts-tok-com', /--[^\n]*/y],
        ['ts-tok-com', /\/\*[\s\S]*?(?:\*\/|$)/y],
        ['ts-tok-num', /\d+(?:\.\d+)?/y]
      ],
      strings: [STR_SQ, STR_DQ]
    },
    bash: {
      kwSet: KWSET.bash, peekFn: true,
      rules: [
        ['ts-tok-com', /#![^\n]*/y],
        ['ts-tok-com', /#[^\n]*/y],
        ['ts-tok-key', /\$\{[^}\n]*\}|\$[A-Za-z_]\w*|\$[@#?$!*\-]/y],
        ['ts-tok-num', /\d+/y]
      ],
      strings: [STR_DQ, STR_SQ]
    },
    css: {
      rules: [
        ['ts-tok-com', /\/\*[\s\S]*?(?:\*\/|$)/y],
        ['ts-tok-ann', /@[\w-]+/y],
        ['ts-tok-num', /#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|em|rem|vh|vw|vmin|vmax|%|s|ms|pt|fr|ch|deg)?/y]
      ],
      strings: [STR_DQ, STR_SQ],
      peekColonKey: true
    },
    yaml: {
      kwSet: KWSET.yaml,
      rules: [
        ['ts-tok-com', /#[^\n]*/y],
        ['ts-tok-num', /-?\d+(?:\.\d+)?/y],
        ['ts-tok-punc', /[-:|>]/y]
      ],
      strings: [STR_DQ, STR_SQ],
      peekColonKey: true
    },
    generic: {
      rules: [
        ['ts-tok-com', /\/\/[^\n]*/y],
        ['ts-tok-com', /#[^\n]*/y],
        ['ts-tok-com', /\/\*[\s\S]*?(?:\*\/|$)/y],
        ['ts-tok-num', /\b0[xX][0-9a-fA-F]+|\b\d+(?:\.\d+)?/y]
      ],
      strings: [STR_DQ, STR_SQ, /`(?:[^`\\]|\\.)*`?/y]
    }
  };

  function classifyWord(word, endPos, code, cfg) {
    var isKw = cfg.kwSet && (cfg.ciKw ? !!cfg.kwSet[word.toUpperCase()] : !!cfg.kwSet[word]);
    if (isKw) return 'ts-tok-kw';
    if (cfg.peekFn && peekChar(code, endPos) === '(') return 'ts-tok-fn';
    if (cfg.capType && /^[A-Z]/.test(word)) return 'ts-tok-type';
    return null;
  }

  function highlightGeneric(code, lang) {
    var cfg = LANGS[lang] || LANGS.generic;
    var out = [];
    var i = 0, n = code.length;
    while (i < n) {
      var ch = code[i];
      if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') { out.push(esc(ch)); i++; continue; }

      /* 字符串阶段优先 (注释规则可能出现在字符串内容里, 如 "http://x") */
      var hit = null, hitLen = 0, hitType = null;
      if (cfg.strings) {
        for (var s = 0; s < cfg.strings.length; s++) {
          var sre = cfg.strings[s];
          sre.lastIndex = i;
          var sm = sre.exec(code);
          if (sm && sm[0]) { hit = sm[0]; hitLen = sm[0].length; hitType = cfg.keyAfterString ? 'ts-tok-key?' : 'ts-tok-str'; break; }
        }
      }
      /* 规则阶段 (注释/数字/特殊) */
      if (!hit) {
        for (var k = 0; k < cfg.rules.length; k++) {
          var re = cfg.rules[k][1];
          re.lastIndex = i;
          var m = re.exec(code);
          if (m && m[0]) { hit = m[0]; hitLen = m[0].length; hitType = cfg.rules[k][0]; break; }
        }
      }
      if (hit) {
        if (hitType === 'ts-tok-key?') {
          /* JSON "key": 前窥冒号 (跳过中间空白与换行) */
          var p = i + hitLen;
          while (p < n && (code[p] === ' ' || code[p] === '\t' || code[p] === '\n' || code[p] === '\r')) p++;
          hitType = (p < n && code[p] === ':') ? 'ts-tok-key' : 'ts-tok-str';
        }
        out.push('<span class="' + hitType + '">' + esc(hit) + '</span>');
        i += hitLen;
        continue;
      }

      /* 标识符阶段 */
      IDENT.lastIndex = i;
      var idm = IDENT.exec(code);
      if (idm && idm[0]) {
        var word = idm[0];
        var cls = cfg.kwSet || cfg.peekFn || cfg.capType || cfg.peekColonKey
          ? classifyWord(word, i + word.length, code, cfg)
          : null;
        if (cfg.peekColonKey && !cls && peekChar(code, i + word.length) === ':') cls = 'ts-tok-key';
        out.push(cls ? '<span class="' + cls + '">' + esc(word) + '</span>' : esc(word));
        i += word.length;
        continue;
      }

      /* 单字符: 结构标点弱化, 其余默认色 */
      if ('{}()[];,.'.indexOf(ch) !== -1) out.push('<span class="ts-tok-punc">' + esc(ch) + '</span>');
      else out.push(esc(ch));
      i++;
    }
    return out.join('');
  }

  /* XML/HTML: 标签名/属性/字符串/注释 状态机 */
  function highlightXml(code) {
    var out = [];
    var i = 0, n = code.length, inTag = false;
    var NAME = /[A-Za-z][\w:.-]*/y;
    var ATTR = /[^\s=\/>]+/y;
    while (i < n) {
      if (!inTag) {
        if (code.startsWith('<!--', i)) {
          var e = code.indexOf('-->', i);
          var endC = e === -1 ? n : e + 3;
          out.push('<span class="ts-tok-com">' + esc(code.slice(i, endC)) + '</span>');
          i = endC; continue;
        }
        if (code.startsWith('<!', i)) {
          var e2 = code.indexOf('>', i);
          var endD = e2 === -1 ? n : e2 + 1;
          out.push('<span class="ts-tok-com">' + esc(code.slice(i, endD)) + '</span>');
          i = endD; continue;
        }
        if (code[i] === '<') {
          out.push('<span class="ts-tok-punc">&lt;</span>');
          if (code[i + 1] === '/') { out.push('<span class="ts-tok-punc">/</span>'); i += 2; }
          else i++;
          NAME.lastIndex = i;
          var nm = NAME.exec(code);
          if (nm && nm[0] && nm.index === i) {
            out.push('<span class="ts-tok-tag">' + esc(nm[0]) + '</span>');
            i += nm[0].length;
          }
          inTag = true; continue;
        }
        var nxt = code.indexOf('<', i);
        if (nxt === -1) nxt = n;
        out.push(esc(code.slice(i, nxt)));
        i = nxt; continue;
      }
      /* 标签内部 */
      var ch = code[i];
      if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') { out.push(esc(ch)); i++; continue; }
      if (ch === '>') { out.push('<span class="ts-tok-punc">&gt;</span>'); inTag = false; i++; continue; }
      if (ch === '/' && code[i + 1] === '>') { out.push('<span class="ts-tok-punc">/&gt;</span>'); inTag = false; i += 2; continue; }
      if (ch === '=') { out.push('<span class="ts-tok-punc">=</span>'); i++; continue; }
      if (ch === '"' || ch === "'") {
        var q = code.indexOf(ch, i + 1);
        var endS = q === -1 ? n : q + 1;
        out.push('<span class="ts-tok-str">' + esc(code.slice(i, endS)) + '</span>');
        i = endS; continue;
      }
      ATTR.lastIndex = i;
      var am = ATTR.exec(code);
      if (am && am[0] && am.index === i) {
        out.push('<span class="ts-tok-key">' + esc(am[0]) + '</span>');
        i += am[0].length; continue;
      }
      out.push(esc(ch)); i++;
    }
    return out.join('');
  }

  function highlight(code, lang) {
    if (!code) return '';
    if (code.length > 100000) return esc(code);
    var l = ALIAS[(lang || '').toLowerCase()] || 'generic';
    if (l === 'xml') return highlightXml(code);
    return highlightGeneric(code, l);
  }

  /* 为 [data-ts-code] 元素一次性着色; 幂等 (data-ts-done 标记) */
  function scan(root) {
    var nodes = (root || document).querySelectorAll('[data-ts-code]');
    Array.prototype.forEach.call(nodes, function (el) {
      if (el.getAttribute('data-ts-done')) return;
      var lang = el.getAttribute('data-ts-lang') || '';
      el.innerHTML = highlight(el.textContent, lang);
      el.setAttribute('data-ts-done', '1');
    });
  }

  window.tsCode = { highlight: highlight, scan: scan, esc: esc };
})();
