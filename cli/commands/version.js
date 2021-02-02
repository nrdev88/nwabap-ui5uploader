"use strict";
const program = require('commander');
const clear = require('clear');
const figlet = require('figlet');
const colors = require('ansi-colors');
const packageJson = require('../../package.json');

function VersionCommand() {
    return program
        .command('version', null, { isDefault: true })
        .description('shows the current version')
        .action(function () {
            clear();
            console.log(
                colors.red(
                    figlet.textSync('NWABAP', { font: 'isometric3', horizontalLayout: 'full' })
                ),
                `${packageJson['version']}`
            );
        });
}

module.exports = VersionCommand;