class Compile {
    constructor(el, vm) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el)
        this.vm = vm

        if (this.el) {
            let fragment = this.node2fragment(this.el)
            this.compile(fragment)
            this.el.appendChild(fragment)

        }
    }
    // 辅助方法
    isElementNode(el) {
        return el.nodeType == 1
    }
    isDirective(attr) {
        return attr.name.includes('v-')
    }

    // 核心方法

    // 编译元素
    compileElement(node) {
        let attributes = node.attributes
        Array.from(attributes).forEach(attr => {
            if (this.isDirective(attr)) {
                let expr = attr.value
                let type = attr.name.slice(2)
                CompileUtil[type](node, this.vm, expr)
            }
        })
    }
    // 编译文本
    compileText(node) {
        let expr = node.textContent
        let reg = /\{\{([^}]+)\}\}/g
        if (reg.test(expr)) {
            CompileUtil['text'](node, this.vm, expr)
        }
    }
    compile(fragment) {
        let childNodes = fragment.childNodes
        Array.from(childNodes).forEach((node) => {
            if (this.isElementNode(node)) {
                this.compileElement(node)
                this.compile(node)
            } else {
                this.compileText(node)
            }
        })
    }
    // 放内存
    node2fragment(el) {
        let fragment = document.createDocumentFragment()
        let firstChild
        while (firstChild = el.firstChild) {
            fragment.appendChild(firstChild)
        }
        return fragment
    }


}
CompileUtil = {
    getVal(vm, expr) {
        let a = expr.split('.');
        return a.reduce((prev, cur) => {
            return prev[cur]
        }, vm.$data)
    },
    setVal(vm, expr, value){
        let a =expr.split('.');
        return a.reduce((prev,cur,curIndex)=>{
            if(curIndex == a.length -1){
                return prev[cur]=value
            }
            return prev[cur]
        },vm.$data)
    },
    getTextValue(vm, expr) {
        return expr.replace(/\{\{([^}]+)\}\}/g, (_, g) => {
            return this.getVal(vm, g)
        })
    },
    model(node, vm, expr) {
        let fn = this.updater['modelUpdater']
        new Watcher(vm, expr, (newValue) => {
            fn && fn(node, this.getVal(vm, expr))
        })
        node.addEventListener('input',e=>{
            let newValue = e.target.value;
            console.log(newValue);
            this.setVal(vm, expr, newValue)

        })
        fn && fn(node, this.getVal(vm, expr))
    },
    text(node, vm, expr) {
        let fn = this.updater['textUpdater']
        expr.replace(/\{\{([^}]+)\}\}/g, (_, g) => {
            new Watcher(vm, g, (newValue) => {
                fn && fn(node, this.getVal(vm, g))
            })
        })
        
        fn && fn(node, this.getTextValue(vm, expr))
    },
    updater: {
        modelUpdater(node, value) {
            node.value = value
        },
        textUpdater(node, value) {
            node.textContent = value
        }

    }
}