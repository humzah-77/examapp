
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.55.1' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/App.svelte generated by Svelte v3.55.1 */

    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let h10;
    	let t1;
    	let div2;
    	let div0;
    	let h11;
    	let t3;
    	let button0;
    	let t4;
    	let div1;
    	let h12;
    	let t6;
    	let label0;
    	let input0;
    	let t7;
    	let span0;
    	let t8;
    	let br0;
    	let br1;
    	let t9;
    	let div9;
    	let div8;
    	let h13;
    	let t11;
    	let div3;
    	let form;
    	let textarea;
    	let br2;
    	let br3;
    	let t12;
    	let button1;
    	let t14;
    	let br4;
    	let br5;
    	let t15;
    	let div7;
    	let div4;
    	let h30;
    	let t17;
    	let label1;
    	let input1;
    	let t18;
    	let span1;
    	let t19;
    	let div5;
    	let h31;
    	let t21;
    	let label2;
    	let input2;
    	let t22;
    	let span2;
    	let t23;
    	let div6;
    	let h32;
    	let t25;
    	let label3;
    	let input3;
    	let t26;
    	let span3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h10 = element("h1");
    			h10.textContent = "DashBoard";
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			h11 = element("h1");
    			h11.textContent = "Lock";
    			t3 = space();
    			button0 = element("button");
    			t4 = space();
    			div1 = element("div");
    			h12 = element("h1");
    			h12.textContent = "Lights";
    			t6 = space();
    			label0 = element("label");
    			input0 = element("input");
    			t7 = space();
    			span0 = element("span");
    			t8 = space();
    			br0 = element("br");
    			br1 = element("br");
    			t9 = space();
    			div9 = element("div");
    			div8 = element("div");
    			h13 = element("h1");
    			h13.textContent = "Messenger";
    			t11 = space();
    			div3 = element("div");
    			form = element("form");
    			textarea = element("textarea");
    			br2 = element("br");
    			br3 = element("br");
    			t12 = space();
    			button1 = element("button");
    			button1.textContent = "Send message to screen";
    			t14 = space();
    			br4 = element("br");
    			br5 = element("br");
    			t15 = space();
    			div7 = element("div");
    			div4 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Next";
    			t17 = space();
    			label1 = element("label");
    			input1 = element("input");
    			t18 = space();
    			span1 = element("span");
    			t19 = space();
    			div5 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Check";
    			t21 = space();
    			label2 = element("label");
    			input2 = element("input");
    			t22 = space();
    			span2 = element("span");
    			t23 = space();
    			div6 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Done";
    			t25 = space();
    			label3 = element("label");
    			input3 = element("input");
    			t26 = space();
    			span3 = element("span");
    			set_style(h10, "text-align", "center");
    			set_style(h10, "color", "white");
    			set_style(h10, "font-size", "100px");
    			add_location(h10, file, 90, 2, 1895);
    			add_location(h11, file, 94, 6, 2100);
    			attr_dev(button0, "class", "buttons svelte-1rw70c2");
    			add_location(button0, file, 95, 6, 2120);
    			attr_dev(div0, "class", "grid-item svelte-1rw70c2");
    			set_style(div0, "border", "3px solid #a020f066");
    			add_location(div0, file, 93, 4, 2033);
    			add_location(h12, file, 100, 6, 2276);
    			attr_dev(input0, "type", "checkbox");
    			attr_dev(input0, "class", "svelte-1rw70c2");
    			add_location(input0, file, 102, 8, 2329);
    			attr_dev(span0, "class", "slider svelte-1rw70c2");
    			add_location(span0, file, 103, 8, 2417);
    			attr_dev(label0, "class", "switch svelte-1rw70c2");
    			add_location(label0, file, 101, 6, 2298);
    			attr_dev(div1, "class", "grid-item svelte-1rw70c2");
    			set_style(div1, "border", "3px solid #a020f066");
    			add_location(div1, file, 99, 4, 2209);
    			attr_dev(div2, "class", "grid-container center svelte-1rw70c2");
    			set_style(div2, "width", "70%");
    			add_location(div2, file, 92, 2, 1974);
    			add_location(br0, file, 106, 8, 2476);
    			add_location(br1, file, 106, 12, 2480);
    			add_location(h13, file, 109, 6, 2615);
    			attr_dev(textarea, "id", "myTextarea");
    			set_style(textarea, "width", "80%");
    			set_style(textarea, "height", "100px");
    			set_style(textarea, "background-color", "white");
    			set_style(textarea, "color", "black");
    			add_location(textarea, file, 112, 10, 2723);
    			add_location(br2, file, 112, 117, 2830);
    			add_location(br3, file, 112, 121, 2834);
    			attr_dev(button1, "type", "submit");
    			set_style(button1, "height", "35px");
    			set_style(button1, "border-radius", "100px");
    			set_style(button1, "background-color", "#a020f066");
    			set_style(button1, "color", "white");
    			add_location(button1, file, 113, 10, 2849);
    			add_location(form, file, 111, 8, 2669);
    			attr_dev(div3, "class", "center svelte-1rw70c2");
    			add_location(div3, file, 110, 6, 2640);
    			add_location(br4, file, 117, 12, 3038);
    			add_location(br5, file, 117, 16, 3042);
    			add_location(h30, file, 120, 10, 3188);
    			attr_dev(input1, "type", "checkbox");
    			attr_dev(input1, "class", "svelte-1rw70c2");
    			add_location(input1, file, 122, 12, 3247);
    			attr_dev(span1, "class", "slider svelte-1rw70c2");
    			add_location(span1, file, 123, 12, 3337);
    			attr_dev(label1, "class", "switch svelte-1rw70c2");
    			add_location(label1, file, 121, 10, 3212);
    			attr_dev(div4, "class", "grid-item svelte-1rw70c2");
    			set_style(div4, "border", "3px solid #a020f066");
    			add_location(div4, file, 119, 8, 3117);
    			add_location(h31, file, 127, 10, 3475);
    			attr_dev(input2, "type", "checkbox");
    			attr_dev(input2, "class", "svelte-1rw70c2");
    			add_location(input2, file, 129, 12, 3535);
    			attr_dev(span2, "class", "slider svelte-1rw70c2");
    			add_location(span2, file, 130, 12, 3627);
    			attr_dev(label2, "class", "switch svelte-1rw70c2");
    			add_location(label2, file, 128, 10, 3500);
    			attr_dev(div5, "class", "grid-item svelte-1rw70c2");
    			set_style(div5, "border", "3px solid #a020f066");
    			add_location(div5, file, 126, 8, 3404);
    			add_location(h32, file, 134, 10, 3765);
    			attr_dev(input3, "type", "checkbox");
    			attr_dev(input3, "class", "svelte-1rw70c2");
    			add_location(input3, file, 136, 12, 3824);
    			attr_dev(span3, "class", "slider svelte-1rw70c2");
    			add_location(span3, file, 137, 12, 3914);
    			attr_dev(label3, "class", "switch svelte-1rw70c2");
    			add_location(label3, file, 135, 10, 3789);
    			attr_dev(div6, "class", "grid-item svelte-1rw70c2");
    			set_style(div6, "border", "3px solid #a020f066");
    			add_location(div6, file, 133, 8, 3694);
    			attr_dev(div7, "class", "grid-container2 center svelte-1rw70c2");
    			set_style(div7, "width", "70%");
    			add_location(div7, file, 118, 6, 3053);
    			attr_dev(div8, "class", "grid-item svelte-1rw70c2");
    			set_style(div8, "border", "3px solid #a020f066");
    			add_location(div8, file, 108, 5, 2548);
    			attr_dev(div9, "class", "grid-container1 center svelte-1rw70c2");
    			set_style(div9, "width", "60%");
    			add_location(div9, file, 107, 2, 2487);
    			add_location(main, file, 89, 0, 1886);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h10);
    			append_dev(main, t1);
    			append_dev(main, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h11);
    			append_dev(div0, t3);
    			append_dev(div0, button0);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, h12);
    			append_dev(div1, t6);
    			append_dev(div1, label0);
    			append_dev(label0, input0);
    			input0.checked = /*light*/ ctx[0];
    			append_dev(label0, t7);
    			append_dev(label0, span0);
    			append_dev(div2, t8);
    			append_dev(main, br0);
    			append_dev(main, br1);
    			append_dev(main, t9);
    			append_dev(main, div9);
    			append_dev(div9, div8);
    			append_dev(div8, h13);
    			append_dev(div8, t11);
    			append_dev(div8, div3);
    			append_dev(div3, form);
    			append_dev(form, textarea);
    			append_dev(form, br2);
    			append_dev(form, br3);
    			append_dev(form, t12);
    			append_dev(form, button1);
    			append_dev(div3, t14);
    			append_dev(div8, br4);
    			append_dev(div8, br5);
    			append_dev(div8, t15);
    			append_dev(div8, div7);
    			append_dev(div7, div4);
    			append_dev(div4, h30);
    			append_dev(div4, t17);
    			append_dev(div4, label1);
    			append_dev(label1, input1);
    			input1.checked = /*next*/ ctx[2];
    			append_dev(label1, t18);
    			append_dev(label1, span1);
    			append_dev(div7, t19);
    			append_dev(div7, div5);
    			append_dev(div5, h31);
    			append_dev(div5, t21);
    			append_dev(div5, label2);
    			append_dev(label2, input2);
    			input2.checked = /*check*/ ctx[1];
    			append_dev(label2, t22);
    			append_dev(label2, span2);
    			append_dev(div7, t23);
    			append_dev(div7, div6);
    			append_dev(div6, h32);
    			append_dev(div6, t25);
    			append_dev(div6, label3);
    			append_dev(label3, input3);
    			input3.checked = /*done*/ ctx[3];
    			append_dev(label3, t26);
    			append_dev(label3, span3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", prevent_default(locks), false, true, false),
    					listen_dev(input0, "change", /*input0_change_handler*/ ctx[8]),
    					listen_dev(input0, "change", prevent_default(/*lights*/ ctx[4]), false, true, false),
    					listen_dev(form, "submit", prevent_default(messenger), false, true, false),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[9]),
    					listen_dev(input1, "change", prevent_default(/*nexts*/ ctx[5]), false, true, false),
    					listen_dev(input2, "change", /*input2_change_handler*/ ctx[10]),
    					listen_dev(input2, "change", prevent_default(/*checks*/ ctx[7]), false, true, false),
    					listen_dev(input3, "change", /*input3_change_handler*/ ctx[11]),
    					listen_dev(input3, "change", prevent_default(/*dones*/ ctx[6]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*light*/ 1) {
    				input0.checked = /*light*/ ctx[0];
    			}

    			if (dirty & /*next*/ 4) {
    				input1.checked = /*next*/ ctx[2];
    			}

    			if (dirty & /*check*/ 2) {
    				input2.checked = /*check*/ ctx[1];
    			}

    			if (dirty & /*done*/ 8) {
    				input3.checked = /*done*/ ctx[3];
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function openlock() {
    	await fetch("./openlock"); //call api to open lock
    }

    async function lightson() {
    	await fetch("./lighton"); //call api to turn on lights 
    }

    async function lightsoff() {
    	await fetch("./lightoff"); //call api to turn off lights
    }

    async function checkson() {
    	await fetch("./oncheck"); //call api to set messenger into check mode
    }

    async function checksoff() {
    	await fetch("./offcheck"); //call api to set messenger out of check mode
    }

    async function nextson() {
    	await fetch("./onnext"); //call api to check next message 
    }

    async function nextsoff() {
    	await fetch("./offnext"); //call api to lock next message 
    }

    async function doneson() {
    	await fetch("./ondone"); //call api to clear messenger
    }

    async function donesoff() {
    	await fetch("./offdone"); //call api to cancel messenger clear
    }

    async function messengers() {
    	await fetch("./message?message=${message}"); //call api to write to messenger
    }

    function messenger() {
    	messengers();
    }

    function locks() {
    	openlock();
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let lock = false;
    	let light = false;
    	let check = false;
    	let next = false;
    	let done = false;
    	let lighton; //variables to control arduino widgets 
    	let lightoff;
    	let nexton;
    	let nextoff;
    	let doneon;
    	let doneoff;
    	let checkon;
    	let checkoff;
    	let lockon;
    	let message;

    	function lights() {
    		if (light) {
    			lightson();
    		} else {
    			lightsoff();
    		}
    	}

    	function nexts() {
    		if (next) {
    			nextson();
    		} else {
    			nextsoff();
    		}
    	}

    	function dones() {
    		if (done) {
    			doneson();
    		} else {
    			donesoff();
    		}
    	}

    	function checks() {
    		if (check) {
    			checkson();
    		} else {
    			checksoff();
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input0_change_handler() {
    		light = this.checked;
    		$$invalidate(0, light);
    	}

    	function input1_change_handler() {
    		next = this.checked;
    		$$invalidate(2, next);
    	}

    	function input2_change_handler() {
    		check = this.checked;
    		$$invalidate(1, check);
    	}

    	function input3_change_handler() {
    		done = this.checked;
    		$$invalidate(3, done);
    	}

    	$$self.$capture_state = () => ({
    		lock,
    		light,
    		check,
    		next,
    		done,
    		lighton,
    		lightoff,
    		nexton,
    		nextoff,
    		doneon,
    		doneoff,
    		checkon,
    		checkoff,
    		lockon,
    		message,
    		openlock,
    		lightson,
    		lightsoff,
    		checkson,
    		checksoff,
    		nextson,
    		nextsoff,
    		doneson,
    		donesoff,
    		messengers,
    		messenger,
    		locks,
    		lights,
    		nexts,
    		dones,
    		checks
    	});

    	$$self.$inject_state = $$props => {
    		if ('lock' in $$props) lock = $$props.lock;
    		if ('light' in $$props) $$invalidate(0, light = $$props.light);
    		if ('check' in $$props) $$invalidate(1, check = $$props.check);
    		if ('next' in $$props) $$invalidate(2, next = $$props.next);
    		if ('done' in $$props) $$invalidate(3, done = $$props.done);
    		if ('lighton' in $$props) lighton = $$props.lighton;
    		if ('lightoff' in $$props) lightoff = $$props.lightoff;
    		if ('nexton' in $$props) nexton = $$props.nexton;
    		if ('nextoff' in $$props) nextoff = $$props.nextoff;
    		if ('doneon' in $$props) doneon = $$props.doneon;
    		if ('doneoff' in $$props) doneoff = $$props.doneoff;
    		if ('checkon' in $$props) checkon = $$props.checkon;
    		if ('checkoff' in $$props) checkoff = $$props.checkoff;
    		if ('lockon' in $$props) lockon = $$props.lockon;
    		if ('message' in $$props) message = $$props.message;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		light,
    		check,
    		next,
    		done,
    		lights,
    		nexts,
    		dones,
    		checks,
    		input0_change_handler,
    		input1_change_handler,
    		input2_change_handler,
    		input3_change_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
