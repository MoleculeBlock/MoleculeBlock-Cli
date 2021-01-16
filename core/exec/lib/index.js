'use strict';

const Package = require('@moleculeblock/cli-package')
const log = require('@moleculeblock/cli-log')

const SETTINGS = {
  init: '@moleclueblock/cli-init'
}

function exec(...args) {
  console.log(process.env.CLI_TARGET_PATH)
  const targetPath = process.env.CLI_TARGET_PATH
  const homePath = process.env.CLI_HOME_PATH
  log.verbose('targetPath', targetPath)
  log.verbose('homePath', homePath)
  // console.log(...args)
  const [projectName, cmdObj] = args
  const cmdName = cmdObj.name()
  const packageName = SETTINGS[cmdName]
  const packageVersion = 'latest'

  const pkg = new Package({
    targetPath,
    packageName,
    packageVersion
  })
  console.log(pkg)
}

module.exports = exec;