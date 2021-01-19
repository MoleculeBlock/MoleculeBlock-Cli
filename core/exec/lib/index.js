'use strict';

const path = require('path')
const cp = require('child_process')
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
      const arg = args
      const cmd = arg[arg.length - 1]
      const o = Object.create(null)
      Object.keys(cmd).forEach(key => {
        if(cmd.hasOwnProperty(key) && !key.startsWith('_') && key !== 'parent') {
          o[key] = cmd[key]
        }
      })
      arg[arg.length - 1] = o
      // require(rootFile)(...args)
      const code = `require('${rootFile}')(${JSON.stringify(arg)})`
      const child = spawn('node', ['-e', code], {
        cwd: process.cwd(),
        stdio: 'inherit'
      })
      child.on('error', e => {
        log.error(e.message)
        process.exit(1)
      })
      child.on('exit', e => {
        log.verbose('命令执行成功：' + e)
        process.exit(e)
      })
    } catch (e) {
      log.error(e.message)
    }
  }
}

function spawn(command, args, options) {
  const win32 = process.platform === 'win32'

  const cmd = win32 ? 'cmd' : command

  const cmdArgs = win32 ? ['/c'].concat(command, args) : args

  return cp.spawn(cmd, cmdArgs, options || {})
}

module.exports = exec;