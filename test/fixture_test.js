'use strict'

const fixture = require('./support/fixture')

describe('fixture', function () {
  let app, data

  before(function (done) {
    app = require(fixture('onmount/metalsmith.js'))
    app.build((err) => {
      if (err) return done(err)
      done()
    })
  })

  describe('index.html', function () {
    before(function () {
      data = fixture.file('onmount/_bookdown/index.html')
    })

    it('renders as html', function () {
      expect(data.toLowerCase()).toInclude('<!doctype html>')
      expect(data.toLowerCase()).toInclude('markdown-body')
      expect(data.toLowerCase()).toInclude('toc-menu')
    })
  })

  describe('style.css', function () {
    before(function () {
      data = fixture.file('onmount/_bookdown/assets/style.css')
    })

    it('works', function () {
      expect(data).toInclude('.markdown-body')
      expect(data).toInclude('.toc-menu')
    })
  })

  describe('script.js', function () {
    before(function () {
      data = fixture.file('onmount/_bookdown/assets/script.js')
    })

    it('works', function () {
      expect(data).toInclude('Pjax')
      expect(data).toInclude('pjax:complete')
      expect(data).toInclude('Nprogress')
    })
  })
})
