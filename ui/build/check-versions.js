'use strict'
const chalk = require('chalk')
const semver = require('semver')
const packageConfig = require('../package.json')
const shell = require('shelljs')

function exec (cmd) {
    try {
        return require('child_process').execSync(cmd).toString().trim();
    } catch (error) {
        console.error(chalk.red(`Error executing command: ${cmd}.`));
        process.exit(1);
    }
}

const versionRequirements = [
    {
        name: 'node',
        currentVersion: exec('node --version'),
        versionRequirement: packageConfig.engines.node
    }
]

if (shell.which('npm')){
    versionRequirements.push({
        name: 'npm',
        currentVersion: exec('npm --version'),
        versionRequirement: packageConfig.engines.npm
    })
}

module.exports = function (){
    const warnings = versionRequirements
        .filter(mod => !semver.satisfies(mod.currentVersion, mod.versionRequirement))
        .map(mod => `${mod.name}: ${chalk.red(mod.currentVersion)} should be ${chalk.green(mod.versionRequirement)}`);

    if (warnings.length > 0){
        console.log('')
        console.log(chalk.yellow('To use this template, you must update the following dependencies:'))
        console.log('')
        console.log(warnings.join('\n'))
    }

    console.log()
    process.exit(1)
}