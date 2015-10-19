'use strict'

const ware = require('ware')
const fs = require('fs')
const jade = require('jade')
const join = require('path').join
const assign = Object.assign

const buildJs = require('./lib/build_js')
const buildCss = require('./lib/build_css')
const hash = require('./lib/hash')
const eachCons = require('./lib/helpers/each_cons')
const toArray = require('./lib/helpers/to_array')
const memoize = require('./lib/memoize')
const useCache = require('./lib/helpers/use_cache')

/**
 * Metalsmith middleware
 */

module.exports = function base (options) {
  const ctx = {}

  var app = ware()
    .use(reset.bind(ctx))
    .use(sortCss.bind(ctx))
    .use(addJs.bind(ctx))
    .use(addCss.bind(ctx))
    .use(relayout.bind(ctx))

  return function (files, ms, done) {
    app.run(files, ms, done)
  }
}

function reset (files, ms, done) {
  this.styles = []
  this.scripts = []
  this.stylusImports = []
  done()
}

/*
 * Sorts out CSS into `styles` (local/external styles) and `stylusImports`
 */

function sortCss (files, ms, done) {
  const list = toArray(ms.metadata().css)
  const sources = files['_docpress.json'].sources

  list.forEach((item) => {
    if (item.match(/\.styl$/)) {
      const path = join(ms.source(), item)
      this.stylusImports.push(path)
    } else if (item.match(/^https?:\/\//)) {
      this.styles.push(item)
    } else {
      const local = sources[item]
      if (!local) throw new Error(`css: can't find '#{item}'`)
      this.styles.push(local)
    }
  })

  done()
}

/**
 * Assets
 */

function addCss (files, ms, done) {
  const callback = (err, contents) => {
    if (err) return done(err)
    files['assets/style.css'] = { contents }
    this.styles.unshift('assets/style.css?t=' + hash(contents))
    done()
  }

  const cacheable = (this.stylusImports.length === 0)

  ;(cacheable && useCache('cache/style.css', callback)) ||
    buildCss({ imports: this.stylusImports }, callback)
}

/**
 * Add JavaScript
 */

function addJs (files, ms, done) {
  const callback = (err, contents) => {
    if (err) return done(err)
    files['assets/script.js'] = { contents }
    this.scripts.push('assets/script.js?t=' +
      hash(files['assets/script.js'].contents))
    done()
  }

  useCache('cache/script.js', callback) ||
    buildJs({}, callback)
}

/**
 * Layout jade.
 * Passes these template options:
 *
 * * `base` — prefix.
 * * `toc` — the table of contents, as per toc.json.
 * * `index` — the index, as per index.json.
 * * `meta` — metalsmith metadata.
 * * `prev.title` — previous page title.
 * * `prev.url` — previous page url.
 * * `next.title` — next page title.
 * * `next.url` — next page url.
 * * `active` — the filename of the active file (eg, `foo/index.html`)
 * * `styles` — array of CSS files
 * * `scripts` — array of JavaScript files
 *
 * `meta` typically has:
 *
 * * `github` (Optional)
 * * `docs`
 */

function relayout (files, ms, done) {
  const toc = files['_docpress.json'].toc
  const index = files['_docpress.json'].index
  const meta = ms.metadata()

  const jadeData = fs.readFileSync(join(__dirname, 'data/layout.jade'), 'utf-8')
  const layout = memoize(['jade', jadeData], () => {
    return jade.compile(jadeData, { pretty: true })
  })

  eachCons(index, (_, fname, __, prevName, ___, nextName) => {
    if (!fname.match(/\.html$/)) return
    const file = files[fname]
    const base = Array(fname.split('/').length).join('../')
    const styles = this.styles.map(relativize(base))
    const scripts = this.scripts.map(relativize(base))

    const locals = {
      base, toc, index, meta, styles, scripts,
      prev: prevName && assign({}, index[prevName], { url: base + prevName }),
      next: nextName && assign({}, index[nextName], { url: base + nextName }),
      active: fname
    }

    const key = [ jadeData, locals, file ]

    file.contents = memoize(['jadedata', key], () => {
      return layout(assign({}, file, locals))
    })
  })

  done()
}

function relativize (base) {
  return function (url) {
    if (url.substr(0, 1) === '/' || url.match(/^https?:\/\//)) {
      return url
    }

    return base + url
  }
}
