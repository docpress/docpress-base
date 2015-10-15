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

/**
 * Metalsmith middleware
 */

module.exports = function base (options) {
  const ctx = {
    styles: [],
    scripts: []
  }

  var app = ware()
    .use(addJs.bind(ctx))
    .use(addCss.bind(ctx))
    .use(addExternalCss.bind(ctx))
    .use(relayout.bind(ctx))

  return function (files, ms, done) {
    app.run(files, ms, done)
  }
}

/**
 * Assets
 */

function addCss (files, ms, done) {
  if (files['assets/style.css']) return done()

  // TODO: stylus import
  buildCss({}, (err, contents) => {
    if (err) return done(err)
    files['assets/style.css'] = { contents }
    this.styles.push('assets/style.css?t=' + hash(contents))
    done()
  })
}

/**
 * Add JavaScript
 */

function addJs (files, ms, done) {
  buildJs((err, contents) => {
    if (err) return done(err)
    if (!files['assets/script.js']) {
      files['assets/script.js'] = { contents }
    } else {
      files['assets/script.js'].contents = contents + '\n' +
        files['assets/script.js'].contents
    }
    this.scripts.push('assets/script.js?t=' +
      hash(files['assets/script.js'].contents))
    done()
  })
}

/**
 * Add external CSS
 */

function addExternalCss (files, ms, done) {
  const meta = ms.metadata()
  const externalCss = getCss(meta)
  // TODO: account for local styles
  this.styles = this.styles.concat(externalCss)
  done()
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

  const path = fs.readFileSync(join(__dirname, 'data/layout.jade'), 'utf-8')
  const layout = jade.compile(path, { pretty: true })
  const meta = ms.metadata()

  eachCons(index, (_, fname, __, prevName, ___, nextName) => {
    if (!fname.match(/\.html$/)) return
    const file = files[fname]
    const base = Array(fname.split('/').length).join('../')
    const styles = this.styles.map(relativize(base))
    const scripts = this.scripts.map(relativize(base))

    file.contents = layout(assign({}, file, {
      base, toc, index, meta, styles, scripts,
      prev: prevName && assign({}, index[prevName], { url: base + prevName }),
      next: nextName && assign({}, index[nextName], { url: base + nextName }),
      active: fname
    }))
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

function getCss (meta) {
  let css = meta.css
  if (!css) return []

  if (typeof css === 'string') css = [css]
  return css // TODO: add hashes if it's local
}
