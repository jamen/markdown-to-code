# @jamen/markdown-to-code

A [literate programming][1] tool using markdown and codeblocks.  It turns codeblocks into source code and the rest of the content into comments, allowing you to execute or analyze only the code.

## Install

```
npm i @jamen/markdown-to-code
```

Or quickly use command-line utility:

```sh
npx @jamen/markdown-to-code foo.md foo.js
```

## Usage

### `markdownCode(options?)`

Compiles an `input` stream with the given options, returns a readable stream.

```js
let compileMarkdown = markdownCode({
    language: 'js',
    mode: {
        opener: '/**',
        normal: ' * ',
        closer: ' **/'
    }
})

createReadStream('input.md')
.pipe(compileMarkdown)
.pipe(createWriteStream('output.js'))
```

### `markdown-to-code <input> <output>`

Command-line tool that compiles the input file to the output file. Uses stdio without files.

Use `--mode` or `-m` to set the commenting mode (see [lib/modes.json](lib/modes.json)).

To opt-in or opt-out of codeblocks turning into code, you use HTML comments above them containing the word "export".  By default this is an opt-in behavior, but you can use the `--all` or `-a` flag to make it opt-out (everything is exported)

[1]: https://en.wikipedia.org/wiki/Literate_programming