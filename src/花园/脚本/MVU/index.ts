// MagVarUpdate 内嵌 pinia 依赖这些全局绑定；必须先写入再加载（webpackIgnore 防止被提升成静态 import）
(0, eval)('var __VUE_PROD_DEVTOOLS__ = false; var __VUE_OPTIONS_API__ = true;');
void import(
  /* webpackIgnore: true */
  'https://testingcf.jsdelivr.net/gh/MagicalAstrogy/MagVarUpdate/artifact/bundle.js',
);
