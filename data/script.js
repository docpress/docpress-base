/* eslint-disable no-new */
var Pjax = require('pjax')
var Nprogress = require('nprogress')

window.Pjax = Pjax
window.Nprogress = Nprogress

new Pjax({
  selectors: ['.markdown-body', '.toc-menu', 'title']
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
