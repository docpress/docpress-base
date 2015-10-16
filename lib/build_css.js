'use strict'

const join = require('path').join
const readFileSync = require('fs').readFileSync
const dirname = require('path').dirname

module.exports = function buildCss (options, done) {
  buildStylus(join(__dirname, '../data/style.styl'), options, done)
}

function buildStylus (filepath, options, done) {
  try {
    const stylus = require('stylus')
    const postcss = require('postcss')
    const autoprefixer = require('autoprefixer')({})

    let data = readFileSync(filepath, 'utf-8')

    let s = stylus(data)
      .set('filename', filepath)
      .set('include css', true)
      .set('hoist atrules', true)
      .include(join(__dirname, '../node_modules'))

    if (options && options.compress) {
      s = s.set('compress', true)
    }

    if (options && options.imports) {
      options.imports.forEach((external) => {
        s = s
          .import(external)
          .include(dirname(external))
      })
    }

    s.render((err, result) => {
      if (err) return done(err)
      let css = result
      css = postcss([autoprefixer]).process(css).css
      done(null, css)
    })
  } catch (err) {
    done(err)
  }
}
