# fazio

[![npm](https://img.shields.io/npm/v/@funboxteam/fazio.svg)](https://www.npmjs.com/package/@funboxteam/fazio)

A tool for sneaking around your filesystem to find the installed npm deps you asking for.

## Rationale

[It happens](https://therecord.media/malware-found-in-npm-package-with-millions-of-weekly-downloads/) 
that popular npm packages are got compromised and you have to be sure that you don't have one installed
on your machine. Fazio does the job.

## Installation

```
$ npm install -g @funboxteam/fazio
```

## Usage

```
$ fazio -p 'ua-parser-js@0.7.29 || 0.8.0 || 1.0.0' -d ~
```

You may pass as many packages to search for, and as many directories to look through as you want using `-p` & `-d` flags:

```
$ fazio -p 'chokidar@2' -p 'fsevents@<2' -d ~/projects -d ~/work
```

By default Fazio also checks the globally installed deps. If you want to skip it, pass `--no-global-check` flag.

You can use the package via npx without installing the Fazio globally:

```
$ npx @funboxteam/fazio --package 'ua-parser-js@0.7.29 || 0.8.0 || 1.0.0' --directory ~ --verbose
npx: installed 5 in 0.908s
Directories to scan:
  /home/ai
  /home/ai/.nvm/versions/node/v14.18.0/lib

× /home/ai/freelance/important-project/node_modules/ua-parser-js@0.7.21
× /home/ai/work/homepage/node_modules/ua-parser-js@0.7.24
→ /home/ai/projects/sandbox/node_modules/ua-parser-js@0.7.29
× /home/ai/projects/igoradamenko.com/node_modules/ua-parser-js@0.7.23

1 package found.
3 packages omitted.
```

[![Sponsored by FunBox](https://funbox.ru/badges/sponsored_by_funbox_centered.svg)](https://funbox.ru)
