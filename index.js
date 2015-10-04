'use strict'

const ware = require('ware')
const fs = require('fs')
const join = require('path').join
const jade = require('jade')
const assign = Object.assign
const sass = require('node-sass')

/**
 * Metalsmith middleware
 */

module.exports = function base (options) {
  var app = ware()
    .use(addAssets)
    .use(relayout)

  return app.run.bind(app)
}

/**
 * Assets
 */

function addAssets (files, ms, done) {
  const result = sass.renderSync({
    includePaths: [ join(__dirname, 'node_modules') ],
    file: join(__dirname, 'data/style.sass'),
    outputStyle: 'compact'
  })

  const postcss = require('postcss')
  const autoprefixer = require('autoprefixer')({})

  let css = result.css
  css = postcss([autoprefixer]).process(css).css

  files['assets/style.css'] = { contents: css }
  done()
}

/**
 * Layout jade
 */

function relayout (files, ms, done) {
  const toc = JSON.parse(files['toc.json'].contents)
  const index = JSON.parse(files['index.json'].contents)
  const path = fs.readFileSync(join(__dirname, 'data/layout.jade'), 'utf-8')
  const layout = jade.compile(path)

  Object.keys(files).forEach((fname) => {
    if (!fname.match(/\.html$/)) return
    const file = files[fname]
    const base = Array(fname.split('/').length).join('../')
    file.contents = layout(assign({}, file, {
      base, toc, index
    }))
  })

  done()
}
