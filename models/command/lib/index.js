'use strict';

const semver = require('semver')
const colors = require('colors/safe')
const log = require('@moleculeblock/cli-log');

const LOWEST_NODE_VERSION = '12.0.0'

class Command {
  constructor(argv) {
    if(!argv.length) {
      throw new Error('参数不能为空！')
    }
    if(!Array.isArray(argv)) {
      throw new Error('参数必须为数组！')
    }
    this._argv = argv
    // console.log(this._argv, 123)
    let runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve()
      chain = chain.then(() => this.checkNodeVersion())
      chain = chain.then(() => this.initArgs())
      chain = chain.then(() => this.init())
      chain = chain.then(() => this.exec())
      chain.catch(err => {
        log.error(err.message)
      })
    })
  }
  initArgs() {
    this._cmd = this._argv[this._argv.length - 1]
    this._argv = this._argv.slice(0, this._argv.length - 1)
  }
  // 检查node版本
  checkNodeVersion() {
    const currentVersion = process.version // 当前node版本号
    const lowestVersion = LOWEST_NODE_VERSION // 最低版本号
    
    if(!semver.gte(currentVersion, lowestVersion)) {
      throw new Error(colors.red(`moleculeblock-cli 只支持 NodeJS v${lowestVersion} 以上版本`))
    }
  }
  init() {
    throw new Error('init 必须实现')
  }

  exec() {
    throw new Error('exec 必须实现')
  }
}

module.exports = Command;
