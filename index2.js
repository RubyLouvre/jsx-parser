var str = `<div class="ddd" {ddd} id={dd}></div>`

function lexer(string, opts) {
    var tokens = []
    var breakIndex = 9
    var stack = []
    stack.last = function() {
        return stack[stack.length - 1]
    }
    var ret = []

    function addNode(node) {
        var p = stack.last()
        if (p && p.children) {
            p.children.push(node)
        } else {
            ret.push(node)
        }
    }

    do {
        if (--breakIndex === 0) {
            break
        }
        console.log(string)
        var arr = getCloseTag(string)
        if (arr) {
            console.log(arr)
            string = string.replace(arr[0], '')
            stack.pop()

            continue
        }
        var arr = getOpenTag(string)
        if (arr) {
            string = string.replace(arr[0], '')
            var node = arr[1]
            addNode(node)
            if (!node.isVoidTag) {
                stack.push(node)
            }
            continue
        }



    } while (string.length);

    console.log(ret)


}
lexer(str)

function parseCode(string) {
    var state = 'start',
        word = '',
        needReset = false,
        braceIndex = 1,
        quote

    for (var i = 0, n = string.length; i < n; i++) {
        var c = string[i]

        if (quote) {
            if (c === quote) {
                quote = ''
            }
        } else {
            if (c === '"' || c === "'") {
                word = ''
                quote = c
            } else if (c === '{') {
                word = ''
                braceIndex++
            } else if (c === '}') {
                word = ''
                braceIndex--
                if (braceIndex === 0) {
                    return [string.slice(0, i), {
                        type: 'jsx',
                        value: string.slice(0, i)
                    }]
                }
            } else if (c === '[' || c === ']' || c === '(' || c === ')' || c === ',') {
                word = ''
            } else if (c === '<') {
                if (word === '' || word === 'return' || word.slice(-2) == '=>') {
                    if (/\<\w/.test(string.slice(i))) {

                    }
                    ok = true
                }

            } else if (c !== '') {
                if (needReset) {
                    word = c
                    needReset = false
                } else {
                    word += c
                }
            } else if (c === ' ') {
                needReset = true
            }
        }
    }

}

function getCloseTag(string) {
    if (string.indexOf("</") === 0) {
        var match = string.match(/\<\/(\w+)>/)
        if (match) {
            var tag = match[1]
            string = string.slice(3 + tag.length)
            return [match[0], {
                type: 'closeTag',
                value: tag
            }]
        }
    }
    return null
}

function getOpenTag(string) {
    if (string.indexOf("<") === 0) {

        var i = str.indexOf('<!--') //处理注释节点
        if (i === 0) {
            var l = str.indexOf('-->')
            if (l === -1) {
                thow('注释节点没有闭合 ' + string.slice(0, 100))
            }

            var node = {
                type: '#comment',
                children: string.slice(4, i)
            }
            return [string.slice(0, i + 3), node]
        }
        var match = string.match(/\<(\w[^\s\/\>]*)/)
        if (match) {
            var left = match[0]
            var node = {
                type: match[1],
                props: {},
                children: []
            }

            //处理属性
            var arr = getAttrs(string.replace(left, ''))
            if (arr) {
                node.props = arr[1]
                left += arr[0]
            }

            var right = string.replace(left, '')
            if (right[0] === '>') {
                left += '>'
            } else if (right.slice(0, 2) === '/>') {
                left += '/>'
                node.isVoidTag = true
            }

            return [left, node]
        }
    }
}
var breakAttr = 0

function getAttrs(string) {
    var state = 'AttrNameOrJSX',
        attrName = '',
        attrValue = '',
        quote,
        props = {}

    for (var i = 0, n = string.length; i < n; i++) {
        var c = string[i]
        switch (state) {
            case 'AttrNameOrJSX':
                if (c === '/' || c === '>') {
                    console.log(string.slice(0, i))
                    return [string.slice(0, i), props]
                }
                if (c === ' ') {
                    if (attrName) {
                        state = 'AttrEqual'
                    }
                } else if (c === '=') {
                    if (!attrName) {
                        throw '必须指定属性名'
                    }
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
                    props[attrName] = attrValue
                    attrName = attrValue = ''
                    state = 'AttrNameOrJSX'
                }
                break
            case 'SpreadJSX':
            case 'JSX':

                var arr = parseCode(string.slice(i), true)
                i += arr[0].length
                if (state === 'SpreadJSX') {
                    props['SpreadJSX'] = arr[1]
                } else {
                    props[attrName] = arr[1]
                }
                attrName = attrValue = ''
                state = 'AttrNameOrJSX'
                console.log(props)

                break

        }

    }

    throw '必须关闭标签'
}