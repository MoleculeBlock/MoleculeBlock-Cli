'use strict';

module.exports = index;

const path = require('path')
const log = require('@moleculeblock/cli-log');
const semver = require('semver')
const colors = require('colors/safe')
const userHome = require('user-home')
const pathExists = require('path-exists').sync
const commander = require('commander')
const pkg = require('../package.json')
const { LOWEST_NODE_VERSION, DEFAULT_CLI_HOME } = require('./const');

let args

const  program = new commander.Command()

async function index() {
  try {
    checkPkgVersion()
    checkNodeVersion()
    checkRoot()
    checkUserHome()
    // checkInputArgs()
    checkEnv()
    await checkGlobalUpdate()
    registerCommand()
  } catch (e) {
    log.error(e.message)
  }
}

function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', '是否开启调试模式', false)

  program.on('option:debug', () => {
    if(program.debug) {
      process.env.LOG_LEVEL = 'verbose'
    } else {
      process.env.LOG_LEVEL = 'info'
    }
    log.level = process.env.LOG_LEVEL
  })

  program.on('command:*', (obj) => {
    const availableCommands = program.commands.map(cmd => cmd.name())
    console.log(colors.red('未知的命令: ' + obj[0]))
    if(availableCommands.length > 0) {
      console.log(colors.red('可用命令: ' + availableCommands.join(',')))
    }
  })

  program.parse(process.argv)

  if(program.args && program.args.length < 1) {
    program.outputHelp()
    console.log()
  }
}

async function checkGlobalUpdate() {
  const currentNpmVersion = pkg.version
  const npmName = pkg.name
  const {getNpmSemanticVersion} = require('@moleculeblock/cli-get-npm-info')
  const lastVersions = await getNpmSemanticVersion(currentNpmVersion,npmName)
  if(lastVersions && semver.gt(lastVersions, currentNpmVersion)) {
    log.warn('更新提示' ,colors.yellow(`当前版本: ${currentNpmVersion} 最新版本: ${lastVersions}, 请手动更新 ${npmName}
              更新命令: npm install -g ${npmName}`))
  }
}

function checkEnv() {
  const dotenv = require('dotenv')
  const dotenvPath = path.resolve(userHome, '.env')
  if(pathExists(dotenvPath)) {
    dotenv.config({
      path: dotenvPath
    })
  }
  createDefaultConfig()
  log.verbose('环境变量', process.env.CLI_HOME_PATH)
}

function createDefaultConfig() {
  const cliConfig = {
    home: userHome
  }
  if(process.env.CLI_HOME) {
    cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME)
  } else {
    cliConfig['cliHome'] = path.join(userHome, DEFAULT_CLI_HOME)
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome
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