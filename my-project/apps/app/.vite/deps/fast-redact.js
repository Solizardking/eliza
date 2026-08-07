import { t as __commonJSMin } from "./rolldown-runtime-CEgmsyvS.js";
//#region ../../../node_modules/.bun/fast-redact@3.5.0/node_modules/fast-redact/lib/validator.js
var require_validator = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = validator;
	function validator(opts = {}) {
		const { ERR_PATHS_MUST_BE_STRINGS = () => "fast-redact - Paths must be (non-empty) strings", ERR_INVALID_PATH = (s) => `fast-redact – Invalid path (${s})` } = opts;
		return function validate({ paths }) {
			paths.forEach((s) => {
				if (typeof s !== "string") throw Error(ERR_PATHS_MUST_BE_STRINGS());
				try {
					if (/〇/.test(s)) throw Error();
					const expr = (s[0] === "[" ? "" : ".") + s.replace(/^\*/, "〇").replace(/\.\*/g, ".〇").replace(/\[\*\]/g, "[〇]");
					if (/\n|\r|;/.test(expr)) throw Error();
					if (/\/\*/.test(expr)) throw Error();
					Function(`
            'use strict'
            const o = new Proxy({}, { get: () => o, set: () => { throw Error() } });
            const 〇 = null;
            o${expr}
            if ([o${expr}].length !== 1) throw Error()`)();
				} catch (e) {
					throw Error(ERR_INVALID_PATH(s));
				}
			});
		};
	}
}));
//#endregion
//#region ../../../node_modules/.bun/fast-redact@3.5.0/node_modules/fast-redact/lib/rx.js
var require_rx = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = /[^.[\]]+|\[((?:.)*?)\]/g;
}));
//#endregion
//#region ../../../node_modules/.bun/fast-redact@3.5.0/node_modules/fast-redact/lib/parse.js
var require_parse = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var rx = require_rx();
	module.exports = parse;
	function parse({ paths }) {
		const wildcards = [];
		var wcLen = 0;
		const secret = paths.reduce(function(o, strPath, ix) {
			var path = strPath.match(rx).map((p) => p.replace(/'|"|`/g, ""));
			const leadingBracket = strPath[0] === "[";
			path = path.map((p) => {
				if (p[0] === "[") return p.substr(1, p.length - 2);
				else return p;
			});
			const star = path.indexOf("*");
			if (star > -1) {
				const before = path.slice(0, star);
				const beforeStr = before.join(".");
				const after = path.slice(star + 1, path.length);
				const nested = after.length > 0;
				wcLen++;
				wildcards.push({
					before,
					beforeStr,
					after,
					nested
				});
			} else o[strPath] = {
				path,
				val: void 0,
				precensored: false,
				circle: "",
				escPath: JSON.stringify(strPath),
				leadingBracket
			};
			return o;
		}, {});
		return {
			wildcards,
			wcLen,
			secret
		};
	}
}));
//#endregion
//#region ../../../node_modules/.bun/fast-redact@3.5.0/node_modules/fast-redact/lib/redactor.js
var require_redactor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var rx = require_rx();
	module.exports = redactor;
	function redactor({ secret, serialize, wcLen, strict, isCensorFct, censorFctTakesPath }, state) {
		const redact = Function("o", `
    if (typeof o !== 'object' || o == null) {
      ${strictImpl(strict, serialize)}
    }
    const { censor, secret } = this
    const originalSecret = {}
    const secretKeys = Object.keys(secret)
    for (var i = 0; i < secretKeys.length; i++) {
      originalSecret[secretKeys[i]] = secret[secretKeys[i]]
    }

    ${redactTmpl(secret, isCensorFct, censorFctTakesPath)}
    this.compileRestore()
    ${dynamicRedactTmpl(wcLen > 0, isCensorFct, censorFctTakesPath)}
    this.secret = originalSecret
    ${resultTmpl(serialize)}
  `).bind(state);
		redact.state = state;
		if (serialize === false) redact.restore = (o) => state.restore(o);
		return redact;
	}
	function redactTmpl(secret, isCensorFct, censorFctTakesPath) {
		return Object.keys(secret).map((path) => {
			const { escPath, leadingBracket, path: arrPath } = secret[path];
			const skip = leadingBracket ? 1 : 0;
			const delim = leadingBracket ? "" : ".";
			const hops = [];
			var match;
			while ((match = rx.exec(path)) !== null) {
				const [, ix] = match;
				const { index, input } = match;
				if (index > skip) hops.push(input.substring(0, index - (ix ? 0 : 1)));
			}
			var existence = hops.map((p) => `o${delim}${p}`).join(" && ");
			if (existence.length === 0) existence += `o${delim}${path} != null`;
			else existence += ` && o${delim}${path} != null`;
			const circularDetection = `
      switch (true) {
        ${hops.reverse().map((p) => `
          case o${delim}${p} === censor:
            secret[${escPath}].circle = ${JSON.stringify(p)}
            break
        `).join("\n")}
      }
    `;
			const censorArgs = censorFctTakesPath ? `val, ${JSON.stringify(arrPath)}` : `val`;
			return `
      if (${existence}) {
        const val = o${delim}${path}
        if (val === censor) {
          secret[${escPath}].precensored = true
        } else {
          secret[${escPath}].val = val
          o${delim}${path} = ${isCensorFct ? `censor(${censorArgs})` : "censor"}
          ${circularDetection}
        }
      }
    `;
		}).join("\n");
	}
	function dynamicRedactTmpl(hasWildcards, isCensorFct, censorFctTakesPath) {
		return hasWildcards === true ? `
    {
      const { wildcards, wcLen, groupRedact, nestedRedact } = this
      for (var i = 0; i < wcLen; i++) {
        const { before, beforeStr, after, nested } = wildcards[i]
        if (nested === true) {
          secret[beforeStr] = secret[beforeStr] || []
          nestedRedact(secret[beforeStr], o, before, after, censor, ${isCensorFct}, ${censorFctTakesPath})
        } else secret[beforeStr] = groupRedact(o, before, censor, ${isCensorFct}, ${censorFctTakesPath})
      }
    }
  ` : "";
	}
	function resultTmpl(serialize) {
		return serialize === false ? `return o` : `
    var s = this.serialize(o)
    this.restore(o)
    return s
  `;
	}
	function strictImpl(strict, serialize) {
		return strict === true ? `throw Error('fast-redact: primitives cannot be redacted')` : serialize === false ? `return o` : `return this.serialize(o)`;
	}
}));
//#endregion
//#region ../../../node_modules/.bun/fast-redact@3.5.0/node_modules/fast-redact/lib/modifiers.js
var require_modifiers = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		groupRedact,
		groupRestore,
		nestedRedact,
		nestedRestore
	};
	function groupRestore({ keys, values, target }) {
		if (target == null || typeof target === "string") return;
		const length = keys.length;
		for (var i = 0; i < length; i++) {
			const k = keys[i];
			target[k] = values[i];
		}
	}
	function groupRedact(o, path, censor, isCensorFct, censorFctTakesPath) {
		const target = get(o, path);
		if (target == null || typeof target === "string") return {
			keys: null,
			values: null,
			target,
			flat: true
		};
		const keys = Object.keys(target);
		const keysLength = keys.length;
		const pathLength = path.length;
		const pathWithKey = censorFctTakesPath ? [...path] : void 0;
		const values = new Array(keysLength);
		for (var i = 0; i < keysLength; i++) {
			const key = keys[i];
			values[i] = target[key];
			if (censorFctTakesPath) {
				pathWithKey[pathLength] = key;
				target[key] = censor(target[key], pathWithKey);
			} else if (isCensorFct) target[key] = censor(target[key]);
			else target[key] = censor;
		}
		return {
			keys,
			values,
			target,
			flat: true
		};
	}
	/**
	* @param {RestoreInstruction[]} instructions a set of instructions for restoring values to objects
	*/
	function nestedRestore(instructions) {
		for (let i = 0; i < instructions.length; i++) {
			const { target, path, value } = instructions[i];
			let current = target;
			for (let i = path.length - 1; i > 0; i--) current = current[path[i]];
			current[path[0]] = value;
		}
	}
	function nestedRedact(store, o, path, ns, censor, isCensorFct, censorFctTakesPath) {
		const target = get(o, path);
		if (target == null) return;
		const keys = Object.keys(target);
		const keysLength = keys.length;
		for (var i = 0; i < keysLength; i++) {
			const key = keys[i];
			specialSet(store, target, key, path, ns, censor, isCensorFct, censorFctTakesPath);
		}
		return store;
	}
	function has(obj, prop) {
		return obj !== void 0 && obj !== null ? "hasOwn" in Object ? Object.hasOwn(obj, prop) : Object.prototype.hasOwnProperty.call(obj, prop) : false;
	}
	function specialSet(store, o, k, path, afterPath, censor, isCensorFct, censorFctTakesPath) {
		const afterPathLen = afterPath.length;
		const lastPathIndex = afterPathLen - 1;
		const originalKey = k;
		var i = -1;
		var n;
		var nv;
		var ov;
		var oov = null;
		var wc = null;
		var kIsWc;
		var wcov;
		var consecutive = false;
		var level = 0;
		var depth = 0;
		var redactPathCurrent = tree();
		ov = n = o[k];
		if (typeof n !== "object") return;
		while (n != null && ++i < afterPathLen) {
			depth += 1;
			k = afterPath[i];
			oov = ov;
			if (k !== "*" && !wc && !(typeof n === "object" && k in n)) break;
			if (k === "*") {
				if (wc === "*") consecutive = true;
				wc = k;
				if (i !== lastPathIndex) continue;
			}
			if (wc) {
				const wcKeys = Object.keys(n);
				for (var j = 0; j < wcKeys.length; j++) {
					const wck = wcKeys[j];
					wcov = n[wck];
					kIsWc = k === "*";
					if (consecutive) {
						redactPathCurrent = node(redactPathCurrent, wck, depth);
						level = i;
						ov = iterateNthLevel(wcov, level - 1, k, path, afterPath, censor, isCensorFct, censorFctTakesPath, originalKey, n, nv, ov, kIsWc, wck, i, lastPathIndex, redactPathCurrent, store, o[originalKey], depth + 1);
					} else if (kIsWc || typeof wcov === "object" && wcov !== null && k in wcov) {
						if (kIsWc) ov = wcov;
						else ov = wcov[k];
						nv = i !== lastPathIndex ? ov : isCensorFct ? censorFctTakesPath ? censor(ov, [
							...path,
							originalKey,
							...afterPath
						]) : censor(ov) : censor;
						if (kIsWc) {
							const rv = restoreInstr(node(redactPathCurrent, wck, depth), ov, o[originalKey]);
							store.push(rv);
							n[wck] = nv;
						} else if (wcov[k] === nv) {} else if (nv === void 0 && censor !== void 0 || has(wcov, k) && nv === ov) redactPathCurrent = node(redactPathCurrent, wck, depth);
						else {
							redactPathCurrent = node(redactPathCurrent, wck, depth);
							const rv = restoreInstr(node(redactPathCurrent, k, depth + 1), ov, o[originalKey]);
							store.push(rv);
							wcov[k] = nv;
						}
					}
				}
				wc = null;
			} else {
				ov = n[k];
				redactPathCurrent = node(redactPathCurrent, k, depth);
				nv = i !== lastPathIndex ? ov : isCensorFct ? censorFctTakesPath ? censor(ov, [
					...path,
					originalKey,
					...afterPath
				]) : censor(ov) : censor;
				if (has(n, k) && nv === ov || nv === void 0 && censor !== void 0) {} else {
					const rv = restoreInstr(redactPathCurrent, ov, o[originalKey]);
					store.push(rv);
					n[k] = nv;
				}
				n = n[k];
			}
			if (typeof n !== "object") break;
			if (ov === oov || typeof ov === "undefined") {}
		}
	}
	function get(o, p) {
		var i = -1;
		var l = p.length;
		var n = o;
		while (n != null && ++i < l) n = n[p[i]];
		return n;
	}
	function iterateNthLevel(wcov, level, k, path, afterPath, censor, isCensorFct, censorFctTakesPath, originalKey, n, nv, ov, kIsWc, wck, i, lastPathIndex, redactPathCurrent, store, parent, depth) {
		if (level === 0) {
			if (kIsWc || typeof wcov === "object" && wcov !== null && k in wcov) {
				if (kIsWc) ov = wcov;
				else ov = wcov[k];
				nv = i !== lastPathIndex ? ov : isCensorFct ? censorFctTakesPath ? censor(ov, [
					...path,
					originalKey,
					...afterPath
				]) : censor(ov) : censor;
				if (kIsWc) {
					const rv = restoreInstr(redactPathCurrent, ov, parent);
					store.push(rv);
					n[wck] = nv;
				} else if (wcov[k] === nv) {} else if (nv === void 0 && censor !== void 0 || has(wcov, k) && nv === ov) {} else {
					const rv = restoreInstr(node(redactPathCurrent, k, depth + 1), ov, parent);
					store.push(rv);
					wcov[k] = nv;
				}
			}
		}
		for (const key in wcov) if (typeof wcov[key] === "object") {
			redactPathCurrent = node(redactPathCurrent, key, depth);
			iterateNthLevel(wcov[key], level - 1, k, path, afterPath, censor, isCensorFct, censorFctTakesPath, originalKey, n, nv, ov, kIsWc, wck, i, lastPathIndex, redactPathCurrent, store, parent, depth + 1);
		}
	}
	/**
	* @typedef {object} TreeNode
	* @prop {TreeNode} [parent] reference to the parent of this node in the tree, or `null` if there is no parent
	* @prop {string} key the key that this node represents (key here being part of the path being redacted
	* @prop {TreeNode[]} children the child nodes of this node
	* @prop {number} depth the depth of this node in the tree
	*/
	/**
	* instantiate a new, empty tree
	* @returns {TreeNode}
	*/
	function tree() {
		return {
			parent: null,
			key: null,
			children: [],
			depth: 0
		};
	}
	/**
	* creates a new node in the tree, attaching it as a child of the provided parent node
	* if the specified depth matches the parent depth, adds the new node as a _sibling_ of the parent instead
	* @param {TreeNode} parent the parent node to add a new node to (if the parent depth matches the provided `depth` value, will instead add as a sibling of this
	* @param {string} key the key that the new node represents (key here being part of the path being redacted)
	* @param {number} depth the depth of the new node in the tree - used to determing whether to add the new node as a child or sibling of the provided `parent` node
	* @returns {TreeNode} a reference to the newly created node in the tree
	*/
	function node(parent, key, depth) {
		if (parent.depth === depth) return node(parent.parent, key, depth);
		var child = {
			parent,
			key,
			depth,
			children: []
		};
		parent.children.push(child);
		return child;
	}
	/**
	* @typedef {object} RestoreInstruction
	* @prop {string[]} path a reverse-order path that can be used to find the correct insertion point to restore a `value` for the given `parent` object
	* @prop {*} value the value to restore
	* @prop {object} target the object to restore the `value` in
	*/
	/**
	* create a restore instruction for the given redactPath node
	* generates a path in reverse order by walking up the redactPath tree
	* @param {TreeNode} node a tree node that should be at the bottom of the redact path (i.e. have no children) - this will be used to walk up the redact path tree to construct the path needed to restore
	* @param {*} value the value to restore
	* @param {object} target a reference to the parent object to apply the restore instruction to
	* @returns {RestoreInstruction} an instruction used to restore a nested value for a specific object
	*/
	function restoreInstr(node, value, target) {
		let current = node;
		const path = [];
		do {
			path.push(current.key);
			current = current.parent;
		} while (current.parent != null);
		return {
			path,
			value,
			target
		};
	}
}));
//#endregion
//#region ../../../node_modules/.bun/fast-redact@3.5.0/node_modules/fast-redact/lib/restorer.js
var require_restorer = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { groupRestore, nestedRestore } = require_modifiers();
	module.exports = restorer;
	function restorer() {
		return function compileRestore() {
			if (this.restore) {
				this.restore.state.secret = this.secret;
				return;
			}
			const { secret, wcLen } = this;
			const paths = Object.keys(secret);
			const resetters = resetTmpl(secret, paths);
			const hasWildcards = wcLen > 0;
			const state = hasWildcards ? {
				secret,
				groupRestore,
				nestedRestore
			} : { secret };
			this.restore = Function("o", restoreTmpl(resetters, paths, hasWildcards)).bind(state);
			this.restore.state = state;
		};
	}
	/**
	* Mutates the original object to be censored by restoring its original values
	* prior to censoring.
	*
	* @param {object} secret Compiled object describing which target fields should
	* be censored and the field states.
	* @param {string[]} paths The list of paths to censor as provided at
	* initialization time.
	*
	* @returns {string} String of JavaScript to be used by `Function()`. The
	* string compiles to the function that does the work in the description.
	*/
	function resetTmpl(secret, paths) {
		return paths.map((path) => {
			const { circle, escPath, leadingBracket } = secret[path];
			return `
      if (secret[${escPath}].val !== undefined) {
        try { ${circle ? `o.${circle} = secret[${escPath}].val` : `o${leadingBracket ? "" : "."}${path} = secret[${escPath}].val`} } catch (e) {}
        ${`secret[${escPath}].val = undefined`}
      }
    `;
		}).join("");
	}
	/**
	* Creates the body of the restore function
	*
	* Restoration of the redacted object happens
	* backwards, in reverse order of redactions,
	* so that repeated redactions on the same object
	* property can be eventually rolled back to the
	* original value.
	*
	* This way dynamic redactions are restored first,
	* starting from the last one working backwards and
	* followed by the static ones.
	*
	* @returns {string} the body of the restore function
	*/
	function restoreTmpl(resetters, paths, hasWildcards) {
		return `
    const secret = this.secret
    ${hasWildcards === true ? `
    const keys = Object.keys(secret)
    const len = keys.length
    for (var i = len - 1; i >= ${paths.length}; i--) {
      const k = keys[i]
      const o = secret[k]
      if (o) {
        if (o.flat === true) this.groupRestore(o)
        else this.nestedRestore(o)
        secret[k] = null
      }
    }
  ` : ""}
    ${resetters}
    return o
  `;
	}
}));
//#endregion
//#region ../../../node_modules/.bun/fast-redact@3.5.0/node_modules/fast-redact/lib/state.js
var require_state = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = state;
	function state(o) {
		const { secret, censor, compileRestore, serialize, groupRedact, nestedRedact, wildcards, wcLen } = o;
		const builder = [{
			secret,
			censor,
			compileRestore
		}];
		if (serialize !== false) builder.push({ serialize });
		if (wcLen > 0) builder.push({
			groupRedact,
			nestedRedact,
			wildcards,
			wcLen
		});
		return Object.assign(...builder);
	}
}));
//#endregion
//#region ../../../node_modules/.bun/fast-redact@3.5.0/node_modules/fast-redact/index.js
var require_fast_redact = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var validator = require_validator();
	var parse = require_parse();
	var redactor = require_redactor();
	var restorer = require_restorer();
	var { groupRedact, nestedRedact } = require_modifiers();
	var state = require_state();
	var rx = require_rx();
	var validate = validator();
	var noop = (o) => o;
	noop.restore = noop;
	var DEFAULT_CENSOR = "[REDACTED]";
	fastRedact.rx = rx;
	fastRedact.validator = validator;
	module.exports = fastRedact;
	function fastRedact(opts = {}) {
		const paths = Array.from(new Set(opts.paths || []));
		const serialize = "serialize" in opts ? opts.serialize === false ? opts.serialize : typeof opts.serialize === "function" ? opts.serialize : JSON.stringify : JSON.stringify;
		const remove = opts.remove;
		if (remove === true && serialize !== JSON.stringify) throw Error("fast-redact – remove option may only be set when serializer is JSON.stringify");
		const censor = remove === true ? void 0 : "censor" in opts ? opts.censor : DEFAULT_CENSOR;
		const isCensorFct = typeof censor === "function";
		const censorFctTakesPath = isCensorFct && censor.length > 1;
		if (paths.length === 0) return serialize || noop;
		validate({
			paths,
			serialize,
			censor
		});
		const { wildcards, wcLen, secret } = parse({
			paths,
			censor
		});
		const compileRestore = restorer();
		return redactor({
			secret,
			wcLen,
			serialize,
			strict: "strict" in opts ? opts.strict : true,
			isCensorFct,
			censorFctTakesPath
		}, state({
			secret,
			censor,
			compileRestore,
			serialize,
			groupRedact,
			nestedRedact,
			wildcards,
			wcLen
		}));
	}
}));
//#endregion
export default require_fast_redact();
