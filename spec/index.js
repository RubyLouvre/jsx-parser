describe("A suite of basic functions", function() {
    var parse = JSXParser.parse
    it("简单的类型", function() {

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
        ]);
    });
    it("自闭合标签", function() {

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
    it("套嵌的结构", function() {
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
    it("移除option中的元素节点", function() {
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
    it("特殊的元素", function() {
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