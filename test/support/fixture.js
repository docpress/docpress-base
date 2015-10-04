module.exports = fixture

function fixture (path) {
  return require('path').join(__dirname, '../../fixture', path)
}

fixture.file = function fixtureFile (path) {
  return require('fs').readFileSync(fixture(path), 'utf-8')
}
