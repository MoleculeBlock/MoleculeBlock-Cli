'use strict';

const Command = require('@moleculeblock/cli-command')
const log = require('@moleculeblock/cli-log')

class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || ''
    this.force = !!this._cmd.force
    log.verbose('projectName', this.projectName)
    log.verbose('force', this.force)
  }
  exec() {
    console.log('init 业务逻辑')
  }
}

function init(argv) {
  // console.log('init', projectName, cmdObj.force, process.env.CLI_TARGET_PATH)
  return new InitCommand(argv)
}

module.exports = init

module.exports.InitCommand = InitCommand