#!/usr/bin/env nodejs

const commandLine = require('commander');
const path = require('path');
const pkg = require('../package.json');
const twayback_player = require('../index');
const arg = process.argv;
const homedir = require('os').homedir();
const dayjs = require('dayjs');

// options
commandLine
    .version('twayback-player v' + pkg.version)
    .option('-p  --path <path>', 'full path to twayback folder results')
    .parse(arg)

const options = commandLine.opts();

if (options.path) {
    twayback_player.init(options.path)
} else {
    console.log('missing argument.')
    commandLine.help()
    process.exit;
}