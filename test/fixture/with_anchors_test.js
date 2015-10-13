'use strict'

const fixture = require('../support/fixture')

describe('fixture/with anchors:', function () {
  this.timeout(10000)

  let app, data
  let fx = fixture('with-anchors')

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

    it('renders as html', function () {
      expect(data).toInclude('<!doctype html>')
      expect(data).toInclude('markdown-body')
      expect(data).toInclude('toc-menu')
      expect(data).toInclude('body page-index') // slug
    })

    it('links to anchored versions', function () {
      expect(data).toInclude('<a href="index.html#two" class="link title  link-index-2">intro 2</a>')
    })
  })
})
