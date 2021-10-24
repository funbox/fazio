#!/usr/bin/env node

const { program } = require('commander');
const fazio = require('.');

program
  .version(require('./package.json').version, '-v, --version')
  .description(`A tool for sneaking around your filesystem to find the installed npm deps you asking for.

Examples:
  $ fazio -p 'ua-parser-js@0.7.29||0.8.0||1.0.0' -d ~/projects ~/work
  $ fazio -p 'browser-sync' 'chokidar@2' -d ~/projects --no-global-check`);

program
  .option('-p, --package <packages...>', `a package (or packages) to look for (required)
available formats: \`package-name\`, \`package-name@semver-expression\``)
  .option('-d, --directory <dirs...>', 'a directory (or directories) to look in (required when --no-global-check is passed)')
  .option('--no-global-check', 'skip check for globally installed packages')
  .option('--verbose', 'log more than usual')
  .option('--no-color', 'disable colors')
  .parse(process.argv);

fazio(program.opts());
