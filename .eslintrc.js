// eslint is just for some react-hooks rules that aren't in tslint
module.exports = {
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "useJSXTextNode": true,
    "ecmaVersion": 6,
    "sourceType": "module",
    "ecmaFeatures": {
      "modules": true,
      "jsx": true
    }
  },
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error"
  }
};
