const tty = require('node:tty');

const isDisabled = 'NO_COLOR' in process.env;
const isForced = 'FORCE_COLOR' in process.env;
const isWindows = process.platform === 'win32';
const isCompatibleTerminal = tty && tty.isatty(1) && process.env.TERM && process.env.TERM !== 'dumb';
const isCI = 'CI' in process.env && ('GITHUB_ACTIONS' in process.env || 'GITLAB_CI' in process.env || 'CIRCLECI' in process.env);
const isColorSupported = !isDisabled && (isForced || isWindows || isCompatibleTerminal || isCI);

const colorCodes = {
  greenStart: '\x1b[32m',
  greenEnd: '\x1b[39m',

  redStart: '\x1b[31m',
  redEnd: '\x1b[39m',
};

function colorize(string, start, end) {
  return typeof string === 'string' ? `${start}${string}${end}` : string;
}

module.exports = class Logger {
  constructor({ isVerbose = false, isColorEnabled = true }) {
    this.isVerbose = isVerbose;
    this.isColorEnabled = isColorSupported && isColorEnabled;
  }

  newline() {
    console.log();
  }

  verboseNewline() {
    if (!this.isVerbose) return;
    console.log();
  }

  info(...args) {
    console.log(...args);
  }

  verboseInfo(...args) {
    if (!this.isVerbose) return;
    console.log(...args);
  }

  noVerboseInfo(...args) {
    if (this.isVerbose) return;
    console.log(...args);
  }

  success(...args) {
    if (this.isColorEnabled) {
      args = args.map(arg => colorize(arg, colorCodes.greenStart, colorCodes.greenEnd));
    }

    console.log(...args);
  }

  error(...args) {
    if (this.isColorEnabled) {
      args = args.map(arg => colorize(arg, colorCodes.redStart, colorCodes.redEnd));
    }

    console.error(...args);
  }

  verboseError(...args) {
    if (!this.isVerbose) return;
    this.error(...args);
  }

  noVerboseError(...args) {
    if (this.isVerbose) return;
    this.error(...args);
  }
};
