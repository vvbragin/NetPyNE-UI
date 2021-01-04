module.exports = {
  extends: [
    "./node_modules/@geppettoengine/geppetto-client/.eslintrc.js"
  ],
  rules: {
    'multiline-comment-style': 0,
  },
  globals: {
    page: true,
    browser: true,
    context: true,
    acnet2: true,
    c302: true,
    pvdr: true,
    net1: true,
    CanvasContainer: true,
    patchRequire: true
  }
};