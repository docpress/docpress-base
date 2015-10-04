var bookdown = require('bookdown-core')
var Metalsmith = require('metalsmith')

var app = Metalsmith(__dirname)
  .source('.')
  .destination('_bookdown')
  .ignore('!{*.md,docs}')
  .ignore('_bookdown')
  .use(require('bookdown-core')())
  .use(require('../../')())

if (module.parent) {
  module.exports = app
} else {
  app.build(function (err) { if (err) throw err })
}
