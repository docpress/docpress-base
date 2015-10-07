'use strict'

const join = require('path').join
const readFileSync = require('fs').readFileSync

module.exports = function buildCss (options, done) {
  try {
    const sass = require('node-sass')
    const postcss = require('postcss')
    const autoprefixer = require('autoprefixer')({})
    let data = readFileSync(join(__dirname, '../data/style.sass'), 'utf-8')

    if (options.before) {
      data = data.replace('// :before:\n',
        `@import ${JSON.stringify(options.before)}\n`)
    }
    if (options.after) {
      data += `\n@import ${JSON.stringify(options.after)}`
    }

    const result = sass.renderSync({
      includePaths: [ join(__dirname, '../node_modules') ],
      file: join(__dirname, '../data/style.sass'),
      data: data,
      indentedSyntax: true,
      outputStyle: 'compressed'
    })

    let css = result.css
    css = postcss([autoprefixer]).process(css).css
    done(null, css)
  } catch (err) {
    done(err)
  }
}
