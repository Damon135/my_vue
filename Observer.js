class Observer {
    constructor(data) {
        this.observe(data)
    }
    observe(data) {
        if (!data || typeof data !== 'object') {
            return;
        }
        Object.keys(data).forEach(key => {
            this.defineReactive(data, key, data[key])
            this.observe(data[key])
        })
    }
    defineReactive(obj, key, value) {
        let _this=this;
        let dep = new Dep();
        Object.defineProperty(obj, key, {
            enumerable: false,
            configurable: false,
            get() {
                Dep.target && dep.addSub(Dep.target);
                return value;
            },
            set(newValue) {
                if(value == newValue) return;
                _this.observe(newValue);
                value = newValue;
                dep.notify();
            }
        })
    }
}