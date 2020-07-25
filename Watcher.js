class Watcher {
    constructor(vm, expr, cb) {
        this.vm = vm
        this.expr = expr
        this.cb = cb
        this.value = this.get()
    }
    getVal() {
        let a = this.expr.split('.')
        return a.reduce((prev, cur) => {
            return prev[cur]
        }, this.vm.$data)
    }
    get() {
        Dep.target = this
        let value = this.getVal(this.vm, this.expr)
        Dep.target = null
        return value
    }
    update() {
        let newValue = this.get(this.vm, this.expr)
        let oldValue = this.value
        if (newValue !== oldValue) {
            this.cb(newValue)
            this.value = newValue
        }
    }
}