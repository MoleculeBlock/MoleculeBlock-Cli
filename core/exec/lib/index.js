'use strict';

const Package = require('@moleculeblock/cli-package')

function exec() {
  const pkg = new Package()
  console.log(pkg)
  console.log(process.env.CLI_TARGET_PATH)
}

module.exports = exec;