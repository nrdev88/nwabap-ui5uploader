"use strict";
const program = require('commander');

const Commands = require('./commands');

const bootstrap = () => {
    // Load all subcommands
    Commands.map(function(Cmd){
        Cmd();
    });

    // Fire commander
    program.parse(process.argv);
};

bootstrap();