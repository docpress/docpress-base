const ware = require('ware')

var app = ware()
  .use(addStuff)
  .use(require('metalsmith-sass'))

function addStuff (files, ms, done) {
  files['assets/normalize.css'] = {
    contents: require.resolve('normalize.css')
  }
}

module.exports = app.run.bind(app)
