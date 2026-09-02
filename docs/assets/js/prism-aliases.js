/* =========================================================
   Prism 语言别名 (必须在各语法组件之后加载)
   与全站 markdown 代码栅栏实际用语对齐:
   - sh    → bash (bash 组件已注册 shell 别名, 缺 sh)
   - react → jsx  (jsx 组件注册 jsx, 缺 react)
   ========================================================= */
Prism.languages.sh = Prism.languages.bash;
Prism.languages.react = Prism.languages.jsx;
