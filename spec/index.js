describe("jsx parser", function() {
    var parse = function(a, f) {
        return (new JSXParser(a, f)).parse()
    }
    describe("简单的类型", function() {
        it('test', function() {
            expect(parse('<div></div>')).toEqual({
                type: 'div',
                props: {},
                children: []
            })
            expect(parse('xxx')).toEqual({
                type: '#text',
                nodeValue: 'xxx'
            })
            expect(parse('<!--ccc-->')).toEqual({
                type: '#comment',
                nodeValue: 'ccc'
            })
            expect(parse('xxxx<br>', false)).toEqual([{
                    type: '#text',
                    nodeValue: 'xxxx'
                },
                {
                    type: 'br',
                    isVoidTag: true,
                    children: [],
                    props: {}
                }
            ])
        })
    })
    describe("文本节点中的JSX", function() {
        it("test", function() {

            expect(parse('<div >{111}</div>')).toEqual({
                type: 'div',
                props: {},
                children: [{
                    type: '#jsx',
                    nodeValue: '111'
                }]
            })
            expect(parse('<div >xxx{111}xxx{222}</div>')).toEqual({
                type: 'div',
                props: {},
                children: [{
                    type: '#text',
                    nodeValue: 'xxx'
                }, {
                    type: '#jsx',
                    nodeValue: '111'
                }, {
                    type: '#text',
                    nodeValue: 'xxx'
                }, {
                    type: '#jsx',
                    nodeValue: '222'
                }]
            })

            expect(parse('<div >xxx{function(){return <div id={aaa}>111</div>}}xxx{222}</div>')).toEqual({
                type: 'div',
                props: {},
                children: [{
                    type: '#text',
                    nodeValue: 'xxx'
                }, {
                    type: '#jsx',
                    nodeValue: [
                        { type: '#jsx', nodeValue: 'function(){return ' },
                        {
                            type: 'div',
                            props: {
                                id: { type: '#jsx', nodeValue: 'aaa' }
                            },
                            children: [{ type: '#text', nodeValue: '111' }]
                        },
                        { type: '#jsx', nodeValue: '}' },
                    ]
                }, {
                    type: '#text',
                    nodeValue: 'xxx'
                }, {
                    type: '#jsx',
                    nodeValue: '222'
                }]
            })
        })

    })
    describe("自闭合标签", function() {
        it("test", function() {

            expect(parse('<div />')).toEqual({
                type: 'div',
                props: {},
                isVoidTag: true,
                children: []
            })
            expect(parse('<br>')).toEqual({
                type: 'br',
                props: {},
                isVoidTag: true,
                children: []
            })
            expect(parse('<hr />')).toEqual({
                type: 'hr',
                props: {},
                isVoidTag: true,
                children: []
            })
            expect(parse('<img>')).toEqual({
                type: 'img',
                props: {},
                isVoidTag: true,
                children: []
            })
            expect(parse('<input>')).toEqual({
                type: 'input',
                props: {},
                isVoidTag: true,
                children: []
            })
            expect(parse('<area>')).toEqual({
                type: 'area',
                props: {},
                isVoidTag: true,
                children: []
            })
        })
    })
    describe("套嵌的结构", function() {
        it("test", function() {
            expect(parse('<div><div>xxx</div></div>')).toEqual({
                type: 'div',
                props: {},
                children: [{
                    type: 'div',
                    props: {},
                    children: [{
                        type: '#text',
                        nodeValue: 'xxx'
                    }]
                }]
            })
            expect(parse('<ul><li>111</li><li>222</li><li>333</li><li>444</li></ul>')).toEqual({
                type: 'ul',
                props: {},
                children: [{
                    type: 'li',
                    props: {},
                    children: [{
                        type: '#text',
                        nodeValue: '111'
                    }]
                }, {
                    type: 'li',
                    props: {},
                    children: [{
                        type: '#text',
                        nodeValue: '222'
                    }]
                }, {
                    type: 'li',
                    props: {},
                    children: [{
                        type: '#text',
                        nodeValue: '333'
                    }]
                }, {
                    type: 'li',
                    props: {},
                    children: [{
                        type: '#text',
                        nodeValue: '444'
                    }]
                }]
            })
        })
    })
    describe("jsx套jsx", function() {
        it("test", function() {
            var str = `<div id="复杂结构">xxx{function(){return <div id={aaa}>111</div>}}xxx{222}</div>`
            expect(parse(str)).toEqual({
                type: 'div',
                props: {
                    id: '复杂结构'
                },
                children: [{
                    type: '#text',
                    nodeValue: 'xxx'
                }, {
                    type: '#jsx',
                    nodeValue: [{
                            type: '#jsx',
                            nodeValue: 'function(){return '
                        },
                        {
                            type: 'div',
                            props: {
                                id: {
                                    type: '#jsx',
                                    nodeValue: 'aaa'
                                }
                            },
                            children: [{
                                type: '#text',
                                nodeValue: '111'
                            }]
                        },
                        {
                            type: '#jsx',
                            nodeValue: '}'
                        }
                    ]
                }, {
                    type: '#text',
                    nodeValue: 'xxx'
                }, {
                    type: '#jsx',
                    nodeValue: '222'
                }]
            })
        })
    })
    describe("移除空白", function() {
        it("test", function() {
            var str = '<ul>  <li>  </li> <li>x</li> </ul>'
            expect(parse(str)).toEqual({
                type: 'ul',
                props: {},
                children: [{
                    type: 'li',
                    props: {},
                    children: [

                    ]
                }, {
                    type: 'li',
                    props: {},
                    children: [{
                        type: '#text',
                        nodeValue: 'x'
                    }]
                }]
            })
            var str2 = '<ul><li></li><li>y</li></ul>'
            expect(parse(str2)).toEqual({
                type: 'ul',
                props: {},
                children: [{
                    type: 'li',
                    props: {},
                    children: [

                    ]
                }, {
                    type: 'li',
                    props: {},
                    children: [{
                        type: '#text',
                        nodeValue: 'y'
                    }]
                }]
            })
        })
    })
    describe("移除option中的元素节点", function() {
        it("test", function() {
            var str = '<option><b>dddd</b><script>333</script><xmp>eee</xmp><template>eeeee</template></option>'
            expect(parse(str)).toEqual({
                type: 'option',
                props: {},
                children: [{
                    type: '#text',
                    nodeValue: 'ddddeee'
                }]
            })
        })
    })
    describe("属性存在jsx", function() {
        it("test", function() {
            expect(parse('<div id={aa} class="className" ></div>')).toEqual({
                type: 'div',
                props: {
                    id: {
                        type: '#jsx',
                        nodeValue: 'aa'
                    },
                    'class': 'className'
                },
                children: []
            })
            expect(parse('<div id={function(){ return <div/> }} class="className"><p>xxx</p></div>')).toEqual({
                type: 'div',
                props: {
                    id: {
                        type: '#jsx',
                        nodeValue: [
                            { type: '#jsx', nodeValue: 'function(){ return ' },
                            { type: 'div', props: {}, children: [], isVoidTag: true },
                            { type: '#jsx', nodeValue: ' }' }
                        ]
                    },
                    'class': 'className'
                },
                children: [{
                    type: "p",
                    props: {},
                    children: [{
                        type: '#text',
                        nodeValue: 'xxx'
                    }]
                }]
            })
            expect(parse('<div id={aa} title={ bb } {var a = 111} class="className" ></div>')).toEqual({
                type: 'div',
                props: {
                    id: {
                        type: '#jsx',
                        nodeValue: 'aa'
                    },
                    title: {
                        type: '#jsx',
                        nodeValue: ' bb '
                    },
                    SpreadJSX: {
                        type: '#jsx',
                        nodeValue: 'var a = 111'
                    },
                    'class': 'className'
                },
                children: []
            })
        })
    })
    describe("自动插入tbody", function() {
        it("test", function() {
            var str = `<table><thead><tr><td>111</td></tr><tr><td>111</td></tr></thead>` +
                `<tr><td>222</td></tr><tr><td>222</td></tr>` +
                `<tfoot><tr><td>333</td></tr><tr><td>444</td></tr></tfoot></table>`
            expect(parse(str)).toEqual({
                type: 'table',
                props: {},
                children: [{
                    type: 'thead',
                    props: {},
                    children: [{
                        type: 'tr',
                        props: {},
                        children: [{
                            type: 'td',
                            props: {},
                            children: [{
                                type: '#text',
                                nodeValue: '111'
                            }]
                        }]
                    }, {
                        type: 'tr',
                        props: {},
                        children: [{
                            type: 'td',
                            props: {},
                            children: [{
                                type: '#text',
                                nodeValue: '111'
                            }]
                        }]
                    }]
                }, {
                    type: 'tbody',
                    props: {},
                    children: [{
                        type: 'tr',
                        props: {},
                        children: [{
                            type: 'td',
                            props: {},
                            children: [{
                                type: '#text',
                                nodeValue: '222'
                            }]
                        }]
                    }, {
                        type: 'tr',
                        props: {},
                        children: [{
                            type: 'td',
                            props: {},
                            children: [{
                                type: '#text',
                                nodeValue: '222'
                            }]
                        }]
                    }]
                }, {
                    type: 'tfoot',
                    props: {},
                    children: [{
                        type: 'tr',
                        props: {},
                        children: [{
                            type: 'td',
                            props: {},
                            children: [{
                                type: '#text',
                                nodeValue: '333'
                            }]
                        }]
                    }, {
                        type: 'tr',
                        props: {},
                        children: [{
                            type: 'td',
                            props: {},
                            children: [{
                                type: '#text',
                                nodeValue: '444'
                            }]
                        }]
                    }]
                }]
            })
        })
    })
    describe("特殊的元素", function() {
        it("test", function() {
            var hasScript = `<div><script>var a = "ddd"<\/script>
<div>xxx</div>
</div>`
            expect(parse(hasScript)).toEqual({
                type: 'div',
                props: {},
                children: [{
                    type: 'script',
                    props: {},
                    children: [{
                        type: '#text',
                        nodeValue: 'var a = "ddd"'
                    }]
                }, {
                    type: 'div',
                    props: {},
                    children: [{
                        type: '#text',
                        nodeValue: 'xxx'
                    }]
                }]
            })

            var hasStyle = `<div><style>h{color:red}<\/style>
<div>xxx</div>
</div>`
            expect(parse(hasStyle)).toEqual({
                type: 'div',
                props: {},
                children: [{
                    type: 'style',
                    props: {},
                    children: [{
                        type: '#text',
                        nodeValue: 'h{color:red}'
                    }]
                }, {
                    type: 'div',
                    props: {},
                    children: [{
                        type: '#text',
                        nodeValue: 'xxx'
                    }]
                }]
            })

            var hasTextarea = `<div><textarea>h{color:red}<\/textarea>
<div>xxx</div>
</div>`
            expect(parse(hasTextarea)).toEqual({
                type: 'div',
                props: {},
                children: [{
                    type: 'textarea',
                    props: {},
                    children: [{
                        type: '#text',
                        nodeValue: 'h{color:red}'
                    }]
                }, {
                    type: 'div',
                    props: {},
                    children: [{
                        type: '#text',
                        nodeValue: 'xxx'
                    }]
                }]
            })

            var hasXmp = `<div><xmp><p></p>111<p></p></xmp>
<div>xxx</div>
</div>`
            expect(parse(hasXmp)).toEqual({
                type: 'div',
                props: {},
                children: [{
                    type: 'xmp',
                    props: {},
                    children: [{
                        type: '#text',
                        nodeValue: '<p></p>111<p></p>'
                    }]
                }, {
                    type: 'div',
                    props: {},
                    children: [{
                        type: '#text',
                        nodeValue: 'xxx'
                    }]
                }]
            })

        })

    })
})