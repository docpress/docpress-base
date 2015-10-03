const ware = require('ware')
const fs = require('fs')
const join = require('path').join
const jade = require('jade')
const assign = Object.assign
const sass = require('node-sass')

var app = ware()
  .use(addAssets)
  .use(relayout)
  .use(require('metalsmith-sass'))

function addAssets (files, ms, done) {
  const result = sass.renderSync({
    includePaths: [ join(__dirname, 'node_modules') ],
    file: join(__dirname, 'data/style.sass'),
    outputStyle: 'compact'
  })
  files['assets/style.css'] = {
    contents: result.css
  }
  done()
}

function relayout (files, ms, done) {
  const layout = jade.compile(fs.readFileSync(join(__dirname, 'data/layout.jade'), 'utf-8'))

  Object.keys(files).forEach((fname) => {
    if (!fname.match(/\.html$/)) return
    const file = files[fname]
    const base = Array(fname.split('/').length).join('../')
    file.contents = layout(assign({}, file, { base }))
  })
  done()
}

module.exports = app.run.bind(app)
