function Bind(obj) {
    let box = document.getElementById(obj.el);
    let data = obj.data || {};
    let elBind = {};
    let allEl = box.querySelectorAll('*');
    for (let i = 0, le = allEl.length; i < le; i++) {
        let el = allEl[i];
        let attr = el.getAttribute('bind');
        el.removeAttribute('bind')
        if (attr) {
            let dateValue = data[attr] !== undefined && data[attr] || '';
            elBind[attr] = elBind[attr] || [];
            elBind[attr].push(el);
            if (/input/i.test(el.nodeName)) {
                el.addEventListener('input', function () {
                    proxy[attr] = el.value;
                });
                el.value = dateValue;
            } else {
                el.innerHTML = dateValue;
            }
        }
    }
    function bindFn(attr, value) {
        let els = elBind[attr];
        if (typeof els === 'object') {
            for (let i = 0, le = els.length; i < le; i++) {
                let el = els[i];
                if (/input/i.test(el.nodeName)) {
                    el.value = value;
                } else {
                    el.innerHTML = value;
                }
            }
        }
    }
    let handler = {
        // 获取值时触发
        get(target, property, receiver) {
            /*
                target 指向 Proxy包装的目标对象(data)  target === data
                property 属性值
                receiver 指向 new Proxy 生成的对象 proxy === receiver
            */
            if (!Reflect.has(target, property)) {
                return `我没有${property}属性`;
            }
            return Reflect.get(target, property, receiver);
        },

        // 设置值时触发
        set(target, property, value, receiver) {
            /*
                target 指向 Proxy包装的目标对象(data)  target === data
                property 属性值
                value 要写入的新值
                receiver 指向 new Proxy 生成的对象 proxy === receiver
            */
            // 监听数据改变绑定界面
            bindFn(property, value);

            return Reflect.set(target, property, value, receiver);
        },

        // 在执行 property in object 的时候调用 has 方法
        // 默认返回false,要就不定义 has 方法
        has(target, property) {
            if (property === 'key') {
                return true;
            } else {
                return Reflect.has(target, property);
            }
        },

        // 执行 delete 操作的时候调用
        // 返回 false 将不会从对象中删除
        deleteProperty(target, property) {
            if (property === "id") {
                return false;
            } else {
                return Reflect.deleteProperty(target, property);
            }
        },

        // 获取原型时调用 （作用不大）
        // 必须返回对象，不然会报错
        getPrototypeOf(target) {
            // return new String('不给获取我的原型');
            return Reflect.getPrototypeOf(target);
        },

        // 设置原型时调用 （作用不大）
        // 返回false就报错
        setPrototypeOf(target, proto) {
            // return Reflect.setPrototypeOf(target, new String('他对你不好，还是要我吧'));
            return Reflect.setPrototypeOf(target, proto);
        }
    }
    // Proxy 对象用于定义基本操作的自定义行为（如属性查找，赋值，枚举，函数调用等）。
    let proxy = new Proxy(data, handler);
    for (let key in obj.methods) {
        obj.methods[key] = obj.methods[key].bind(proxy);
        proxy[key] = obj.methods[key];
    }
    obj.mounted && obj.mounted.apply(proxy);
    // 测试 get
    // console.log(proxy.id);
    // console.log(proxy.asdasd);

    // 测试 set
    // setInterval(() => {
    //     proxy.id = Math.random();
    //     proxy.name = Math.random();
    // },1000);

    // 测试 has
    // console.log('key' in proxy);
    // console.log('id' in proxy);
    // console.log('isssd' in proxy);

    // 测试 deleteProperty
    // console.log(delete proxy.id);
    // console.log(data);

    // 测试 getPrototypeOf
    // console.log(Object.getPrototypeOf(proxy))
    // console.log(proxy.__proto__)

    // 测试 setPrototypeOf
    // let newProto = new String('我是新原型');
    // Object.setPrototypeOf(proxy, newProto);
    // console.log(newProto === proxy.__proto__);
    // console.log(newProto === Object.getPrototypeOf(proxy));
    return proxy;
}