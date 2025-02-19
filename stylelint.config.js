export default {
  defaultSeverity: 'error',
  extends: ['stylelint-config-standard'],
  rules: {
    'no-descending-specificity': null,
    'import-notation': 'string',
    'no-empty-source': null,
    'custom-property-pattern': null,
    'selector-class-pattern': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['deep'],
      },
    ],
    'media-query-no-invalid': null, // 官方表示此规则应当仅对于原生CSS启用，对于预处理器（Less）不应启用
    'font-family-no-missing-generic-family-keyword': null,
    'at-rule-no-unknown': null,
  },
  overrides: [
    {
      files: ['**/*.html', '**/*.vue'],
      customSyntax: 'postcss-html',
    },
    {
      files: ['**/*.less'],
      customSyntax: 'postcss-less',
    },
  ],
};
