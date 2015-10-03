const ware = require('ware')
const fs = require('fs')
const join = require('path').join

var app = ware()
  .use(addAssets)
  .use(relayout)
  .use(require('metalsmith-sass'))

function addAssets (files, ms, done) {
  files['assets/normalize.css'] = {
    contents: fs.readFileSync(require.resolve('normalize.css'), 'utf-8')
  }
  files['assets/markdown.css'] = {
    contents: fs.readFileSync(join(__dirname, 'node_modules/github-markdown-css/github-markdown.css'), 'utf-8')
  }
  done()
}

function relayout (files, ms, done) {
  Object.keys(files).forEach((fname) => {
    if (!fname.match(/\.html$/)) return

    const file = files[fname]

    const base = Array(fname.split('/').length).join('../')

    file.contents =
      `<!doctype html>\n` +
      `<html>\n` +
      `<meta charset='utf-8'>\n` +
      `<link rel="stylesheet" href='${base}assets/normalize.css'>\n` +
      `<link rel="stylesheet" href='${base}assets/markdown.css'>\n` +
      `<div class='markdown-body'>\n` +
      file.contents.toString()
  })
  done()
}

module.exports = app.run.bind(app)
