/* =========================================================
   Prism 语言别名层 (必须在各语法组件之后加载)

   Prism 的语言查表**区分大小写**, 而 markdown 代码栅栏里的语言名常写成
   ```JAVA / ```XML / ```YAML 等大写形式, 查找失败时会静默退化为无高亮
   (docsify 对未知语言不报错, 只是不着色) —— 站内因此有整块代码丢失配色。

   本文件做三件事, 均为零体积(不引入新的语法组件):

   1) 修正别名: 补 Prism 组件未注册、但站内实际在用的写法
      sh → bash      (bash 组件已注册 shell, 缺 sh)
      react → jsx    (jsx 组件只注册 jsx)
      yml → yaml     (yaml 组件注册 yaml, 站内也写 yml)

   2) 大小写变体: 把站内出现过的写法归一到已加载的语法上。

   3) 近似映射: 无组件的语言映射到最接近的已加载语法, 仅保证关键字级着色。

   写法规约
     所有赋值都走 alias(), 只在「目标语法已存在」且「该键尚未注册」时生效 ——
     因此将来若补入更精确的语法组件, 不会被本文件覆盖。

   维护
     新增代码栅栏语言写法后, 在本表补一行即可(无需改 index.html)。
     第 3 节是为避免再引入组件文件而做的取舍, 目标语法并非完全等价;
     若某语言用量变大, 应改用官方组件并移出本节。
   ========================================================= */

(function (Prism) {
  'use strict';

  if (!Prism || !Prism.languages) return;

  var owns = Object.prototype.hasOwnProperty;

  function alias(name, target) {
    if (!name || !target) return;
    if (owns.call(Prism.languages, name)) return;       /* 已被正式组件占用, 不覆盖 */
    if (!owns.call(Prism.languages, target)) return;    /* 目标语法不存在, 直接跳过 */
    Prism.languages[name] = Prism.languages[target];
  }

  /* --- 1. 修正别名 --------------------------------------------------- */
  alias('sh', 'bash');
  alias('react', 'jsx');
  alias('yml', 'yaml');

  /* --- 2. 大小写变体 -------------------------------------------------
     逐个显式列出(而非批量生成小写副本), 以免污染 Prism.languages 的键空间,
     也便于日后检索「哪些写法真的被用过」。 */
  alias('JAVA', 'java');
  alias('Java', 'java');
  alias('Javascript', 'javascript');
  alias('JavaScript', 'javascript');
  alias('JS', 'javascript');
  alias('PYTHON', 'python');
  alias('Python', 'python');
  alias('SQL', 'sql');
  alias('JSON', 'json');
  alias('XML', 'xml');
  alias('HTML', 'html');
  alias('YAML', 'yaml');
  alias('YML', 'yaml');
  alias('Shell', 'shell');
  alias('SH', 'sh');
  alias('BASH', 'bash');
  alias('Bash', 'bash');
  alias('GO', 'go');
  alias('C', 'c');
  alias('Properties', 'properties');
  alias('INI', 'ini');
  alias('Lua', 'lua');
  alias('Docker', 'docker');
  alias('DOCKER', 'docker');
  alias('NGINX', 'nginx');
  alias('Powershell', 'powershell');
  alias('PowerShell', 'powershell');
  alias('Dockerfile', 'dockerfile');
  alias('CSS', 'css');

  /* --- 3. 近似映射 (为避免新增组件文件而做的取舍) ---------------------- */
  alias('cmd', 'powershell');        /* Windows 命令: set/echo/if/for 与 powershell 共享多数关键字 */
  alias('CMD', 'powershell');
  alias('linux', 'bash');            /* 站内 linux 块实为 shell 会话 */
  alias('Linux', 'bash');
  alias('conf', 'ini');              /* 配置片段: key=value 结构同 ini */
  alias('env', 'properties');        /* .env 即 key=value */
  alias('gitignore', 'properties');  /* 逐行文本, 无语法差异, 借用 properties 的注释着色 */
  alias('mysql', 'sql');             /* MySQL 方言, sql 语法可覆盖绝大部分 */
  alias('ts', 'javascript');         /* TypeScript 超集, 类型标注不着色, 关键字正常 */
  alias('tsx', 'jsx');
  alias('c++', 'c');                 /* cpp ≈ c + 类/模板, 关键字着色基本可用 */
  alias('cpp', 'c');
  alias('scss', 'css');              /* 站内 scss 块实为普通 CSS 属性清单 */
  alias('sass', 'css');
  alias('less', 'css');
  alias('toml', 'ini');              /* TOML 与 INI 同为 section + key=value 结构 */
  alias('vue', 'markup');            /* Vue SFC = template + script + style, 按标签着色 */
  alias('jsp', 'markup');            /* JSP 以 HTML 标签为主体 */
  alias('groovy', 'java');           /* Groovy 是 Java 超集, 关键字基本重合 */
  alias('git', 'bash');              /* 站内 git 块内容是 git 命令行 */

  /* 栅栏语言名拼写错误兜底(源文件位置见 _meta/SITE_AUDIT_2026-09.md,
     修正 markdown 后可删除本节) */
  alias('pyhon', 'python');
  alias('pyhton', 'python');
  alias('pythpn', 'python');
})(window.Prism);
