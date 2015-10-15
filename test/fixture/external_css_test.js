'use strict'

const fixture = require('../support/fixture')

describe('fixture/external-css:', function () {
  this.timeout(10000)

  let app, data
  let fx = fixture('external-css')

  before(function (done) {
    app = require(fx.path('metalsmith.js'))
    app.build((err) => {
      if (err) return done(err)
      done()
    })
  })

  describe('index.html', function () {
    before(function () {
      data = fx.read('_docpress/index.html').toLowerCase()
    })

    it('renders external css', function () {
      expect(data).toInclude('<link rel="stylesheet" href="http://site.com/external.css">')
    })
  })
})
