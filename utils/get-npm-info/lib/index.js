'use strict';

const axios = require('axios')
const urlJoin = require('url-join')
const semver = require('semver')

function getNpmInfo(npmName, registry) {
  if(!npmName) {
    return
  }
  const registryUrl = registry || getDefaultRegistry()
  const npmInfoUrl = urlJoin(registryUrl, npmName)
  return axios.get(npmInfoUrl).then(res => {
    if(res.status === 200) {
      return res.data
    }
    return null
  }).catch(err => {
    return Promise.reject(err)
  })
}

function getDefaultRegistry(isOriginal = false) {
  return isOriginal ? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org'
}

async function getNpmVersions(npm, registry) {
  const data = await getNpmInfo(npm, registry)
  if(data) {
    return Object.keys(data.versions)
  }else {
    return []
  }
}

function getSemanticVersion(baseVersion, versions) {
  return versions = versions.filter(version => {
    return semver.satisfies(version, `^${baseVersion}`)
  }).sort((a, b) => {
    return semver.gt(b, a)
  })
}

async function getNpmSemanticVersion(baseVersion, npmName, registry) {
  const versions = await getNpmVersions(npmName, registry)
  const newVersions =  getSemanticVersion(baseVersion, versions)
  if(newVersions && newVersions.length > 0) {
    return newVersions[0]
  }
  return null
}

async function getNpmLatestVersion(npmName, registry) {
  let versions = await getNpmVersions(npmName, registry)
  if(versions) {
    return versions.sort((a, b) => {
      return semver.gt(b, a)
    })[0]
  }
  return null
}

module.exports = {
  getNpmInfo,
  getNpmVersions,
  getNpmSemanticVersion,
  getDefaultRegistry,
  getNpmLatestVersion
};
