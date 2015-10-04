'use strict'

const ware = require('ware')
const fs = require('fs')
const jade = require('jade')
const join = require('path').join
const assign = Object.assign

const buildJs = require('./lib/build_js')
const buildCss = require('./lib/build_css')

/**
 * Metalsmith middleware
 */

module.exports = function base (options) {
  var app = ware()
    .use(addJs)
    .use(addCss)
    .use(relayout)

  return function (files, ms, done) {
    app.run(files, ms, done)
  }
}

/**
 * Assets
 */

function addCss (files, ms, done) {
  buildCss((err, contents) => {
    if (err) return done(err)
    if (!files['assets/style.css']) {
      files['assets/style.css'] = { contents }
    } else {
      console.log('custom')
      files['assets/style.css'].contents = contents + '\n' +
        files['assets/style.css'].contents
    }
    done()
  })
}

function addJs (files, ms, done) {
  buildJs((err, contents) => {
    if (err) return done(err)
    if (!files['assets/script.js']) {
      files['assets/script.js'] = { contents }
    } else {
      files['assets/script.js'].contents = contents + '\n' +
        files['assets/script.js'].contents
    }
    done()
  })
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
