'use strict';

const path = require('path')
const pkgDir = require('pkg-dir').sync
const npminstall = require('npminstall')
const pathExists = require('path-exists').sync
const fse = require('fs-extra')
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
    if(this.storeDir && !pathExists(this.storeDir)) {
      fse.mkdirpSync(this.storeDir)
    }
    if(this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatestVersion(this.packageName)
    }
  }

  get cacheFilePath() {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`)
  }

  getSpecificCacheFilePaht(packageVersion,) {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`)
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
  async update() {
    await this.prepare()
    // 获取npm包最新版本号
    const latestPackageVersion = await getNpmLatestVersion(this.packageName)
    // 查询最新版本号对应的路径是否存在
    const latesFilePath = this.getSpecificCacheFilePaht(latestPackageVersion)
    // 如果不存在, 这安装最新版本
    if(!pathExists(latesFilePath)) {
      await npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [
          {
            name: this.packageName,
            version: latestPackageVersion
          }
        ]
      })
      this.packageVersion = latestPackageVersion
    }
  }

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
