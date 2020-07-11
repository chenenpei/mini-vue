const targetMap = new WeakMap();

let activeEffect = null;

function track(target, key) {
    if (activeEffect) {
        let depsMap = targetMap.get(target);
        if (!depsMap) targetMap.set(target, (depsMap = new Map()));

        let dep = depsMap.get(key);
        if (!dep) depsMap.set(key, (dep = new Set()));

        dep.add(activeEffect);
    }
}

function trigger(target, key) {
    const depsMap = targetMap.get(target);
    if (!depsMap) return;

    const dep = depsMap.get(key);
    if (dep) dep.forEach(effect => effect());
}

export function reactive(target) {
    const handler = {
        get(target, key, receiver) {
            const result = Reflect.get(target, key, receiver);

            track(target, key);

            return result;
        },
        set(target, key, value, receiver) {
            const oldValue = target[key];
            const result = Reflect.set(target, key, value, receiver);

            if (oldValue !== value) trigger(target, key);

            return result;
        },
    }
    return new Proxy(target, handler);
}

export function ref(raw) {
    const r = {
        get value() {
            track(r, 'value');
            return raw;
        },
        set value(newVal) {
            raw = newVal;
            trigger(r, 'value');
        },
    }

    return r;
}

export function effect(eff) {
    activeEffect = eff;
    activeEffect();
    activeEffect = null;
}

export function computed(getter) {
    const result = ref();

    effect(() => (result.value = getter()));

    return result;
}
