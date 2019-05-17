const modes = {
    'typical-blocks': {
        opener: '/**',
        normal: ' * ',
        closer: ' **/'
    },
    'typical-lines': {
        opener: '',
        normal: '// ',
        closer: ''
    },
    'hash-lines': {
        opener: '',
        normal: '# ',
        closer: ''
    },
    'semicolon-lines': {
        opener: '',
        normal: ';; ',
        closer: ''
    },
    'html-lines': {
        opener: '<!--',
        normal: '  --',
        closer: '  -->'
    }
}

function markdownToCode (options = {}) {
    let { input, output, mode, all } = options

    if (typeof mode === 'string') {
        mode = modes[mode]
    }

    if (!mode || !mode.normal) {
        throw new Error('An invalid mode was give (or none).')
    }

    // Compiler state
    let insideBlock = false
    let shouldCollapse = true
    let nextBlockValid = all
    let firstWrite = true

    input.on('data', (buffer) => {
        let lines = String(buffer).split('\n')

        for (let line of lines) {
            let { opener, normal, closer } = mode
            let normalLine = line.trim()

            if (!insideBlock && /^<!--.*export.*-->/i.test(normalLine)) {
                nextBlockValid = !nextBlockValid
                continue
            }

            if (firstWrite) {
                if (opener) {
                    output.write(opener + '\n')
                }

                firstWrite = false
            }

            // console.log(1, line)
            let languageMatch = /```([a-z]+)/i.exec(line)
            let pointOpen = languageMatch ? languageMatch.index : -1
            let pointClose = line.indexOf('```')
            let lineSufficient = sufficient(line)

            // Matched a block opener, write the transition on compiler
            if (
                pointOpen !== -1 &&
                !insideBlock &&
                nextBlockValid
            ) {
                let before = line.slice(0, pointOpen)
                let after = line.slice(pointOpen + opener.length + languageMatch[1].length, line.length)

                if (!sufficient(before)) before = ''
                if (!sufficient(after)) after = ''

                if (before) {
                    output.write(`${normal}${before}\n${closer}\n\n${after}`)
                } else {
                    output.write(`${closer}\n\n${after}`)
                }

                insideBlock = true
                shouldCollapse = true

                continue // skip writing markdown codeblock line to compiler
            }

            if (pointClose !== -1) {
                if (insideBlock) {
                    let before = line.slice(0, pointClose)
                    let after = line.slice(pointClose + closer.length, line.length)

                    if (!sufficient(before)) before = ''
                    if (!sufficient(after)) after = ''

                    if (after) {
                        output.write(`${before}\n${opener}\n${normal}${after}`)
                    } else {
                        output.write(`${before}\n${opener}\n`)
                    }

                    insideBlock = false
                    shouldCollapse = true

                    continue // skip writing markdown codeblock line to compiler
                }

                nextBlockValid = all
            }

            if (insideBlock && nextBlockValid) {
                output.write(line + '\n')
            } else if (lineSufficient || !shouldCollapse) {
                output.write(normal + line + '\n')
            }

            if (lineSufficient && shouldCollapse) {
                shouldCollapse = false
            }
        }
    })

    input.on('end', () => {
        if (mode.closer) {
            output.write(mode.closer)
        }
    })
}

function sufficient (s) {
    return s.replace(/\s/g, '')
}

module.exports = markdownToCode