module.exports = {
  root: true,

  extends: ['@metamask/eslint-config'],

  overrides: [
    {
      files: ['*.js'],
      parserOptions: {
        sourceType: 'script',
      },
      extends: ['@metamask/eslint-config-nodejs'],
    },

    {
      files: ['test/*.js'],
      parserOptions: {
        // To accommodate private fields syntax; this won't be necessary with
        // the TypeScript configuration
        ecmaVersion: 2022,
      },
      rules: {
        'id-length': [
          'error',
          {
            min: 2,
            properties: 'never',
            // Allow `t` for Tape; this won't be necessary with Jest
            exceptionPatterns: ['_', 'a', 'b', 'i', 'j', 'k', 't'],
          },
        ],
      },
    },
  ],

  ignorePatterns: [
    '!.eslintrc.js',
    '!.prettierrc.js',
    'dist/',
    'docs/',
    '.yarn/',
  ],

  // For some reason this is not getting applied automatically;
  // we expect this not to be a problem when using TypeScript directly
  settings: {
    jsdoc: {
      mode: 'typescript',
    },
  },
};
