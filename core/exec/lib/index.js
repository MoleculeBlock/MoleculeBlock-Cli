'use strict';

const path = require('path')
const Package = require('@moleculeblock/cli-package')
const log = require('@moleculeblock/cli-log')

const SETTINGS = {
  init: 'vue'
}

const CACHE_DIR = 'dependencies'

async function exec(...args) {
  let targetPath = process.env.CLI_TARGET_PATH
  let storeDir = ''
  let pkg
  const homePath = process.env.CLI_HOME_PATH
  log.verbose('targetPath', targetPath)
  log.verbose('homePath', homePath)

  const [projectName, cmdObj] = args
  const cmdName = cmdObj.name()
  const packageName = SETTINGS[cmdName]
  const packageVersion = 'latest'

  if(!targetPath) {
    // package缓存路径
    targetPath = path.resolve(homePath, CACHE_DIR)
    storeDir = path.resolve(targetPath, 'node_modules')
    log.verbose('targetPath', targetPath)
    log.verbose('storeDir', storeDir)
    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion
    })
    if(await pkg.exists()) {
      // 更新package
      await pkg.update()
    }else {
      // 安装package
      await pkg.install()
    }
  }else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion
    })
  }
  const rootFile = pkg.getRootFilePath()
  if(rootFile) {
    try {
      require(rootFile)(...args)
    } catch (e) {
      log.error(e.message)
    }
  }

}

module.exports = exec;