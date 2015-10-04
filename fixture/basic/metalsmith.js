var app = require('bookdown-core/ms')(__dirname)
  .use(require('bookdown-core')())
  .use(require('../../')())

if (module.parent) {
  module.exports = app
} else {
  app.build(function (err) { if (err) throw err })
}
