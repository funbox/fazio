const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const semver = require('semver');

const Logger = require('./logger');

let log;
let accessErrorsOccurred;
let packagesFound;
let packagesOmitted;

module.exports = (options = {}) => {
  log = new Logger({ isVerbose: options.verbose, isColorEnabled: options.color });
  accessErrorsOccurred = false;
  packagesFound = 0;
  packagesOmitted = 0;

  options.directory = options.directory || [];
  const rawDirs = [...options.directory];

  if (options.globalCheck) {
    rawDirs.push(getGlobalPackagesDir());
  }

  const dirs = parseDirs(rawDirs);
  assertDirs(dirs);

  options.package = options.package || [];
  const packages = parsePackages(options.package);
  assertPackages(packages);

  const packagesNames = Object.keys(packages);

  log.verboseInfo('Directories to scan:');
  dirs.forEach(dir => log.verboseInfo(' ', dir.path));
  log.verboseNewline();

  dirs.forEach(dir => {
    findPackages(packages, packagesNames, dir);
  });

  if (packagesFound || packagesOmitted) {
    log.newline();
  }

  log.info(`${packagesFound || 'No'} ${packagesFound === 1 ? 'package' : 'packages'} found.`);
  log.verboseInfo(`${packagesOmitted || 'No'} ${packagesOmitted === 1 ? 'package' : 'packages'} omitted.`);

  if (accessErrorsOccurred) {
    log.noVerboseInfo('\n(Access errors occurred during the search. Rerun with `--verbose` to see them)');
  }
};

function parseDirs(rawDirs) {
  return rawDirs
    .map(rd => {
      const dirPath = path.normalize(rd);
      const dirName = dirPath.split(path.sep).pop();

      return {
        path: dirPath,
        name: dirName,
      };
    });
}

function assertDirs(dirs) {
  // reading dirs to check the access & existence
  let isFailed = false;

  if (dirs.length === 0) {
    isFailed = true;
    log.error('No directories to search through were passed.');
  }

  dirs.forEach(dir => {
    try {
      const result = tryReadDirPath(dir.path);
      isFailed = isFailed || !result;
    } catch (err) {
      isFailed = true;
    }
  });

  if (isFailed) {
    process.exit(1);
  }
}

function parsePackages(rawPackages) {
  return rawPackages.reduce((acc, rp) => {
    const [name, version = '*'] = rp.split('@').map(p => p.trim());

    if (acc[name]) {
      acc[name] += ` || ${version}`;
    } else {
      acc[name] = version;
    }

    return acc;
  }, {});
}

function assertPackages(packages) {
  let isFailed = false;

  if (Object.keys(packages).length === 0) {
    isFailed = true;
    log.error('No packages to search for were passed.');
  }

  Object.entries(packages).forEach(([k, v]) => {
    if (!semver.validRange(v)) {
      log.error(`${v} does not look like a valid version (passed for \`${k}\`)`);
      isFailed = true;
    }
  });

  if (isFailed) {
    process.exit(1);
  }
}

function findPackages(packages, packagesNames, dir) {
  packagesNames.forEach(pn => {
    if (dir.name === pn) {
      const version = getPackageVersion(dir.path);
      if (semver.satisfies(version, packages[pn])) {
        log.success(`→ ${dir.path}@${version}`);
        packagesFound += 1;
      } else {
        log.verboseInfo(`× ${dir.path}@${version}`);
        packagesOmitted += 1;
      }
    }
  });

  const dirStat = tryReadDirPath(dir.path);

  if (!dirStat) {
    // if null is returned it means that an error is occurred and handled
    // so just leave
    return;
  }

  const subdirs = dirStat
    .filter(ds => ds.isDirectory())
    .map(ds => ({
      path: path.join(dir.path, ds.name),
      name: ds.name,
    }));

  subdirs.forEach(sd => findPackages(packages, packagesNames, sd));
}

function getPackageVersion(dirPath) {
  try {
    // well, we do it because we have to
    // eslint-disable-next-line import/no-dynamic-require
    const { version } = require(path.join(dirPath, 'package.json'));
    return version;
  } catch (err) {
    log.verboseError('Unexpected error occurred during reading package.json:');
    log.verboseError(err);

    log.noVerboseError('Unexpected error occurred. Run with `--verbose` to get more info.');

    throw err;
  }
}

function getGlobalPackagesDir() {
  try {
    return execSync('npm list -g --depth=-1 2>/dev/null | head -1').toString().trim();
  } catch (err) {
    log.verboseError('Unexpected error occurred during getting global packages dir:');
    log.verboseError(err);

    log.noVerboseError('Unexpected error occurred. Run with `--verbose` to get more info.');

    throw err;
  }
}

function tryReadDirPath(dirPath) {
  try {
    return fs.readdirSync(dirPath, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') {
      log.verboseError(`\`${dirPath}\` directory does not exist.`);
      accessErrorsOccurred = true;
      return null;
    }

    if (err.code === 'EACCES') {
      log.verboseError(`Does not have rights to read \`${dirPath}\`.`);
      accessErrorsOccurred = true;
      return null;
    }

    log.verboseError('Unexpected error occurred during dir check:');
    log.verboseError(err);

    log.noVerboseError('Unexpected error occurred. Run with `--verbose` to get more info.');

    throw err;
  }
}
