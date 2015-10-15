'use strict'

const join = require('path').join
const readFileSync = require('fs').readFileSync

module.exports = function buildCss (options, done) {
  try {
    const stylus = require('stylus')
    const postcss = require('postcss')
    const autoprefixer = require('autoprefixer')({})
    let data = readFileSync(join(__dirname, '../data/style.styl'), 'utf-8')

    // if (options.before) {
    //   data = data.replace('// :before:\n',
    //     `@import ${JSON.stringify(options.before)}\n`)
    // }
    // if (options.after) {
    //   data += `\n@import ${JSON.stringify(options.after)}`
    // }

    stylus(data)
      .set('filename', join(__dirname, '../data/style.styl'))
      .include(join(__dirname, '../node_modules'))
      // .set('compress', true)
      // .import
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
