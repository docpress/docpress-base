'use strict'

const join = require('path').join

module.exports = function buildCss (done) {
  try {
    const sass = require('node-sass')
    const postcss = require('postcss')
    const autoprefixer = require('autoprefixer')({})

    const result = sass.renderSync({
      includePaths: [ join(__dirname, '../node_modules') ],
      file: join(__dirname, '../data/style.sass'),
      outputStyle: 'compressed'
    })

    let css = result.css
    css = postcss([autoprefixer]).process(css).css
    done(null, css)
  } catch (err) {
    done(err)
  }
}
