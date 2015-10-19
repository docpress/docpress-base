'use strict'

const cache = {}

module.exports = function memoize (keyObject, fn) {
  const key = JSON.stringify(keyObject)
  if (cache[key]) return cache[key]
  cache[key] = fn()
  return cache[key]
}
