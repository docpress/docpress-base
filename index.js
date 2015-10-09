'use strict'

const ware = require('ware')
const fs = require('fs')
const jade = require('jade')
const join = require('path').join
const assign = Object.assign

const buildJs = require('./lib/build_js')
const buildCss = require('./lib/build_css')
const hash = require('./lib/hash')

/**
 * Metalsmith middleware
 */

module.exports = function base (options) {
  var app = ware()
    .use(addJs)
    .use(addCss)
    .use(relayout)

  return function (files, ms, done) {
    app.run(files, ms, done)
  }
}

/**
 * Assets
 */

function addCss (files, ms, done) {
  if (files['assets/style.css']) return done()

  function getAssetFile (file) {
    return files[file] &&
      ms.path(ms.source(), ms.metadata().docs, file)
  }

  buildCss({
    before:
      getAssetFile('assets/variables.scss') ||
      getAssetFile('assets/variables.sass'),
    after:
      getAssetFile('assets/custom.scss') ||
      getAssetFile('assets/custom.sass')
  }, (err, contents) => {
    if (err) return done(err)
    delete files['assets/variables.scss']
    delete files['assets/variables.sass']
    delete files['assets/custom.scss']
    delete files['assets/custom.sass']
    files['assets/style.css'] = { contents }
    done()
  })
}

function addJs (files, ms, done) {
  buildJs((err, contents) => {
    if (err) return done(err)
    if (!files['assets/script.js']) {
      files['assets/script.js'] = { contents }
    } else {
      files['assets/script.js'].contents = contents + '\n' +
        files['assets/script.js'].contents
    }
    done()
  })
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
 * * `hash.style` — hash for style.css
 * * `hash.script` — hash for script.js
 *
 * `meta` typically has:
 *
 * * `github` (Optional)
 * * `docs`
 */

function relayout (files, ms, done) {
  const toc = JSON.parse(files['toc.json'].contents)
  const index = JSON.parse(files['index.json'].contents)
  const path = fs.readFileSync(join(__dirname, 'data/layout.jade'), 'utf-8')
  const layout = jade.compile(path)
  const meta = ms.metadata()

  eachCons(index, (_, fname, __, prevName, ___, nextName) => {
    if (!fname.match(/\.html$/)) return
    const file = files[fname]
    const base = Array(fname.split('/').length).join('../')

    file.contents = layout(assign({}, file, {
      base, toc, index, meta,
      prev: prevName && assign({}, index[prevName], { url: base + prevName }),
      next: nextName && assign({}, index[nextName], { url: base + nextName }),
      active: fname,
      hash: {
        style: hash(files['assets/style.css'].contents),
        script: hash(files['assets/script.js'].contents)
      }
    }))
  })

  done()
}

function eachCons (list, fn) {
  var keys = Object.keys(list)
  keys.forEach((key, idx) => {
    const prevKey = keys[idx - 1]
    const nextKey = keys[idx + 1]
    fn(list[key], key,
       prevKey && list[prevKey], prevKey,
       nextKey && list[nextKey], nextKey)
  })
}
