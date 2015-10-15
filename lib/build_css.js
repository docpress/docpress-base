'use strict'

const join = require('path').join
const readFileSync = require('fs').readFileSync

const stylus = require('stylus')
const postcss = require('postcss')
const autoprefixer = require('autoprefixer')({})

module.exports = function buildCss (options, done) {
  buildStylus(join(__dirname, '../data/style.styl'), done)
}

function buildStylus (filepath, done) {
  try {
    let data = readFileSync(filepath, 'utf-8')

    // if (options.before) {
    //   data = data.replace('// :before:\n',
    //     `@import ${JSON.stringify(options.before)}\n`)
    // }
    // if (options.after) {
    //   data += `\n@import ${JSON.stringify(options.after)}`
    // }

    stylus(data)
      .set('filename', filepath)
      .include(join(__dirname, '../node_modules'))
      .render((err, result) => {
        if (err) return done(err)
        let css = result
        css = postcss([autoprefixer]).process(css).css
        done(null, css)
      })
  } catch (err) {
    done(err)
  }
}
