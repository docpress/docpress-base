var toggleClass = require('dom101/toggle-class')
var scrollTop = require('dom101/scroll-top')
var documentHeight = require('dom101/document-height')
var debounce = require('debounce')
var each = require('dom101/each')

/**
 * Tracks scrolling. Options:
 *
 * - `selectors` (String)
 * - `parent` (String) - where headings are. defaults to `document`
 * - `menu` (String | Element) - where links are.
 * - `scrollParent` (String | Element) - where to listen for scroll events.
 * - `onupdate` (Function) - callback to invoke when links change.
 */

function Scrolltrack (options) {
  if (!(this instanceof Scrolltrack)) return new Scrolltrack(options)
  if (!options) options = {}

  this.selectors = options.selectors || 'h1, h2, h3, h4, h5, h6'
  this.parent = options.parent || document
  this.onupdate = options.onupdate || function () {}
  this.menu = options.menu || document
  this.scrollParent = options.scrollParent || document

  this.listener = debounce(this.onScroll, 20).bind(this)
  this.update = debounce(this._update, 20).bind(this)
  this.active = undefined
  this.index = []

  this.listen()
  this.update()
}

/**
 * Internal: Attaches event listeners.
 * No need to call this; the constructor already does this.
 */

Scrolltrack.prototype.listen = function () {
  q(this.scrollParent).addEventListener('scroll', this.listener)
  document.addEventListener('resize', this.update)
}

/**
 * Stops listening for events.
 */

Scrolltrack.prototype.destroy = function () {
  q(this.scrollParent).removeEventListener('scroll', this.listener)
  document.removeEventListener('resize', this.update)
}

/**
 * Internal: Updates the index of the headings and links.
 * Used by `update()`.
 */

Scrolltrack.prototype.reindex = function () {
  var headings = this.parent.querySelectorAll(this.selectors)
  var index = this.index = []
  var ids = {}

  var menu = q(this.menu)

  each(headings, function (heading) {
    var rect = heading.getBoundingClientRect()
    var id = heading.getAttribute('id')

    if (!ids[id]) ids[id] = 0
    else ids[id]++

    var links = menu.querySelectorAll('[href=' + JSON.stringify('#' + id) + ']')

    index.push({
      el: heading,
      id: id,
      link: links[ids[id]],
      top: rect.top + scrollTop()
    })
  })

  this.metrics = {
    windowHeight: window.innerHeight,
    documentHeight: documentHeight()
  }
}

/**
 * update : update()
 * Updates indices. Call this when the DOM changes.
 */

Scrolltrack.prototype._update = function () {
  this.reindex()
  this.onScroll()
}

/**
 * Internal: check for updates when scrolling. This is attached to the
 * document's scroll event.
 */

Scrolltrack.prototype.onScroll = function () {
  var y = this.scrollTop()
  var active

  each(this.index, function (heading) {
    if (heading.top < y) active = heading
  })

  if (active !== this.active) {
    var last = this.active
    this.active = active
    this.follow(active, last)
    this.onupdate(active, last)
  }
}

/**
 * Returns the scroll position. This also takes care of scaling it to go all
 * the way to the bottom.
 */

Scrolltrack.prototype.scrollTop = function () {
  var y = scrollTop()
  var offset = 0

  if (this.metrics) {
    var percent = y /
      (this.metrics.documentHeight - this.metrics.windowHeight)
    offset = Math.pow(percent, 3) * this.metrics.windowHeight
  }

  return y + offset
}


/**
 * Updates the selected link.
 */

Scrolltrack.prototype.follow = function (heading, last) {
  if (last && last.link) {
    toggleClass(last.link, '-active', false)
  }

  if (heading && heading.link) {
    toggleClass(heading.link, '-active', true)
  }
}

function q (el) {
  if (typeof el === 'string') return document.querySelector(el)
  else if (typeof el === 'object' && el[0]) return el[0]
  else return el
}

module.exports = Scrolltrack
