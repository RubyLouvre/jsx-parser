var str = `<div {ddd} id={dd}></div>`

function lexer(html, opts) {
    let string = html
    let tokens = []
    var stopIndex = 999999
    while (string) {
        if (--stopIndex === 0) {
            break
        }
        if (string.indexOf("</") === 0) { //处理闭标签
            const match = string.match(REGEXP.endTag)
            if (!match)
                continue
            string = string.substring(match[0].length)
            tokens.push({
                tag: match[1],
                type: 'tag-end',
            })
            continue
        }

        if (string.indexOf("<") === 0) { //处理开标签
            if (string.indexOf('<!--') === 0) { //处理注释标签
                const i = string.indexOf('-->', 4)
                if (i === -1) {
                    throw '注释节点没有闭合'
                }
                tokens.push({
                    tag: '#comment',
                    type: 'tag-empty',
                    text: string.slice(4, i)
                })
                string = string.slice(i + 3)
                continue
            }
            //<div id=''/> <p>
            const match = string.match(/<(\w[^\s\/\>]+)/)
            if (match) {
                const tag = match[1]

                string = string.slice(match[0].length)
                if (string.charAt(0) === '/' || string.charAt(0) == '>')
                    const attributes = getAttributes(match[2])
                        //   string = string.substring(match[0].length)
                if (TAG.special[tag]) {
                    var v = string.indexOf('</' + tag + '>')
                    tokens.push({
                        tag: tag,
                        type: 'tag-empty',
                        props: attributes,
                        children: [{
                            type: "#text",
                            text: string.slice(0, v)
                        }]
                    })
                    string = string.slice(v + 2 + tag.length + 1)
                    continue
                }

                const type = !!MAKER.empty[tag] || match[0].slice(-2) === '/>' ? 'tag-empty' : 'tag-start'
                tokens.push({
                    tag: tag,
                    type: type,
                    children: [],
                    props: attributes
                })
                continue
            }
        }
        var text = ''
        do {
            const index = string.indexOf('<')
            if (index === 0) {
                text += string.slice(0, 1)
                string = string.slice(1)
            } else if (index === -1) {
                text += string
                string = ''
                break
            } else {
                text += string.slice(0, index)
                string = string.slice(index)
                break
            }
        } while (string.length);
        if (opts.skipEmptyNode ? /\S/.test(text) : text) {
            var last = tokens[tokens.length - 1]
            if (last && last.type === 'text') {
                last.text += text
            } else {
                tokens.push({
                    type: "text",
                    text: text
                })
            }
        }
    }
    return tokens
}


function getCloseTag(string) {
    if (string.indexOf("</") === 0) {
        var match = string.match(/\<\/(\w+)>/)
        if (match) {
            var tag = match[1]
            string = string.slice(3 + tag.length)
            return [string, {
                type: 'closeTag',
                value: tag
            }]
        }
    }
    return null
}

function getOpenTag(string) {
    if (string.indexOf("<") === 0) {
        var match = string.match(/\<(\w[\s\/\>]*)/)
        if (match) {
            var tag = match[1]
            string = string.slice(1 + tag.length)
            var left = getAttr(string)


            return [string, {
                type: 'openTag',
                value: tag
            }]
        }
    }
}

function getAttrs(string) {
    var state = 'AttrNameOrJSX',
        attrName = '',
        attrValue = '',
        quote,
        attrs = {}
    breakLabel:
        for (var i = 0, n = string.length; i < n; i++) {
            var c = string[i]
            switch (state) {
                case 'AttrNameOrJSX':
                    if (c === '/' || c === '>') {
                        break breakLabel
                    }
                    if (c === ' ') {
                        if (attrName) {
                            state = 'AttrEqual'
                        }

                    } else if (c === '=') {
                        state = 'AttrQuoteOrJSX'
                    } else if (c === '{') {
                        state = 'SpreadJSX'
                    } else {
                        attrName += c
                    }
                    break
                case 'AttrEqual':
                    if (c === '=') {
                        state = 'AttrQuoteOrJSX'
                    }
                    break
                case 'AttrQuoteOrJSX':
                    if (c === '"' || c === "'") {
                        quote = c
                        state = 'AttrValue'
                    } else if (c === '{') {
                        state = 'JSX'
                    }
                    break
                case 'AttrValue':
                    if (c !== quote) {
                        attrValue += c
                    } else if (c === quote) {
                        attrs[attrName] = attrValue
                        attrName = ''
                        attrValue = ''
                        flag == 'AttrNameOrJSX'
                    }
                    break
                case 'SpreadJSX':
                case 'JSX':
                    var arr = parserJSX(string.slice(i), true)
                    i += attr[0].length + 1
                    if (state === 'SpreadJSX') {
                        props[SpreadJSX] = attr[1]
                    } else {
                        props[attrName] = attr[1]
                    }
                    break

            }

        }
    return [string.slice(0, i), {
        type: 'props',
        value: props
    }]
}