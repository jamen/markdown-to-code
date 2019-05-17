#!/usr/bin/env node

const { createReadStream, createWriteStream } = require('fs')
const markdownCode = require('./markdown-to-code.js')

let argv = process.argv.slice(2)
let all = false
let mode = 'typical-blocks'
let input = null
let output = null

for (let i = 0; argv.length > i; i++) {
    let item = argv[i]
    if (item === '--all') {
        all = true
    } else if (item === '--mode') {
        mode = argv[++i]
    } else if (!input && item !== '-') {
        input = createReadStream(item)
    } else if (!output && item !== '-') {
        output = createReadStream(item)
    } else {
        throw new Error('Unknown input ' + item)
    }
}

if (!input) input = process.stdin
if (!output) output = process.stdout

markdownCode({ input, output, mode, all })