'use strict'

const fixture = require('./support/fixture')

describe('fixture', function () {
  let app, data
  let fx = fixture('onmount')

  before(function (done) {
    app = require(fx.path('metalsmith.js'))
    app.build((err) => {
      if (err) return done(err)
      done()
    })
  })

  describe('index.html', function () {
    before(function () {
      data = fx.read('_bookdown/index.html').toLowerCase()
    })

    it('renders as html', function () {
      expect(data).toInclude('<!doctype html>')
      expect(data).toInclude('markdown-body')
      expect(data).toInclude('toc-menu')
    })

    it('highlights current menu item', function () {
      expect(data).toMatch(/-active['"]>onmount/)
    })
  })

  describe('style.css', function () {
    before(function () {
      data = fx.read('_bookdown/assets/style.css')
    })

    it('works', function () {
      expect(data).toInclude('.markdown-body')
      expect(data).toInclude('.toc-menu')
    })

    it('renders custom css', function () {
      expect(data).toInclude('fira sans')
    })
  })

  describe('script.js', function () {
    before(function () {
      data = fx.read('_bookdown/assets/script.js')
    })

    it('works', function () {
      expect(data).toInclude('Pjax')
      expect(data).toInclude('pjax:complete')
      expect(data).toInclude('Nprogress')
    })

    it('renders custom js', function () {
      expect(data).toInclude('/* custom */')
    }) })
})
