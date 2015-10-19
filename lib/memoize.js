'use strict'

let cache = {}

function memoize (keyObject, fn) {
  const key = JSON.stringify(keyObject)
  if (cache[key]) return cache[key]
  cache[key] = fn()
  return cache[key]
}

// Ensure that the last X keys are always available
memoize.keepKeys = 20

// Truncate every now and then
memoize.truncateInterval = 3 * 60 * 1000

// truncate the cache to the last N keys used
memoize.prune = function prune () {
  const keys = Object.keys(cache)
  const preserved = keys.slice(keys.length - memoize.keepKeys)
  const newCache = {}

  preserved.forEach((key) => {
    newCache[key] = cache[key]
  })

  cache = newCache
}

// truncate every few minutes
memoize.timer = setInterval(memoize.prune, memoize.truncateInterval)

module.exports = memoize
