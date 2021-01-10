'use strict';

module.exports = index;

const log = require('@moleculeblock/cli-log');
const semver = require('semver')
const colors = require('colors/safe')
const userHome = require('user-home')
const pathExists = require('path-exists').sync
const pkg = require('../package.json')
const { LOWEST_NODE_VERSION } = require('./const');

let args

function index() {
  try {
    checkPkgVersion()
    checkNodeVersion()
    checkRoot()
    checkUserHome()
    checkInputArgs()
    log.verbose('debug', 'test debug log')
  } catch (e) {
    log.error(e.message)
  }
}

function checkInputArgs() {
  const minimist = require('minimist')
  args = minimist(process.argv.slice(2))
  checkArgs(args)
}

function checkArgs() {
  if(args.debug) {
    process.env.LOG_LEVEL = 'verbose'
  } else {
    process.env.LOG_LEVEL = 'info'
  }
  log.level = process.env.LOG_LEVEL
}

function checkUserHome() {
  if(!userHome || !pathExists(userHome)) {
    throw new Error(colors.red('当前登录用户主目录不存在！'))
  }
}

function checkRoot() {
  const rootCheck = require('root-check')
  rootCheck()
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