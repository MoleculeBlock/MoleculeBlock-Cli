'use strict';

const log = require('npmlog')

log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info'

log.heading = 'moleculeblock' // 添加前缀

log.headingStyle = {
  fg: 'red',
  bg: 'white'
}

log.addLevel('success', 2000, {
  fg: 'green',
  bold: true
}) // 自定义命令

module.exports = log