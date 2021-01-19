'use strict';

module.exports = index;

const path = require('path')
const semver = require('semver')
const colors = require('colors/safe')
const userHome = require('user-home')
const pathExists = require('path-exists').sync
const commander = require('commander')
const log = require('@moleculeblock/cli-log');
const init = require('@moleculeblock/cli-init')
const exec = require('@moleculeblock/cli-exec')
const pkg = require('../package.json')

const { DEFAULT_CLI_HOME } = require('./const');

let args

const  program = new commander.Command()

async function index() {
  try {
    await prepare()
    registerCommand()
  } catch (e) {
    log.error(e.message)
    if(program.debug) {
      console.log(e)
    }
  }
}

function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', '是否开启调试模式', false)
    .option('-tp, --targetPath <targetPath>', '是否指定本地调试文件路径', '')

  program
    .command('init [projectName]')
    .option('-f, --force', '是否强制初始化项目')
    .action(exec)

  // 开启debug模式
  program.on('option:debug', () => {
    if(program.debug) {
      process.env.LOG_LEVEL = 'verbose'
    } else {
      process.env.LOG_LEVEL = 'info'
    }
    log.level = process.env.LOG_LEVEL
  })

  program.on('option:targetPath', () => {
    process.env.CLI_TARGET_PATH = program.targetPath
  })

  // 未知命令匹配
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

async function prepare() {
  checkPkgVersion()
    checkRoot()
    checkUserHome()
    checkEnv()
    await checkGlobalUpdate()
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