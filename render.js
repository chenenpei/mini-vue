export function h(tag, props, children) {
    return {
        tag,
        props,
        children
    };
}

export function mount(vnode, container) {
    // 复用 DOM 节点
    const el = vnode.el = document.createElement(vnode.tag);

    // 处理 props
    // 假设所有 props 都是 HTML attribute
    if (vnode.props) {
        for (const key in vnode.props) {
            const value = vnode.props[key];
            if (key.startsWith('on')) {
                el.addEventListener(key.slice(2).toLocaleLowerCase(), value);
            } else {
                el.setAttribute(key, value);
            }
        }
    }

    // 处理 children
    // 假设 children 是一个 string，或 vnodes 数组
    if (vnode.children) {
        if (typeof vnode.children === 'string') {
            el.textContent = vnode.children;
        } else {
            vnode.children.forEach(child => {
                mount(child, el);
            });
        }
    }

    container.appendChild(el);
}

// n1，旧的 vnode
// n2, 新的 vnode
export function patch(n1, n2) {
    if (n1.tag === n2.tag) {
        // 在新的 vnode 上复用 DOM 节点
        const el = n2.el = n1.el;

        // 比较新旧 vnode 的 props
        const oldProps = n1.props || {};
        const newProps = n2.props || {};
        for (const key in newProps) {
            const oldValue = oldProps[key];
            const newValue = newProps[key];
            if (newValue !== oldValue) {
                el.setAttribute(key, newValue);
            }
        }
        for (const key in oldProps) {
            if (!(key in newProps)) {
                el.removeAttribute(key);
            }
        }

        // 比较新旧 vnode 的 children
        const oldChildren = n1.children;
        const newChildren = n2.children;
        if (typeof newChildren === 'string') {
            if (typeof oldChildren === 'string') {
                if (newChildren !== oldChildren) {
                    el.textContent = newChildren;
                }
            } else {
                el.textContent = newChildren
            }
        } else {
            if (typeof oldChildren === 'string') {
                el.innerHTML = '';
                newChildren.forEach(child => mount(child, el));
            } else {
                const commonLength = Math.min(oldChildren.length, newChildren.length);

                // 此处比较子节点时并不考虑节点复用，
                // 一旦发现 vnode 的类型不一样，会直接替换
                //（Vue 实际会复用子节点，并通过 key 进行 diff）
                for (let i = 0; i < commonLength; i++) {
                    patch(oldChildren[i], newChildren[i]);
                }

                if (newChildren.length > oldChildren.length) {
                    newChildren.slice(oldChildren.length).forEach(child => mount(child, el));
                } else if (newChildren.length < oldChildren.length) {
                    oldChildren.slice(newChildren.length).forEach(child => {
                        el.removeChild(child.el);
                    });
                }
            }
        }
    } else {
        // replace
        const el = n1.el;
        const parent = el.parentNode;
        parent.removeChild(el);
        mount(n2, parent);
    }
}