function lexer(string, getOne) {
    var tokens = []
    var breakIndex = 89
    var stack = []
    var origString = string
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
    var lastNode
    do {
        if (--breakIndex === 0) {
            break
        }
        var arr = getCloseTag(string)
        if (arr) { //处理关闭标签

            string = string.replace(arr[0], '')
            const node = stack.pop()
                //处理下面两种特殊情况：
                //1. option会自动移除元素节点，将它们的nodeValue组成新的文本节点
                //2. table会将没有被thead, tbody, tfoot包起来的tr或文本节点，收集到一个新的tbody元素中
            if (node.type === 'option') {
                node.children = [{
                    type: '#text',
                    nodeValue: getText(node)
                }]
            } else if (node.type === 'table') {
                insertTbody(node.children)
            }
            lastNode = null
            if (getOne && ret.length === 1 && !stack.length) {
                return [origString.slice(0, origString.length - string.length), ret[0]]
            }
            continue
        }

        var arr = getOpenTag(string)
        if (arr) {
            string = string.replace(arr[0], '')
            var node = arr[1]
            addNode(node)
            var selfClose = node.isVoidTag || specalTag[node.type]
            if (!selfClose) { //放到这里可以添加孩子
                stack.push(node)
            }
            if (getOne && selfClose && !stack.length) {
                return [origString.slice(0, origString.length - string.length), node]
            }
            lastNode = node
            continue
        }

        var text = ''
        do {
            //处理<div><<<<<<div>的情况
            const index = string.indexOf('<')
            if (index === 0) {
                text += string.slice(0, 1)
                string = string.slice(1)
            } else {
                break
            }
        } while (string.length);
        //处理<div>{aaa}</div>,<div>xxx{aaa}xxx</div>,<div>xxx</div>{aaa}sss的情况
        const index = string.indexOf('<')
        const bindex = string.indexOf('{')
        if (bindex !== -1) {
            if (index === -1 || bindex < index) {
                addText(lastNode, text, addNode)
                var arr = parseCode(string)
                if (arr) {
                    var node = arr[1]
                    addNode(node)
                    lastNode = false
                    string = string.replace(arr[0], '')
                }
            }
        } else {
            if (index === -1) {
                text = string
                addText(lastNode, text, addNode)
                string = ''
            } else {
                addText(lastNode, text + string.slice(0, index), addNode)
                string = string.slice(index)
            }
        }

    } while (string.length);
    return ret


}
var JSXParser = {
    parse: parse
}

function parse(string, one, skipEmptyText) {
    one = (one === void 666 || one === true)

    var ret = lexer(string, one)
    if (one) {
        return typeof ret[0] === 'string' ? ret[1] : ret[0]
    }
    return ret
}

function addText(lastNode, text, addNode) {
    if (/\S/.test(text)) {
        if (lastNode && lastNode.type === '#text') {
            lastNode.text += text
        } else {
            lastNode = {
                type: '#text',
                nodeValue: text
            }
            addNode(lastNode)
        }
    }
}
//lexer(str)

function oneObject(str) {
    var obj = {}
    str.split(",").forEach(_ => obj[_] = true)
    return obj
}
var voidTag = oneObject("area,base,basefont,br,col,frame,hr,img,input,link,meta,param,embed,command,keygen,source,track,wbr")
var specalTag = { xmp: 1, style: 1, script: 1, noscript: 1, textarea: 1 }
var hiddenTag = { style: 1, script: 1, noscript: 1, template: 1 }
    //它用于解析{}中的内容，如果遇到不匹配的}则返回
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
                        type: '#jsx',
                        nodeValue: string.slice(0, i)
                    }]
                }
            } else if (c === '[' || c === ']' || c === '(' || c === ')' || c === ',') {
                word = ''
            } else if (c === '<') {
                if (word === '' || word === 'return' || word.slice(-2) == '=>') {
                    if (/\<\w/.test(string.slice(i))) {
                        var arr = lexer(string.slice(1), true, true)
                        i += arr[0].length

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

function insertTbody(nodes) {
    var tbody = false
    for (var i = nodes.length - 1; i >= 0; i--) {
        var node = nodes[i]
        if (/^(tbody|thead|tfoot|#jsx)$/.test(node.type)) {
            tbody = false
            continue
        }
        if (!tbody) {
            tbody = {
                type: 'tbody',
                props: {},
                children: [node]
            }
            nodes.splice(i, 1)
            nodes.splice(i, 0, tbody)
        } else {
            nodes.splice(i, 1)
            tbody.children.unshift(node)
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
                type: tag
            }]
        }
    }
    return null
}

function getOpenTag(string) {
    if (string.indexOf("<") === 0) {
        var i = string.indexOf('<!--') //处理注释节点
        if (i === 0) {
            var l = string.indexOf('-->')
            if (l === -1) {
                thow('注释节点没有闭合 ' + string.slice(0, 100))
            }
            var node = {
                type: '#comment',
                nodeValue: string.slice(4, l)
            }

            return [string.slice(0, l + 3), node]
        }
        var match = string.match(/\<(\w[^\s\/\>]*)/) //处理元素节点
        if (match) {
            var leftContent = match[0],
                tag = match[1]
            var node = {
                type: tag,
                props: {},
                children: []
            }

            string = string.replace(leftContent, '') //去掉标签名(rightContent)
            var arr = getAttrs(string) //处理属性
            if (arr) {
                node.props = arr[1]
                string = string.replace(arr[0], '')
                leftContent += arr[0]
            }

            if (string[0] === '>') { //处理开标签的边界符
                leftContent += '>'
                string = string.slice(1)
                if (voidTag[node.type]) {
                    node.isVoidTag = true
                }
            } else if (string.slice(0, 2) === '/>') { //处理开标签的边界符
                leftContent += '/>'
                string = string.slice(2)
                node.isVoidTag = true
            } 

            if (!node.isVoidTag && specalTag[tag]) { //如果是script, style, xmp等元素
                var closeTag = '</' + tag + '>'
                var j = string.indexOf(closeTag)
                var nodeValue = string.slice(0, j)
                leftContent += nodeValue + closeTag
                node.children.push({
                    type: '#text',
                    nodeValue: nodeValue
                })
            }

            return [leftContent, node]
        }
    }
}

function getText(node) {
    var ret = ''
    node.children.forEach(function(el) {
        if (el.type === '#text') {
            ret += el.nodeValue
        } else if (el.children && !hiddenTag[el.type]) {
            ret += getText(el)
        }
    })
    return ret
}

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
                break
        }

    }

    throw '必须关闭标签'
}