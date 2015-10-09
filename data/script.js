/* eslint-disable no-new */
var Pjax = require('pjax')
var Nprogress = require('nprogress')
var hljs = require('highlight.js')
var onmount = require('onmount')
var each = require('dom101/each')
var toggleClass = require('dom101/toggle-class')
var ready = require('dom101/ready')
var Scrolltrack = require('./scrolltrack')
var Scrollclass = require('./scrollclass')

/*
 * pjax/nprogress
 */

void (function () {
  new Pjax({
    selectors: ['.body', '.toc-menu', 'title']
  })

  document.addEventListener('pjax:send', function () {
    Nprogress.start()
  })

  document.addEventListener('pjax:error', function () {
    Nprogress.done()
  })

  document.addEventListener('pjax:complete', function () {
    Nprogress.done()
  })
}())

/*
 * pre (highlight.js)
 */

onmount('pre > code[class]', function () {
  // Mappings of hljs -> GitHub syntax highlighting classes
  var dict = {
    'hljs-string': 'pl-s',
    'hljs-comment': 'pl-c',
    'hljs-keyword': 'pl-k',
    'hljs-attribute': 'pl-e',
    'hljs-built_in': 'pl-c1',
    'hljs-title': 'pl-ent',
    'hljs-value': 'pl-s',
    'hljs-literal': 'pl-c1'
  }

  hljs.highlightBlock(this)

  each(this.querySelectorAll('[class^="hljs-"]'), function (el) {
    var synonym = dict[el.className]
    if (synonym) el.className = synonym
  })
})

/*
 * menu toggle
 */

onmount('.js-menu-toggle', function () {
  this.addEventListener('click', function () {
    toggleClass(document.body, '-menu-visible')
  })
})

/*
 * onmount
 */

void (function () {
  ready(function () {
    onmount()
  })

  document.addEventListener('pjax:complete', function () {
    onmount()
  })
}())

/*
 * scrolltrack
 */

void (function () {
  var st = new Scrolltrack({
    menu: '.toc-menu',
    selector: 'h2, h3',
    onupdate: function (active, last) {
      var menu = document.querySelector('.toc-menu')
      var link = menu.querySelector('.link.-active, .link.-notactive')

      toggleClass(link, '-active', !active)
      toggleClass(link, '-notactive', active)
    }
  })

  document.addEventListener('pjax:complete', function () {
    st.update()
  })

  ready(function () {
    st.update()
  })
}())

void(function () {
  onmount('.footer-nav', function (b) {
    b.sc = Scrollclass(this, {
      className: '-expanded',
      onscroll: function (y) {
        console.log(this.maxScroll, y, this.maxScroll - y < 1)
        return this.maxScroll - y < 1
      }
    })
  }, function (b) {
    b.sc.destroy()
  })
}())

void(function () {
  onmount('.header-nav', function (b) {
    b.sc = Scrollclass(this, {
      className: '-expanded',
      onscroll: function (y) { return y < 40 }
    })
  }, function (b) {
    b.sc.destroy()
  })
}())
