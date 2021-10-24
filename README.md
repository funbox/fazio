# fazio

[![npm](https://img.shields.io/npm/v/@funboxteam/fazio.svg)](https://www.npmjs.com/package/@funboxteam/fazio)

A tool for sneaking around your filesystem to find the installed npm deps you asking for.

## Rationale

[It happens](https://therecord.media/malware-found-in-npm-package-with-millions-of-weekly-downloads/) 
that popular npm packages are got compromised and you have to be sure that you don't have one installed
on your machine. Fazio does the job.

## Installation

```
$ npm install -g fazio
```

<!-- TODO: npx? -->

## Usage

```
$ fazio -p 'ua-parser-js@0.7.29 || 0.8.0 || 1.0.0' -d ~
```

You may pass as many packages to search for, and as many directories to look through as you want using `-p` & `-d` flags.

By default Fazio also checks the globally installed deps. If you want to skip it, pass `--no-global-check` flag.

[![Sponsored by FunBox](https://funbox.ru/badges/sponsored_by_funbox_centered.svg)](https://funbox.ru)
