'use strict';

const path = require('path')
const pkgDir = require('pkg-dir').sync
const npminstall = require('npminstall')
const pathExists = require('path-exists').sync
const formatPath = require('@moleculeblock/cli-format-path')
const {isObject} = require('@moleculeblock/cli-utils')
const {getDefaultRegistry, getNpmLatestVersion} = require('@moleculeblock/cli-get-npm-info')

class Package {
  constructor(options) {
    if(!options) {
      throw new Error('Package类的options参数不能为空')
    }
    if(!isObject(options)) {
      throw new Error('Package类的options参数必须为对象')
    }
    // package目标路径
    this.targetPath = options.targetPath
    this.storeDir = options.storeDir
    // package name
    this.packageName = options.packageName
    // package version
    this.packageVersion = options.packageVersion
    // package缓存目录前缀
    this.cacheFilePathPrefix = this.packageName.replace('/', '_')
  }

  async prepare() {
    if(this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatestVersion(this.packageName)
    }
  }

  get cacheFilePath() {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`)
  }

  // 判断当前Package是否存在
  async exists() {
    if(this.storeDir) {
      await this.prepare()
      console.log(this.cacheFilePath)
      return pathExists(this.cacheFilePath)
    }else {
      return pathExists(this.targetPath)
    }
  }

  // 安装Package
  async install() {
    await this.prepare()
    return npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [
        {
          name: this.packageName,
          version: this.packageVersion
        }
      ]
    })
  }

  // 更新Package
  update() {}

  // 获取入口文件路径
  getRootFilePath() {
    // 获取package.json所在目录
    const dir = pkgDir(this.targetPath)
    if(dir) {
      // 读取package.json
      const pkgFile = require(path.resolve(dir, 'package.json'))
      // 获取main路径对应js
      if(pkgFile && pkgFile.main) {
        return formatPath(path.resolve(dir, pkgFile.main))
      }
    }
    return null
  }
}

module.exports = Package;
