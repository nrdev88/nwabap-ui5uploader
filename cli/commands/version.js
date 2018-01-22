"use strict";
const program = require('commander');
const clear = require('clear');
const figlet = require('figlet');
const colors = require('colors');
const packageJson = require('../../package.json');

// Add random colors
colors.randomcolors = function(str) {
    let exploded = str.split("");
    exploded = exploded.map((function(){
        const available = ['grey', 'yellow', 'red', 'green', 'blue', 'white']; return function(letter) { return letter === " " ? letter : colors[available[Math.round(Math.random() * (available.length - 1))]](letter); };
    })());
    return exploded.join("");
};

function VersionCommand () {
    return program
        .command('version', null, { isDefault: true })
        .description('shows the current version')
        .action(function(){
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