'use strict'

const join = require('path').join

module.exports = function buildJs (done) {
  const fname = join(__dirname, '../data/script.js')
  const browserify = require('browserify')
  const b = browserify()
  b.add(fname)
  b.bundle(done)
}
