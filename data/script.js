/* eslint-disable no-new */
var Pjax = require('pjax')
var Nprogress = require('nprogress')
var hljs = require('highlight.js')
var onmount = require('onmount')
var each = require('dom101').each
var toggleClass = require('dom101').toggleClass
var ready = require('dom101').ready

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
