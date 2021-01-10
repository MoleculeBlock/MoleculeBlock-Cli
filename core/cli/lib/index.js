'use strict';

module.exports = index;

const log = require('@moleculeblock/cli-log');
const semver = require('semver')
const colors = require('colors/safe')
const pkg = require('../package.json')
const { LOWEST_NODE_VERSION } = require('./const');


function index() {
  try {
    checkPkgVersion()
    checkNodeVersion()
  } catch (e) {
    log.error(e.message)
  }
}

function checkNodeVersion() {
  const currentVersion = process.version // 当前node版本号
  const lowestVersion = LOWEST_NODE_VERSION // 最低版本号
  
  if(!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(colors.red(`moleculeblock-cli 只支持 NodeJS v${lowestVersion} 以上版本`))
  }
}

function checkPkgVersion() {
  log.notice('cli', pkg.version)
}