'use strict';

module.exports = index;

const pkg = require('../package.json')
const log = require('@moleculeblock/cli-log')

function index() {
  checkPkgVersion()
}

function checkPkgVersion() {
  log.notice('cli', pkg.version)
}