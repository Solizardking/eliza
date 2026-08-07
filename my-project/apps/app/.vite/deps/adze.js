import { o as __toESM, t as __commonJSMin } from "./rolldown-runtime-CEgmsyvS.js";
//#region ../../../node_modules/.bun/adze@2.3.0/node_modules/adze/dist/tools.js
var Tools = class {
	/**
	* Reference to the global store.
	*/
	globalStore;
	constructor(globalStore) {
		this.globalStore = globalStore;
	}
	/**
	* Clears the console.
	*/
	clear() {
		console.clear();
	}
	/**
	* Rerenders all logs that match the label filter.
	*/
	filterByLabel(label) {
		filterByLabel(label, this.globalStore.cache).forEach((log) => {
			render(log);
		});
	}
	/**
	* Rerenders all logs that match the namespace filter.
	*/
	filterByNamespace(...namespace) {
		filterByNamespace(namespace, this.globalStore.cache).forEach((log) => {
			render(log);
		});
	}
	/**
	* Rerenders all logs that match the level selector.
	*/
	filterByLevel(level) {
		filterByLevel(level, this.globalStore.cache).forEach((log) => {
			render(log);
		});
	}
	/**
	* Rerenders all logs that have been cached.
	*/
	renderAll() {
		this.globalStore.cache.forEach((log) => {
			render(log);
		});
	}
};
//#endregion
//#region ../../../node_modules/.bun/adze@2.3.0/node_modules/adze/dist/adze-global.js
var AdzeGlobal = class {
	/**
	* Global Adze configuration overrides.
	*/
	config;
	/**
	* Incrementing ID counter for identifying logs.
	*/
	pidCounter = 1;
	/**
	* All log labels.
	*/
	labels = /* @__PURE__ */ new Map();
	/**
	* Counter for incrementing listener IDs.
	*/
	_listenerCounter = 0;
	/**
	* Map of log levels to log listeners
	*/
	_levelsToListeners = /* @__PURE__ */ new Map();
	/**
	* Cache of logs that have been terminated.
	*/
	_cache = [];
	constructor(configuration = {}) {
		this.config = configuration;
	}
	/**
	* Returns the cache of logs that have been terminated.
	*/
	get cache() {
		return this._cache;
	}
	/**
	* Get the global Adze configuration overrides.
	*/
	get configuration() {
		return this.config;
	}
	/**
	* Get the next process ID.
	*/
	get pid() {
		const current = this.pidCounter;
		this.pidCounter++;
		return current;
	}
	/**
	* Tools for rerendering and filtering cached logs.
	*/
	get tools() {
		return new Tools(this);
	}
	/**
	* Adds a log to the log cache.
	*/
	addLogToCache(log) {
		if (this._cache.length < (this.config.cacheSize ?? 300)) this._cache.push(log);
	}
	/**
	* Clears the log cache.
	*/
	clearCache() {
		this._cache = [];
	}
	/**
	* Get a label by name.
	*/
	getLabel(name) {
		return this.labels.get(name);
	}
	/**
	* Sets a new label or overwrites an existing one.
	*/
	setLabel(name, label) {
		this.labels.set(name, label);
	}
	/**
	* Adds a log listener that will be called after a log has been terminated.
	*/
	addListener(levels, listener) {
		const id = this._listenerCounter += 1;
		normalizeLevelSelector({
			...defaultConfiguration.levels,
			...this.config.levels ?? {}
		}, levels).forEach((level) => {
			if (this._levelsToListeners.has(level)) this._levelsToListeners.get(level).set(id, listener);
			else this._levelsToListeners.set(level, /* @__PURE__ */ new Map([[id, listener]]));
		});
		return id;
	}
	/**
	* Removes a log listener by its ID.
	*/
	removeListener(id) {
		this._levelsToListeners.forEach((levelContainer) => {
			levelContainer.delete(id);
		});
	}
	/**
	* Returns an array of log listener callback functions.
	*/
	getListeners(level) {
		return Array.from(this._levelsToListeners.get(level)?.values() ?? []);
	}
};
//#endregion
//#region ../../../node_modules/.bun/adze@2.3.0/node_modules/adze/dist/functions/global.js
/**
* Initialize the global log store for Adze. This is used for creating global configuration
* overrides, storing labels, and optionally caching logs.
*/
function setup(cfg) {
	globalThis.$adzeGlobal = new AdzeGlobal(cfg);
	return globalThis.$adzeGlobal;
}
/**
* Gets the global store context or initializes a new one if it doesn't exist.
*/
function getGlobal(cfg) {
	const store = globalThis.$adzeGlobal;
	if (isGlobalInitialized(store)) return store;
	const globalCtxt = new AdzeGlobal(cfg);
	globalThis.$adzeGlobal = globalCtxt;
	return globalCtxt;
}
/**
* Removes the global log store from the environment.
*/
function teardown() {
	if (isGlobalInitialized(globalThis.$adzeGlobal)) delete globalThis.$adzeGlobal;
}
/**
* Adze global store has been instantiated.
*/
function isGlobalInitialized(global) {
	return global instanceof AdzeGlobal;
}
/**
* Validates that the current environment is `Window`.
*/
function isBrowser() {
	return typeof window !== "undefined" && typeof window.location !== "undefined" && typeof window.navigator.userAgent !== "undefined" && !isDeno();
}
/**
* Validates that the current environment is Deno.
*/
function isDeno() {
	return typeof Deno !== "undefined";
}
/**
* TypeGuard to determine if the env value is the Window object.
*/
function envIsWindow(_) {
	return isBrowser();
}
/**
* Determines if the current environment is an Adze test environment.
*/
function isTestEnvironment() {
	let urlAdzeEnvTest = false;
	if (isBrowser()) urlAdzeEnvTest = new URLSearchParams(globalThis.location.search).get("ADZE_ENV") === "test";
	return globalThis.$ADZE_ENV === "test" || urlAdzeEnvTest;
}
/**
* Validates the current environment is Firefox.
*/
function isFirefox() {
	const _glbl = globalThis;
	if (envIsWindow(_glbl)) return _glbl.navigator.userAgent.includes("Firefox");
	return false;
}
//#endregion
//#region ../../../node_modules/.bun/adze@2.3.0/node_modules/adze/dist/functions/type-guards.js
/**
* Type guard to validate that the value is a string.
*/
function isString(value) {
	return Object.prototype.toString.call(value) === "[object String]";
}
/**
* Type Guard to validate that the value is a number.
*/
function isNumber(value) {
	return value !== null && typeof value === "number" && !isNaN(Number(value));
}
/**
* Type guard to determine if a console method is a common method.
*/
function isMethodWithArgs(value) {
	return methodsWithArgs.includes(value);
}
/**
* Type guard to determine if a console method is a special method.
*/
function isSpecialMethod(value) {
	return specialMethods.includes(value);
}
/**
* Type guard to determine if a console method is a special method with a leader.
*/
function isSpecialMethodWithLeader(value) {
	return specialMethodsWithArgsAndLeader.includes(value);
}
/**
* Type guard to determine if the value is an array of strings.
*/
function isStringArray(value) {
	return value.every((v) => isString(v));
}
/**
* Type guard to determine if the value is a range tuple.
*/
function isRange(value) {
	return Array.isArray(value) && value.length === 3 && value[1] === "-";
}
//#endregion
//#region ../../../node_modules/.bun/adze@2.3.0/node_modules/adze/dist/functions/data.js
/**
* Generates a stacktrace and returns it.
*/
function stacktrace() {
	return Error().stack?.replace(/^Error\n/, "\n");
}
/**
* Returns the active level number from the provided level identifier.
*/
function getActiveLevel(cfg) {
	if (isNumber(cfg.activeLevel)) return cfg.activeLevel;
	return cfg.levels[cfg.activeLevel].level;
}
//#endregion
//#region ../../../node_modules/.bun/adze@2.3.0/node_modules/adze/dist/functions/picocolors-loader.js
var import_picocolors_browser = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
	var x = String;
	var create = function() {
		return {
			isColorSupported: false,
			reset: x,
			bold: x,
			dim: x,
			italic: x,
			underline: x,
			inverse: x,
			hidden: x,
			strikethrough: x,
			black: x,
			red: x,
			green: x,
			yellow: x,
			blue: x,
			magenta: x,
			cyan: x,
			white: x,
			gray: x,
			bgBlack: x,
			bgRed: x,
			bgGreen: x,
			bgYellow: x,
			bgBlue: x,
			bgMagenta: x,
			bgCyan: x,
			bgWhite: x,
			blackBright: x,
			redBright: x,
			greenBright: x,
			yellowBright: x,
			blueBright: x,
			magentaBright: x,
			cyanBright: x,
			whiteBright: x,
			bgBlackBright: x,
			bgRedBright: x,
			bgGreenBright: x,
			bgYellowBright: x,
			bgBlueBright: x,
			bgMagentaBright: x,
			bgCyanBright: x,
			bgWhiteBright: x
		};
	};
	module.exports = create();
	module.exports.createColors = create;
})))(), 1);
var picocolors = import_picocolors_browser.default ?? import_picocolors_browser;
//#endregion
//#region ../../../node_modules/.bun/adze@2.3.0/node_modules/adze/dist/functions/util.js
/**
* Capitalizes the first character of the provided string.
*/
function initialCaps(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}
/**
* Get all of the available level numbers.
*/
function allLevels(levels) {
	return Object.values(levels).map((level) => level.level);
}
/**
* Make a range of numbers from the start to the end.
*/
function makeRange(allLevels, start, end) {
	return allLevels.filter((level) => level >= start && level <= end);
}
/**
* Add spaces to the end of a log title to make them all align.
*/
function addPadding(str, withEmoji = false, emoji) {
	const diff = (withEmoji && emoji ? 9 + emoji.length : 9) - str.length;
	let padded = str;
	for (let i = 0; i <= diff; i += 1) padded += " ";
	return padded;
}
/**
* Applies array of console styles to the provided string. An optional terminal color fidelity
* value can be passed to enable different color fidelities for different terminals.
*
* Refer to https://github.com/alexeyraspopov/picocolors#usage
*/
function applyStyles(str, styles) {
	return styles.reduce((acc, style) => {
		return picocolors[style](acc);
	}, str);
}
/**
* Render a log from its log data.
*/
function render(log) {
	if (log.data) console[log.data.method](...log.data.message);
}
/**
* Removes empty strings from a message array.
*/
function cleanMessage(message) {
	return message.filter((msg) => msg !== "");
}
/**
* Determines if the provided value is an object.
*/
function isObject(val) {
	return typeof val === "object" && val !== null;
}
//#endregion
//#region ../../../node_modules/.bun/adze@2.3.0/node_modules/adze/dist/functions/filters.js
/**
* Normalize a level filter value to an array of log level numbers.
*/
function normalizeLevelSelector(levels, selector) {
	if (selector === "*") return Object.values(levels).map((lvl) => lvl.level);
	if (isString(selector)) return [levels[selector].level];
	if (isNumber(selector)) return [selector];
	if (isRange(selector)) {
		if (isStringArray(selector)) {
			const start = levels[selector[0]].level;
			const end = levels[selector[2]].level;
			return makeRange(allLevels(levels), start, end);
		}
		return makeRange(allLevels(levels), selector[0], selector[2]);
	}
	if (Array.isArray(selector) && isStringArray(selector)) return selector.map((f) => levels[f].level);
	return selector;
}
/**
* Is the provided level filtered out?
*/
function failsLevelSelector(type, levels, level) {
	if (levels.length === 0) return false;
	return type === "include" ? !levels.includes(level) : levels.includes(level);
}
/**
* Allow only values that are in the include list. If no values are found in the include list,
* the result is false.
*/
function isNotIncluded(source, values) {
	if (source.length === 0) return false;
	if (source.length > 0 && values.length === 0) return true;
	return !values.map((v) => source.includes(v)).includes(true);
}
/**
* Allow only values that are not in the exclude list. If one or more values are found in the
* exclude list, the result is false.
*/
function isExcluded(source, values) {
	if (source.length === 0) return false;
	if (source.length > 0 && values.length === 0) return true;
	return values.map((v) => source.includes(v)).includes(true);
}
/**
* Returns an array of Log instances that have the provided label.
*/
function filterByLabel(label, logs) {
	return logs.filter((log) => log.data?.label?.name === label);
}
/**
* Filters an array of Log instances that contain the provided namespaces.
*/
function filterByNamespace(namespace, logs) {
	return logs.filter((log) => {
		if (log.data?.namespace) return log.data.namespace.map((ns) => namespace.includes(ns)).includes(true);
		return false;
	});
}
function filterByLevel(level, logs) {
	return logs.filter((log) => {
		const levels = normalizeLevelSelector(log.configuration.levels, level);
		if (log.data?.level === void 0) return false;
		return failsLevelSelector("exclude", levels, log.data.level);
	});
}
//#endregion
//#region ../../../node_modules/.bun/adze@2.3.0/node_modules/adze/dist/functions/formatters.js
/**
* Formats an array of namespace values into a display string for printing.
*/
function formatNamespace(ns) {
	if (ns && ns.length > 0) return ns.reduce((acc, name) => `${acc}#${name} `, "");
	return "";
}
/**
* Formats label text for printing.
*/
function formatLabel(lbl) {
	return lbl ? `[${lbl.name}] ` : "";
}
/**
* Formats the log count for printing.
*/
function formatCount(count) {
	return count !== void 0 ? `(Count: ${count}) ` : "";
}
/**
* Formats the assertion result for printing.
*/
function formatAssert(expression, withEmoji) {
	return expression !== void 0 && !expression ? `${withEmoji ? "❌ " : ""}Assertion failed:` : "";
}
/**
* Formats the if statement result for printing.
*/
function formatIf(expression, withEmoji) {
	return expression !== void 0 && expression ? `${withEmoji ? "✅ " : ""}Expression passed:` : "";
}
//#endregion
//#region ../../../node_modules/.bun/@ungap+structured-clone@1.2.0/node_modules/@ungap/structured-clone/esm/deserialize.js
var env = typeof self === "object" ? self : globalThis;
var deserializer = ($, _) => {
	const as = (out, index) => {
		$.set(index, out);
		return out;
	};
	const unpair = (index) => {
		if ($.has(index)) return $.get(index);
		const [type, value] = _[index];
		switch (type) {
			case 0:
			case -1: return as(value, index);
			case 1: {
				const arr = as([], index);
				for (const index of value) arr.push(unpair(index));
				return arr;
			}
			case 2: {
				const object = as({}, index);
				for (const [key, index] of value) object[unpair(key)] = unpair(index);
				return object;
			}
			case 3: return as(new Date(value), index);
			case 4: {
				const { source, flags } = value;
				return as(new RegExp(source, flags), index);
			}
			case 5: {
				const map = as(/* @__PURE__ */ new Map(), index);
				for (const [key, index] of value) map.set(unpair(key), unpair(index));
				return map;
			}
			case 6: {
				const set = as(/* @__PURE__ */ new Set(), index);
				for (const index of value) set.add(unpair(index));
				return set;
			}
			case 7: {
				const { name, message } = value;
				return as(new env[name](message), index);
			}
			case 8: return as(BigInt(value), index);
			case "BigInt": return as(Object(BigInt(value)), index);
		}
		return as(new env[type](value), index);
	};
	return unpair;
};
/**
* @typedef {Array<string,any>} Record a type representation
*/
/**
* Returns a deserialized value from a serialized array of Records.
* @param {Record[]} serialized a previously serialized value.
* @returns {any}
*/
var deserialize = (serialized) => deserializer(/* @__PURE__ */ new Map(), serialized)(0);
//#endregion
//#region ../../../node_modules/.bun/@ungap+structured-clone@1.2.0/node_modules/@ungap/structured-clone/esm/serialize.js
var EMPTY = "";
var { toString } = {};
var { keys } = Object;
var typeOf = (value) => {
	const type = typeof value;
	if (type !== "object" || !value) return [0, type];
	const asString = toString.call(value).slice(8, -1);
	switch (asString) {
		case "Array": return [1, EMPTY];
		case "Object": return [2, EMPTY];
		case "Date": return [3, EMPTY];
		case "RegExp": return [4, EMPTY];
		case "Map": return [5, EMPTY];
		case "Set": return [6, EMPTY];
	}
	if (asString.includes("Array")) return [1, asString];
	if (asString.includes("Error")) return [7, asString];
	return [2, asString];
};
var shouldSkip = ([TYPE, type]) => TYPE === 0 && (type === "function" || type === "symbol");
var serializer = (strict, json, $, _) => {
	const as = (out, value) => {
		const index = _.push(out) - 1;
		$.set(value, index);
		return index;
	};
	const pair = (value) => {
		if ($.has(value)) return $.get(value);
		let [TYPE, type] = typeOf(value);
		switch (TYPE) {
			case 0: {
				let entry = value;
				switch (type) {
					case "bigint":
						TYPE = 8;
						entry = value.toString();
						break;
					case "function":
					case "symbol":
						if (strict) throw new TypeError("unable to serialize " + type);
						entry = null;
						break;
					case "undefined": return as([-1], value);
				}
				return as([TYPE, entry], value);
			}
			case 1: {
				if (type) return as([type, [...value]], value);
				const arr = [];
				const index = as([TYPE, arr], value);
				for (const entry of value) arr.push(pair(entry));
				return index;
			}
			case 2: {
				if (type) switch (type) {
					case "BigInt": return as([type, value.toString()], value);
					case "Boolean":
					case "Number":
					case "String": return as([type, value.valueOf()], value);
				}
				if (json && "toJSON" in value) return pair(value.toJSON());
				const entries = [];
				const index = as([TYPE, entries], value);
				for (const key of keys(value)) if (strict || !shouldSkip(typeOf(value[key]))) entries.push([pair(key), pair(value[key])]);
				return index;
			}
			case 3: return as([TYPE, value.toISOString()], value);
			case 4: {
				const { source, flags } = value;
				return as([TYPE, {
					source,
					flags
				}], value);
			}
			case 5: {
				const entries = [];
				const index = as([TYPE, entries], value);
				for (const [key, entry] of value) if (strict || !(shouldSkip(typeOf(key)) || shouldSkip(typeOf(entry)))) entries.push([pair(key), pair(entry)]);
				return index;
			}
			case 6: {
				const entries = [];
				const index = as([TYPE, entries], value);
				for (const entry of value) if (strict || !shouldSkip(typeOf(entry))) entries.push(pair(entry));
				return index;
			}
		}
		const { message } = value;
		return as([TYPE, {
			name: type,
			message
		}], value);
	};
	return pair;
};
/**
* @typedef {Array<string,any>} Record a type representation
*/
/**
* Returns an array of serialized Records.
* @param {any} value a serializable value.
* @param {{json?: boolean, lossy?: boolean}?} options an object with a `lossy` or `json` property that,
*  if `true`, will not throw errors on incompatible types, and behave more
*  like JSON stringify would behave. Symbol and Function will be discarded.
* @returns {Record[]}
*/
var serialize = (value, { json, lossy } = {}) => {
	const _ = [];
	return serializer(!(json || lossy), !!json, /* @__PURE__ */ new Map(), _)(value), _;
};
//#endregion
//#region ../../../node_modules/.bun/@ungap+structured-clone@1.2.0/node_modules/@ungap/structured-clone/esm/index.js
/**
* @typedef {Array<string,any>} Record a type representation
*/
/**
* Returns an array of serialized Records.
* @param {any} any a serializable value.
* @param {{transfer?: any[], json?: boolean, lossy?: boolean}?} options an object with
* a transfer option (ignored when polyfilled) and/or non standard fields that
* fallback to the polyfill if present.
* @returns {Record[]}
*/
var esm_default = typeof structuredClone === "function" ? 
/* c8 ignore start */
(any, options) => options && ("json" in options || "lossy" in options) ? deserialize(serialize(any, options)) : structuredClone(any) : (any, options) => deserialize(serialize(any, options));
//#endregion
//#region ../../../node_modules/.bun/adze@2.3.0/node_modules/adze/dist/functions/seal.js
/**
* A mixin function for creating a sealed log instance that inherits properties from the parent.
*/
function SealedLog(Base, cfg, mods, modifierQueue) {
	const { formatters, middleware = [], ...cfgWithoutFormatters } = cfg.exportValues();
	return class Sealing extends Base {
		_cfg = new Configuration({
			...esm_default(cfgWithoutFormatters),
			formatters: { ...formatters },
			middleware: [...middleware]
		});
		_modifierData = esm_default(mods);
		modifierQueue = [...modifierQueue];
	};
}
//#endregion
//#region ../../../node_modules/.bun/adze@2.3.0/node_modules/adze/dist/functions/time.js
/**
* Takes an HrTime tuple and converts it into a human-readable formatted
* string in the format of `{sec}s {ms}ms`.
*/
function formatTime([sec, nano]) {
	return `${sec}s ${nano / 1e6}ms`;
}
/**
* Generates the current execution time.
*/
function captureTimeNow() {
	return formatTime(hrtime());
}
/**
* Browser implementation of the node hrtime function for recording elapsed time.
*/
function hrtime(prev) {
	const time = performance.now() * .001;
	const seconds = Math.floor(time);
	const nanoseconds = Math.floor(time % 1 * 1e9);
	if (prev === void 0) return [seconds, nanoseconds];
	let secondsDiff = seconds - prev[0];
	let nanosecondsDiff = nanoseconds - prev[1];
	if (nanosecondsDiff < 0) {
		secondsDiff -= 1;
		nanosecondsDiff += 1e9;
	}
	return [secondsDiff, nanosecondsDiff];
}
/**
* Generates an ISO-8601 formatted string with timezone offset.
*/
function dateFormatISO(date) {
	const pad = (n) => `${Math.floor(Math.abs(n))}`.padStart(2, "0");
	const tzOffset = -date.getTimezoneOffset();
	const timezone = `${tzOffset >= 0 ? "+" : "-"}${pad(tzOffset / 60)}:${pad(tzOffset % 60)}`;
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${timezone}`;
}
/**
* Generates a timestamp in the common log format (`'dd/MMM/yyyy:HH:mm:ss xx'`).
*/
function dateFormatCommon(date) {
	const pad = (num, size = 2) => String(num).padStart(size, "0");
	const day = pad(date.getDate());
	const month = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	][date.getMonth()];
	const year = date.getFullYear();
	const hours = pad(date.getHours());
	const minutes = pad(date.getMinutes());
	const seconds = pad(date.getSeconds());
	const tzOffset = -date.getTimezoneOffset();
	const sign = tzOffset >= 0 ? "+" : "-";
	const absOffset = Math.abs(tzOffset);
	return `${day}/${month}/${year}:${hours}:${minutes}:${seconds} ${`${sign}${pad(Math.floor(absOffset / 60))}${pad(absOffset % 60)}`}`;
}
//#endregion
//#region ../../../node_modules/.bun/adze@2.3.0/node_modules/adze/dist/formatters/formatter.js
/**
* The base class for all adze log formatters.
*/
var Formatter = class {
	/**
	* The configuration for the adze log.
	*/
	cfg;
	/**
	* The log level configuration.
	*/
	level;
	/**
	* The default timestamp formatter. Override this to customize for your own formatter.
	*/
	timestampFormatFunction = (date) => dateFormatISO(date);
	constructor(cfg, level) {
		this.cfg = cfg;
		this.level = level;
	}
	/**
	* Returns the timestamp formatter override function or the timestamp formatter function from
	* this formatter instance.
	*/
	get timestampFormatter() {
		return this.cfg.timestampFormatter ? this.cfg.timestampFormatter : this.timestampFormatFunction;
	}
	/**
	* Entry point to printing logs.
	*/
	print(mods, timestamp, args) {
		if (this.level.level > getActiveLevel(this.cfg)) return [];
		if (this.failsFilters(mods)) return [];
		if (mods.assertion === true) return [];
		if (mods.if === false) return [];
		if (mods.method && !isSpecialMethodWithLeader(mods.method)) {
			if (isSpecialMethod(mods.method) && isMethodWithArgs(mods.method)) return args;
		}
		const message = isBrowser() ? this.formatBrowser(mods, timestamp, args) : this.formatServer(mods, timestamp, args);
		if (mods.stacktrace) message.push(mods.stacktrace);
		return message;
	}
	failsFilters(mods) {
		if (this.failsLevelSelector()) return true;
		if (this.failsNamespacesFilter(mods)) return true;
		if (this.failsLabelsFilter(mods)) return true;
		return false;
	}
	/**
	* Validate that if a level filter is set the log passes the filter.
	*/
	failsLevelSelector() {
		if (this.cfg.filters?.levels === void 0) return false;
		const normalizedLevelSelector = normalizeLevelSelector(this.cfg.levels, this.cfg.filters.levels.values);
		if (failsLevelSelector(this.cfg.filters.levels.type, normalizedLevelSelector, this.level.level)) return true;
		return false;
	}
	/**
	* Validate that if a namespaces filter is set the log passes the filter.
	*/
	failsNamespacesFilter(mods) {
		if (this.cfg.filters?.namespaces === void 0) return false;
		if (this.cfg.filters.namespaces.values.length > 0 && mods.namespace === void 0) return true;
		if (this.cfg.filters.namespaces.type === "include") {
			const namespaces = mods.namespace ?? [];
			return isNotIncluded(this.cfg.filters.namespaces.values, namespaces);
		}
		const namespaces = mods.namespace ?? [];
		return isExcluded(this.cfg.filters.namespaces.values, namespaces);
	}
	/**
	* Validate that if a labels filter is set the log passes the filter.
	*/
	failsLabelsFilter(mods) {
		if (this.cfg.filters?.labels === void 0) return false;
		if (this.cfg.filters.labels.values.length > 0 && mods.label === void 0) return true;
		const label = mods.label ? [mods.label.name] : [];
		if (this.cfg.filters.labels.type === "include") return isNotIncluded(this.cfg.filters.labels.values, label);
		return isExcluded(this.cfg.filters.labels.values, label);
	}
};
//#endregion
//#region ../../../node_modules/.bun/adze@2.3.0/node_modules/adze/dist/formatters/common/common.js
/**
* Formats log messages according to the common log standard.
*
* https://en.wikipedia.org/wiki/Common_Log_Format
*/
var CommonFormatter = class extends Formatter {
	/**
	* Format the date in the strftime format.
	*
	* - strftime pattern: `%d/%b/%Y:%H:%M:%S %z`
	* - date-fns pattern: `dd/MMM/yyyy:HH:mm:ss xx`
	*/
	timestampFormatFunction = (date) => dateFormatCommon(date);
	/**
	* Format the log message for the browser.
	*/
	formatBrowser(mods, timestamp, args) {
		return this.formatMessage(mods, timestamp, args);
	}
	/**
	* Format the log message for the server environment.
	*/
	formatServer(mods, timestamp, args) {
		return this.formatMessage(mods, timestamp, args);
	}
	/**
	* Format the log message according to the common log format.
	*
	* **Example:** 127.0.0.1 user-identifier frank [10/Oct/2000:13:55:36 -0700] "GET /apache_pb.gif HTTP/1.0" 200 2326
	*/
	formatMessage(_, timestamp, args) {
		if (this.cfg.meta.hostname === void 0) console.warn(/* @__PURE__ */ new Error("Adze: 'hostname' is required for the common log format. Please provide this value in your log's meta data."));
		return [`${this.cfg.meta.hostname} ${this.cfg.meta.ident ?? "-"} ${this.cfg.meta.user ?? "-"} [${timestamp}] ${args[0]}`];
	}
};
//#endregion
//#region ../../../node_modules/.bun/adze@2.3.0/node_modules/adze/dist/formatters/common/index.js
var common_default = CommonFormatter;
//#endregion
//#region ../../../node_modules/.bun/adze@2.3.0/node_modules/adze/dist/formatters/json/type-guards.js
/**
* Validates that the log meta data contains the required fields for a JSON log.
*/
function hasRequiredFields(meta) {
	return typeof meta.name === "string" && typeof meta.hostname === "string";
}
//#endregion
//#region ../../../node_modules/.bun/adze@2.3.0/node_modules/adze/dist/formatters/json/json.js
/**
* Formats log messages in machine-readable JSON format.
*/
var JsonFormatter = class extends Formatter {
	/**
	* Format the date in the ISO8601 format by default.
	*/
	timestampFormatFunction = (date) => dateFormatISO(date);
	/**
	* Format the log message for the browser.
	*/
	formatBrowser(mods, timestamp, args) {
		return this.formatMessage(mods, timestamp, args);
	}
	/**
	* Format the log message for the server.
	*/
	formatServer(mods, timestamp, args) {
		return this.formatMessage(mods, timestamp, args);
	}
	/**
	* Format the log message for NDJSON lines.
	*/
	formatMessage(mods, timestamp, _args) {
		const global = getGlobal();
		const args = [..._args];
		const msg = args.shift();
		if (hasRequiredFields(this.cfg.meta)) {
			const { src, err, req_id, req, res, latency, hostname, name, ...meta } = this.cfg.meta;
			const { namespace, label } = mods;
			const json = {
				v: 1,
				level: this.level.level,
				levelName: this.level.levelName,
				name,
				hostname,
				msg,
				args,
				pid: global.pid,
				time: timestamp,
				meta: Object.keys(meta).length > 0 ? meta : void 0,
				namespace,
				label: label?.name,
				src,
				err,
				req_id,
				req,
				res,
				latency
			};
			try {
				let result;
				if (this.cfg.autoSerialize) {
					const serializer = this.cfg.customReplacer ?? autoSerializer;
					result = JSON.stringify(json, serializer);
				} else result = JSON.stringify(json);
				return [result];
			} catch (e) {
				console.warn("Adze: Failed to stringify log message to JSON format. Returning original args. Be sure to use the appropriate serializer functions for errors, requests, and responses. More info: https://adzejs.com/reference/formatters.html#jsonlogformatmeta-serializer-functions\n\n", e);
				return [...args];
			}
		}
		console.warn(/* @__PURE__ */ new Error("Adze: Required fields are missing from the log meta for generating a JSON log. If using TypeScript, use the JsonLogFormatMeta type for type safety. More info: https://adzejs.com/reference/formatters.html#jsonlogformatmeta-interface"));
		return [...args];
	}
};
/**
* Auto-serializes certain types of objects for JSON stringification.
*/
function autoSerializer(_key, value) {
	if (typeof value === "bigint") return value.toString();
	if (value instanceof Error) return {
		name: value.name,
		message: value.message,
		stack: value.stack
	};
	if (value instanceof Date) return value.toISOString();
	if (value instanceof Map) return Object.fromEntries(value);
	if (value instanceof Set) return Array.from(value);
	if (ArrayBuffer.isView(value)) return Array.from(value);
	if (typeof value === "function" || typeof value === "symbol" || value === void 0) return;
	return value;
}
//#endregion
//#region ../../../node_modules/.bun/adze@2.3.0/node_modules/adze/dist/formatters/json/functions.js
/**
* Serializes a Request object into a JSON Log HTTP Request object.
*
* If `true` is passed as the second parameter, it will attempt to extract the username from the
* request headers for base64 encoded basic authorization only. All other forms of authorization
* will return `undefined`.
*
* NOTICE: The "Authorization" header will always be excluded.
*/
async function serializeRequest(request, includeUsername = false) {
	const url = new URL(request.url);
	const json = await request.json();
	return {
		headers: getHeaders(request.headers),
		method: request.method,
		url: request.url,
		body: json ? JSON.stringify(json) : void 0,
		remoteAddress: url.host.split(":")[0],
		remotePort: getPortFromUrl(url),
		username: includeUsername ? getUsername(request.headers) : void 0
	};
}
/**
* Takes a URL and attempts to extract the port number from it. If a port is not specified, it will
* attempt to return the corresponding HTTP port. If the protocol is not HTTP or HTTPS, it will
* return `undefined`.
*/
function getPortFromUrl(url) {
	return url.port ? parseInt(url.port) : void 0;
}
/**
* Converts a Headers object to a plain object.
*/
function getHeaders(headers) {
	const headerObj = {};
	headers.forEach((v, k) => headerObj[k] = v);
	const { Authorization, authorization, ...rest } = headerObj;
	return rest;
}
/**
* Attempts to extract a username from a basic Authorization header that is base64 encoded.
* If another type of authorization is used, such as JWT, it will return `undefined`.
*/
function getUsername(headers) {
	const authorization = headers.get("Authorization");
	if (authorization) {
		const [type, encodedValue] = authorization.split(" ");
		if (type === "Basic") return atob(encodedValue).split(":")[0];
	}
}
/**
* Serializes a Response object into a JSON Log HTTP Response object.
*/
function serializeResponse(response) {
	const url = new URL(response.url);
	const headerString = Object.keys(getHeaders(response.headers)).reduce((s, k, v) => `${s}${k}: ${v}\r\n`, "");
	const header = `${url.protocol.split(":")[0].toUpperCase()} ${response.status} ${response.statusText}\r\n${headerString}\r\n`;
	return {
		statusCode: response.status,
		header
	};
}
/**
* Serializes an Error object into a JSON Log Error object that is compatible with JsonLogFormatMeta.
*/
function serializeError(error) {
	return {
		message: error.message,
		name: error.name,
		stack: error.stack
	};
}
//#endregion
//#region ../../../node_modules/.bun/adze@2.3.0/node_modules/adze/dist/formatters/json/index.js
var json_default = JsonFormatter;
//#endregion
//#region ../../../node_modules/.bun/adze@2.3.0/node_modules/adze/dist/formatters/pretty/pretty.js
/**
* Formats log messages in a pretty, human-readable manner.
*/
var PrettyFormatter = class extends Formatter {
	/**
	* Format the log message for the browser.
	*/
	formatBrowser(mods, timestamp, args) {
		const leader = this.formatLeader();
		const meta = this.formatMeta(mods, timestamp);
		if (this.cfg.withEmoji) return [
			leader,
			"font-size: 12px;",
			this.level.style,
			meta,
			...args
		];
		return [
			leader,
			this.level.style,
			meta,
			...args
		];
	}
	/**
	* Format the log message for the server environment.
	*/
	formatServer(mods, timestamp, args) {
		const message = [];
		const leader = `${addPadding(this.formatLeader(false), this.cfg.withEmoji, this.level.emoji)} `;
		const meta = this.formatMeta(mods, timestamp);
		const styledLeader = applyStyles(leader, this.level.terminalStyle);
		message.push(styledLeader);
		meta !== "" && message.push(meta);
		return [
			styledLeader,
			meta,
			...args
		];
	}
	/**
	* Returns a formatted leader string.
	*/
	formatLeader(isBrowser = true) {
		const tag = isBrowser ? "%c" : "";
		const name = " " + initialCaps(this.level.levelName);
		if (this.cfg.withEmoji) return `${tag}${this.formatEmoji(isBrowser)}${tag}${name}`;
		return `${tag}${name}`;
	}
	/**
	* Formats the emoji if it is enabled.
	*/
	formatEmoji(isBrowser) {
		const space = isBrowser ? " " : "";
		return this.level.emoji ? `${this.level.emoji}${space}` : "";
	}
	/**
	* Returns a formatted log meta data string. This is not data defined by the meta modifier.
	*/
	formatMeta(mods, timestamp) {
		const ts = this.cfg.showTimestamp ? `${timestamp} ` : "";
		const ns = formatNamespace(mods.namespace);
		const lbl = formatLabel(mods.label);
		const time = this.formatTime(mods);
		const cnt = formatCount(mods.label?.count);
		const asrt = formatAssert(mods.assertion, this.cfg.withEmoji);
		const _if = formatIf(mods.if, this.cfg.withEmoji);
		const tst = asrt !== "" ? asrt : _if !== "" ? _if : "";
		return ts + ns + lbl + time + cnt + tst;
	}
	/**
	* Formats the time elapsed string.
	*/
	formatTime(mods) {
		const timeLeader = this.cfg.withEmoji ? "⏱ " : "Time elapsed: ";
		if (mods.timeNow) return `(${timeLeader}${mods.timeNow})`;
		return mods.label?.timeElapsed ? `(${timeLeader}${mods.label.timeElapsed})` : "";
	}
};
//#endregion
//#region ../../../node_modules/.bun/adze@2.3.0/node_modules/adze/dist/formatters/pretty/index.js
var pretty_default = PrettyFormatter;
//#endregion
//#region ../../../node_modules/.bun/adze@2.3.0/node_modules/adze/dist/formatters/standard/standard.js
/**
* Formats log messages for stdout lines.
*
* **Example:** `[2013-01-04T19:01:18.241Z]  INFO: myapp/40208 on banana.local: hi`
*/
var StandardFormatter = class extends Formatter {
	/**
	* Format the date in the ISO8601 format by default.
	*/
	timestampFormatFunction = (date) => dateFormatISO(date);
	/**
	* Format the log message for the browser.
	*/
	formatBrowser(mods, timestamp, args) {
		return this.formatMessage(timestamp, mods, args);
	}
	/**
	* Format the log message for the server.
	*/
	formatServer(mods, timestamp, args) {
		return this.formatMessage(timestamp, mods, args);
	}
	/**
	* Format the log message for stdout lines.
	*/
	formatMessage(timestamp, mods, args) {
		let leader = "";
		const { appname, hostname, port } = this.cfg.meta;
		const _port = isNumber(port) ? `/${port}` : "";
		leader = `${isString(appname) ? `${appname}${_port}` : ""}${isString(hostname) ? ` on ${hostname}: ` : ""}${this.formatNamespace(mods.namespace)}${mods.label ? `[${mods.label.name}] ` : ""}`;
		return [`[${timestamp}] ${this.level.levelName.toUpperCase()}: ${leader}${args[0]} `, args.map((arg) => isObject(arg) ? JSON.stringify(arg) : arg).slice(1).join(" ")];
	}
	/**
	* Formats the namespaces for the log message.
	*/
	formatNamespace(namespace) {
		if (namespace && namespace.length > 0) return `${namespace.reduce((acc, mod, index) => {
			return index === namespace.length - 1 ? `${acc}${mod}` : `${acc}${mod}/`;
		}, "")} `;
		return "";
	}
};
//#endregion
//#region ../../../node_modules/.bun/adze@2.3.0/node_modules/adze/dist/constants.js
/**
* All valid log terminators. These are the terminators that can be called to end a log chain.
*/
var terminators = [
	"alert",
	"error",
	"warn",
	"info",
	"fail",
	"success",
	"log",
	"debug",
	"verbose",
	"custom",
	"clear",
	"clr",
	"close",
	"thread"
];
/**
* All valid default log levels.
*/
var levels = [
	"alert",
	"error",
	"warn",
	"info",
	"fail",
	"success",
	"log",
	"debug",
	"verbose"
];
/**
* Console methods that have alternative behaviors and take arguments and can be printed with a styled leader.
*/
var specialMethodsWithArgsAndLeader = ["group", "groupCollapsed"];
/**
* Console methods that have alternative behaviors and take arguments.
*/
var specialMethodsWithArgs = [
	"dir",
	"dirxml",
	"table",
	...specialMethodsWithArgsAndLeader
];
/**
* Methods that accept at least one argument as the first argument.
*/
var methodsWithArgs = [
	"error",
	"warn",
	"info",
	"log",
	"debug",
	...specialMethodsWithArgs
];
/**
* Console methods that have alternative behaviors and do not take arguments.
*/
var specialMethodsWithoutArgs = ["clear", "groupEnd"];
/**
* All uncommon standard methods.
*/
var specialMethods = [...specialMethodsWithArgs, ...specialMethodsWithoutArgs];
/**
* All valid native browser methods utilized by Adze.
*/
var methods = [...methodsWithArgs, ...specialMethodsWithoutArgs];
/**
* All valid log modifier names.
*/
var modifiers = [
	"assert",
	"count",
	"countClear",
	"countReset",
	"closeThread",
	"dir",
	"dirxml",
	"dump",
	"format",
	"group",
	"groupCollapsed",
	"groupEnd",
	"if",
	"label",
	"meta",
	"namespace",
	"silent",
	"table",
	"time",
	"timeEnd",
	"timeNow",
	"timestamp",
	"trace",
	"withEmoji"
];
/**
* All valid log formats. These determine the style that is emitted.
*/
var formats = [
	"pretty",
	"prettyEmoji",
	"json",
	"standard",
	"common",
	"default"
];
var defaultConfiguration = {
	activeLevel: "log",
	autoSerialize: true,
	cache: false,
	cacheSize: 300,
	dump: false,
	format: "pretty",
	meta: {},
	middleware: [],
	showTimestamp: false,
	silent: false,
	withEmoji: false,
	levels: {
		alert: getAlertConfig(),
		error: getErrorConfig(),
		warn: getWarnConfig(),
		info: getInfoConfig(),
		fail: getFailConfig(),
		success: getSuccessConfig(),
		log: getLogConfig(),
		debug: getDebugConfig(),
		verbose: getVerboseConfig()
	},
	formatters: {
		default: pretty_default,
		pretty: pretty_default,
		standard: StandardFormatter,
		common: common_default,
		json: json_default
	}
};
/**
* Default log configuration for alert logs.
*/
function getAlertConfig(overrides = {}) {
	return {
		levelName: "alert",
		level: 0,
		style: `padding-right: 24px; font-size: 12px; border-radius: 4px; background: linear-gradient(to right, #fc8585, #fc2323); color: #fff; border-color: #b70101;`,
		terminalStyle: [
			"white",
			"bold",
			"bgRed"
		],
		method: "error",
		emoji: "🚨",
		...overrides
	};
}
/**
* Default log configuration for error logs.
*/
function getErrorConfig(overrides = {}) {
	return {
		levelName: "error",
		level: 1,
		style: `padding-right: 24px; font-size: 12px; border-radius: 4px; background: linear-gradient(to right, #fff, #ffd1d1); color: #a4000f; border-color: #e3bbbb;`,
		terminalStyle: ["white", "bgRed"],
		method: "error",
		emoji: "🔥",
		...overrides
	};
}
/**
* Default log configuration for warn logs.
*/
function getWarnConfig(overrides = {}) {
	return {
		levelName: "warn",
		level: 2,
		style: `font-size: 12px; border-radius: 4px;  background: linear-gradient(to right, #fff, #fff0a8); color: #715100; border-color: #e3d696; padding-right: ${isFirefox() ? "44px" : "30px"};`,
		terminalStyle: ["white", "bgYellow"],
		method: "warn",
		emoji: "🔔",
		...overrides
	};
}
/**
* Default log configuration for info logs.
*/
function getInfoConfig(overrides = {}) {
	return {
		levelName: "info",
		level: 3,
		style: `padding-right: 44px; font-size: 12px; border-radius: 4px; background: linear-gradient(to right, #d8ebff, #b2d7ff); color: #465464; border-color: #96b5d7;`,
		terminalStyle: ["white", "bgBlue"],
		method: "info",
		emoji: "ℹ️",
		...overrides
	};
}
/**
* Default log configuration for fail logs.
*/
function getFailConfig(overrides = {}) {
	return {
		levelName: "fail",
		level: 4,
		style: `padding-right: 44px; font-size: 12px; border-radius: 4px; background: linear-gradient(to right, #ffe8e8, #ffd1d1); color: #a4000f; border-color: #e3bbbb;`,
		terminalStyle: ["white", "bgRed"],
		method: "info",
		emoji: "❌",
		...overrides
	};
}
/**
* Default log configuration for success logs.
*/
function getSuccessConfig(overrides = {}) {
	return {
		levelName: "success",
		level: 5,
		style: "font-size: 12px; border-radius: 4px; padding-right: 22px; background: linear-gradient(to right, #e6f6e4, #ceedc9); color: #4e594d; border-color: #b7d1b3;",
		terminalStyle: ["white", "bgGreen"],
		method: "info",
		emoji: "🎉",
		...overrides
	};
}
/**
* Default log configuration for log logs.
*/
function getLogConfig(overrides = {}) {
	return {
		levelName: "log",
		level: 6,
		style: "font-size: 12px; border-radius: 4px; padding-right: 51px; background: linear-gradient(to right, #ecedef, #d9dce0); color: #333435; border-color: #bfc1c5;",
		terminalStyle: ["white", "bgBlackBright"],
		method: "log",
		emoji: "🪵",
		...overrides
	};
}
/**
* Default log configuration for debug logs.
*/
function getDebugConfig(overrides = {}) {
	return {
		levelName: "debug",
		level: 7,
		style: "font-size: 12px; padding-right: 36px; border-right: 1px solid #d9dce0; color: #465464; border-color: #999999;",
		terminalStyle: ["white", "bgBlack"],
		method: "debug",
		emoji: "🐞",
		...overrides
	};
}
/**
* Default log configuration for verbose logs.
*/
function getVerboseConfig(overrides = {}) {
	return {
		levelName: "verbose",
		level: 8,
		style: "font-size: 12px; padding-right: 22px; color: #999999;",
		terminalStyle: ["black", "italic"],
		method: "debug",
		emoji: "💬",
		...overrides
	};
}
//#endregion
//#region ../../../node_modules/.bun/adze@2.3.0/node_modules/adze/dist/configuration.js
/**
* This class is a proxy for getting configuration in the correct hierarchical order.
*/
var Configuration = class {
	/**
	* The log defined configuration.
	*/
	logCfg;
	/**
	* Reference to the global store configuration overrides.
	*/
	glblCfg;
	constructor(logCfg) {
		this.logCfg = logCfg ?? {};
		this.glblCfg = globalThis.$adzeGlobal?.configuration;
	}
	updateConfiguration(cfg) {
		this.logCfg = cfg;
	}
	get activeLevel() {
		return this.glblCfg?.activeLevel ?? this.logCfg.activeLevel ?? defaultConfiguration.activeLevel;
	}
	set activeLevel(level) {
		this.logCfg.activeLevel = level;
	}
	set autoSerialize(value) {
		this.logCfg.autoSerialize = value;
	}
	get autoSerialize() {
		return this.glblCfg?.autoSerialize ?? this.logCfg.autoSerialize ?? defaultConfiguration.autoSerialize;
	}
	get cache() {
		return this.glblCfg?.cache ?? this.logCfg.cache ?? defaultConfiguration.cache;
	}
	set cache(value) {
		this.logCfg.cache = value;
	}
	get cacheSize() {
		return this.glblCfg?.cacheSize ?? this.logCfg.cacheSize ?? defaultConfiguration.cacheSize;
	}
	set cacheSize(size) {
		this.logCfg.cacheSize = size;
	}
	set customReplacer(value) {
		this.logCfg.customReplacer = value;
	}
	get customReplacer() {
		return this.glblCfg?.customReplacer ?? this.logCfg.customReplacer;
	}
	get dump() {
		return this.glblCfg?.dump ?? this.logCfg.dump ?? defaultConfiguration.dump;
	}
	set dump(value) {
		this.logCfg.dump = value;
	}
	get meta() {
		return {
			...this.logCfg.meta,
			...this.glblCfg?.meta
		};
	}
	set meta(value) {
		this.logCfg.meta = value;
	}
	get silent() {
		return this.glblCfg?.silent ?? this.logCfg.silent ?? defaultConfiguration.silent;
	}
	set silent(value) {
		this.logCfg.silent = value;
	}
	get showTimestamp() {
		return this.glblCfg?.showTimestamp ?? this.logCfg.showTimestamp ?? defaultConfiguration.showTimestamp;
	}
	set showTimestamp(value) {
		this.logCfg.showTimestamp = value;
	}
	get withEmoji() {
		return this.glblCfg?.withEmoji ?? this.logCfg.withEmoji ?? defaultConfiguration.withEmoji;
	}
	set withEmoji(value) {
		this.logCfg.withEmoji = value;
	}
	get format() {
		return this.glblCfg?.format ?? this.logCfg.format ?? defaultConfiguration.format;
	}
	set format(value) {
		this.logCfg.format = value;
	}
	get levels() {
		return {
			...defaultConfiguration.levels,
			...this.logCfg.levels ?? {},
			...this.glblCfg?.levels ?? {}
		};
	}
	set levels(value) {
		this.logCfg.levels = value;
	}
	get middleware() {
		return [...this.glblCfg?.middleware ?? [], ...this.logCfg.middleware ?? []];
	}
	set middleware(value) {
		this.logCfg.middleware = value;
	}
	get filters() {
		return this.glblCfg?.filters ?? this.logCfg.filters;
	}
	set filters(value) {
		this.logCfg.filters = value;
	}
	get timestampFormatter() {
		return this.glblCfg?.timestampFormatter ?? this.logCfg.timestampFormatter;
	}
	set timestampFormatter(value) {
		this.logCfg.timestampFormatter = value;
	}
	get formatters() {
		return {
			...defaultConfiguration.formatters,
			...this.logCfg.formatters ?? {},
			...this.glblCfg?.formatters ?? {}
		};
	}
	set formatters(value) {
		this.logCfg.formatters = value;
	}
	exportValues() {
		return {
			activeLevel: this.logCfg.activeLevel,
			cache: this.logCfg.cache,
			cacheSize: this.logCfg.cacheSize,
			dump: this.logCfg.dump,
			meta: this.logCfg.meta,
			silent: this.logCfg.silent,
			showTimestamp: this.logCfg.showTimestamp,
			withEmoji: this.logCfg.withEmoji,
			format: this.logCfg.format,
			levels: this.logCfg.levels,
			middleware: this.logCfg.middleware,
			filters: this.logCfg.filters,
			timestampFormatter: this.logCfg.timestampFormatter,
			formatters: this.logCfg.formatters
		};
	}
};
//#endregion
//#region ../../../node_modules/.bun/adze@2.3.0/node_modules/adze/dist/log.js
function isCallback(maybeFunction) {
	return typeof maybeFunction === "function";
}
var Log = class Log {
	/**
	* The global context object.
	*/
	globalStore;
	/**
	* The configuration for the adze log.
	*/
	_cfg;
	/**
	* Incomplete log data.
	*/
	_modifierData;
	/**
	* The log data object.
	*/
	_data;
	/**
	* Queue up modifiers to ensure they are in the correct order when executed.
	*/
	modifierQueue = [];
	constructor(cfg, modifierData) {
		this.globalStore = getGlobal(cfg);
		this._modifierData = modifierData ?? {};
		this._cfg = new Configuration(cfg);
		this.doHook((m) => {
			if (m.constructed) m.constructed(this);
		});
	}
	get data() {
		return this._data;
	}
	get modifierData() {
		return this._modifierData;
	}
	get configuration() {
		return this._cfg;
	}
	alert(...args) {
		this.terminate("alert", args);
	}
	/**
	* Terminates the log at the *alert* level.
	*
	* **Default Level = "alert" or 0**
	*
	* This level is useful for calling alert to
	* important information and lives at the lowest level.
	*
	* You should use this sparingly since it's level is lower
	* than error.
	*
	* This is a non-standard API.
	*/
	static alert(...args) {
		new this().alert(...args);
	}
	error(...args) {
		this.terminate("error", args);
	}
	/**
	* Terminates the log at the *error* level.
	*
	* **Default Level = "error" or 1**
	*
	* Use this for logging fatal errors or errors that
	* impact functionality of your application.
	*
	* MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/error)
	*/
	static error(...args) {
		new this().error(...args);
	}
	warn(...args) {
		this.terminate("warn", args);
	}
	/**
	* Terminates the log at the *warning* level.
	*
	* **Default Level = "warn" or 2**
	*
	* Use this for logging issues that may impact
	* app performance in a less impactful way than
	* an error.
	*
	* MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/warn)
	*/
	static warn(...args) {
		new this().warn(...args);
	}
	info(...args) {
		this.terminate("info", args);
	}
	/**
	* Terminates the log at the *info* level.
	*
	* **Default Level = "info" or 3**
	*
	* Use this for logging general insights into your
	* application. This level does not indicate any
	* problems.
	*
	* MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/info)
	*/
	static info(...args) {
		new this().info(...args);
	}
	fail(...args) {
		this.terminate("fail", args);
	}
	/**
	* Terminates the log at the *fail* level.
	*
	* **Default Level = "fail" or 4**
	*
	* Use this for logging network communication errors
	* that do not break your application.
	*
	* This is a non-standard API.
	*/
	static fail(...args) {
		new this().fail(...args);
	}
	success(...args) {
		this.terminate("success", args);
	}
	/**
	* Terminates the log at the *success* level.
	*
	* **Default Level = "success" or 5**
	*
	* Use this for logging successful network communication.
	*
	* This is a non-standard API.
	*/
	static success(...args) {
		new this().success(...args);
	}
	log(...args) {
		this.terminate("log", args);
	}
	/**
	* Terminates the log at the *log* level.
	*
	* **Default Level = "log" or 6**
	*
	* Use this for general logging that doesn't apply
	* to any of the lower levels.
	*
	* MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/log)
	*/
	static log(args_0, ...args) {
		new this().log(...[args_0, ...args]);
	}
	debug(...args) {
		this.terminate("debug", args);
	}
	/**
	* Terminates the log at the *log* level.
	*
	* **Default Level = "debug" or 7**
	*
	* Use this for general logging that doesn't apply
	* to any of the lower levels.
	*
	* MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/log)
	*/
	static debug(...args) {
		new this().debug(...args);
	}
	verbose(...args) {
		this.terminate("verbose", args);
	}
	/**
	* Terminates the log at the *verbose* level.
	*
	* **Default Level = "verbose" or 8**
	*
	* Use this for logging extremely detailed debugging
	* information. Use this level when the values you are
	* logging are granular enough that they are no longer
	* easily human readable.
	*
	* This is a non-standard API.
	*/
	static verbose(...args) {
		new this().verbose(...args);
	}
	/**
	* Clears the console.
	*
	* This terminator simply exists as an alias for `console.clear()`.
	*/
	clear() {
		console.clear();
	}
	/**
	* Clears the console.
	*
	* This terminator simply exists as an alias for `console.clear()`.
	*/
	static clear() {
		console.clear();
	}
	/**
	* Alias for `clear()`. Clears the console.
	*
	* This terminator simply exists as an alias for `console.clear()`.
	*/
	clr() {
		console.clear();
	}
	/**
	* Alias for `clear()`. Clears the console.
	*
	* This terminator simply exists as an alias for `console.clear()`.
	*/
	static clr() {
		console.clear();
	}
	/**
	* Terminates the log at the provided custom log level. Custom log levels are defined within the
	* Adze configuration object under the levels property.
	*/
	custom(levelName, ...args) {
		if (!this._cfg.levels[levelName]) {
			console.warn(/* @__PURE__ */ new Error("Custom log level not found in configuration."));
			return this;
		}
		this.terminate(levelName, args);
		return this;
	}
	/**
	* Terminates the log at the provided custom log level. Custom log levels are defined within the
	* Adze configuration object under the levels property.
	*/
	static custom(levelName, ...args) {
		return new this().custom(levelName, ...args);
	}
	/**
	* Seals the configuration of a log and returns a function that
	* constructs a new log with the same configuration.
	*
	* **Example:**
	* ```javascript
	* const sealed = adze.withEmoji.ns('sealed').label('sealed-label').seal();
	* sealed.success('Success!'); // -> prints "#sealed [sealed-label] Success!"
	* sealed.log('Another log.'); // -> prints "#sealed [sealed-label] Another log."
	* ```
	*/
	seal(_cfg) {
		if (_cfg) this._cfg.updateConfiguration(_cfg);
		return SealedLog(Log, this._cfg, this.modifierData, this.modifierQueue);
	}
	/**
	* Seals the configuration of a log and returns a function that
	* constructs a new log with the same configuration.
	*
	* **Example:**
	* ```javascript
	* const sealed = adze.withEmoji.ns('sealed').label('sealed-label').seal();
	* sealed.success('Success!'); // -> prints "#sealed [sealed-label] Success!"
	* sealed.log('Another log.'); // -> prints "#sealed [sealed-label] Another log."
	* ```
	*/
	static seal(cfg) {
		return new this().seal(cfg);
	}
	/**
	* Seals the configuration of a log and returns a template string tag function.
	*
	* Example:
	*
	* ```typescript
	* const ERR = adze.ns('foo').sealTag('error');
	* ERR`This is an error message.`; // => prints "Error #foo This is an error message."
	* ```
	*/
	sealTag(method, cfg) {
		this._cfg = new Configuration({
			...this._cfg.exportValues(),
			...cfg
		});
		return (strings, ...values) => {
			const message = String.raw({ raw: strings }, ...values);
			const sealed = SealedLog(Log, this._cfg, this.modifierData, this.modifierQueue);
			const _method = method;
			if (isCallback(sealed[_method])) sealed[_method](message);
		};
	}
	/**
	* Seals the configuration of a log and returns a template string tag function.
	*
	* Example:
	*
	* ```typescript
	* const ERR = adze.ns('foo').sealTag('error');
	* ERR`This is an error message.`; // => prints "Error #foo This is an error message."
	* ```
	*/
	static sealTag(method, cfg) {
		return new this().sealTag(method, cfg);
	}
	/**
	* Following the MDC (Mapped Diagnostic Context) pattern, this method enables you to create a
	* thread for adding context from different scopes before finally terminating the log.
	*
	* In order to create a thread, this log must specify a label. The label identifies the shared
	* context that other logs in your thread can contribute to.
	*
	* Example:
	*
	* ```typescript
	* function add(a: number, b: number) {
	*   const answer = a + b;
	*   adze.label('maths').thread('added', { a, b, answer });
	*   return answer;
	* }
	*
	* function subtract(x: number, y: number) {
	*   const answer = x - y;
	*   adze.label('maths').thread('subtracted', { x, y, answer });
	*   return answer;
	* }
	*
	* add(1, 2);
	* subtract(4, 3);
	*
	* adze.label('maths').dump.info('Results from our thread');
	* // => prints the log with the context values from both thread logs applied.
	* ```
	*/
	thread(key, value) {
		this.runModifierQueue();
		if (this._modifierData.label) {
			if (!this._modifierData.label.context) this._modifierData.label.context = {};
			this._modifierData.label.context = {
				...this._modifierData.label.context,
				[key]: value
			};
		}
	}
	/**
	* Following the MDC (Mapped Diagnostic Context) pattern, this method enables you to create a
	* thread for adding context from different scopes before finally terminating the log.
	*
	* In order to create a thread, this log must specify a label. The label identifies the shared
	* context that other logs in your thread can contribute to.
	*
	* Example:
	*
	* ```typescript
	* function add(a, b) {
	*   const answer = a + b;
	*   adze.label('foo').thread('added', { a, b, answer });
	*   return answer;
	* }
	*
	* function subtract(x, y) {
	*   const answer = x - y;
	*   adze.label('foo').thread('subtracted', { x, y, answer });
	*   return answer;
	* }
	*
	* add(1, 2);
	* subtract(4, 3);
	*
	* adze.label('foo').dump.info('Results from our thread');
	* // => prints the log with the context values from both thread logs applied.
	* ```
	*/
	static thread(key, value) {
		new this().thread(key, value);
	}
	/**
	* Generates a log message if the provided expression is falsey.
	*/
	assert(expression) {
		this.modifierQueue.push(["assert", (data) => {
			data.assertion = expression;
			return data;
		}]);
		return this;
	}
	/**
	* Generates a log message if the provided expression is falsey.
	*/
	static assert(expression) {
		return new this().assert(expression);
	}
	/**
	* Closes a thread by resetting its context.
	*/
	get closeThread() {
		this.modifierQueue.push(["closeThread", (data) => {
			if (data.label?.context) data.label.context = void 0;
			return data;
		}]);
		return this;
	}
	/**
	* Closes a thread by resetting its context.
	*/
	static get closeThread() {
		return new this().closeThread;
	}
	/**
	* Adds to the log count for log instances that share this log's label.
	*
	* MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/count)
	*/
	get count() {
		this.modifierQueue.push(["count", (data) => {
			if (data.label) data.label.count = data.label.count !== void 0 ? data.label.count + 1 : 1;
			return data;
		}]);
		return this;
	}
	/**
	* Adds to the log count for log instances that share this log's label.
	*
	* MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/count)
	*/
	static get count() {
		return new this().count;
	}
	/**
	* Unsets the count for the log instances that share this log's label.
	*
	* This is a non-standard method.
	*/
	get countClear() {
		this.modifierQueue.push(["countClear", (data) => {
			if (data.label) delete data.label.count;
			return data;
		}]);
		return this;
	}
	/**
	* Unsets the count for the log instances that share this log's label.
	*
	* This is a non-standard method.
	*/
	static get countClear() {
		return new this().countClear;
	}
	/**
	* Resets the count for the log instances that share this log's label back to 0.
	*
	* MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/countReset)
	*/
	get countReset() {
		this.modifierQueue.push(["countReset", (data) => {
			if (data.label) data.label.count = 0;
			return data;
		}]);
		return this;
	}
	/**
	* Resets the count for the log instances that share this log's label.
	*
	* MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/countReset)
	*/
	static get countReset() {
		return new this().countReset;
	}
	/**
	* Instructs this log to print in the dir format. Typically this is useful
	* for rendering deeply nested objects in the console.
	*
	* MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/dir)
	*/
	get dir() {
		this.modifierQueue.push(["dir", (data) => {
			data.method = "dir";
			return data;
		}]);
		return this;
	}
	/**
	* Instructs this log to print in the dir format. Typically this is useful
	* for rendering deeply nested objects in the console.
	*
	* MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/dir)
	*/
	static get dir() {
		return new this().dir;
	}
	/**
	* Instructs this log to print in the dirxml format. Typically this is useful
	* for rendering HTML/DOM or XML Elements in the console.
	*
	* MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/dirxml)
	*/
	get dirxml() {
		this.modifierQueue.push(["dirxml", (data) => {
			data.method = "dirxml";
			return data;
		}]);
		return this;
	}
	/**
	* Instructs this log to print in the dirxml format. Typically this is useful
	* for rendering HTML/DOM or XML Elements in the console.
	*
	* MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/dirxml)
	*/
	static get dirxml() {
		return new this().dirxml;
	}
	/**
	* Instructs the log terminator to add the key/value pairs from the
	* thread context to the console output.
	*
	* This is a non-standard API.
	*/
	get dump() {
		this.modifierQueue.push(["dump", (data, ctxt) => {
			ctxt._cfg.dump = true;
			return data;
		}]);
		return this;
	}
	/**
	* Instructs the log terminator to add the key/value pairs from the
	* thread context to the console output.
	*
	* This is a non-standard API.
	*/
	static get dump() {
		return new this().dump;
	}
	/**
	* Instructs the logger to print according to the provided format.
	*
	* This is a non-standard API.
	*/
	format(format) {
		this.modifierQueue.push(["format", (data, ctxt) => {
			if (Object.keys(ctxt._cfg.formatters).includes(format)) {
				ctxt._cfg.format = format;
				return data;
			}
			console.warn(/* @__PURE__ */ new Error(`Adze: Formatter "${format}" not found in configuration.`));
			return data;
		}]);
		return this;
	}
	/**
	* Instructs the logger to print according to the provided format.
	*
	* This is a non-standard API.
	*/
	static format(format) {
		return new this().format(format);
	}
	/**
	* Starts a log group.
	*
	* MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/group)
	*/
	get group() {
		this.modifierQueue.push(["group", (data) => {
			data.method = "group";
			return data;
		}]);
		return this;
	}
	/**
	* Starts a log group.
	*
	* MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/group)
	*/
	static get group() {
		return new this().group;
	}
	/**
	* Starts a log group that is collapsed by default.
	*
	* MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/groupCollapsed)
	*/
	get groupCollapsed() {
		this.modifierQueue.push(["groupCollapsed", (data) => {
			data.method = "groupCollapsed";
			return data;
		}]);
		return this;
	}
	/**
	* Starts a log group that is collapsed by default.
	*
	* MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/groupCollapsed)
	*/
	static get groupCollapsed() {
		return new this().groupCollapsed;
	}
	/**
	* Ends the most recently opened log group.
	*
	* MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/groupEnd)
	*/
	get groupEnd() {
		this.modifierQueue.push(["groupEnd", (data) => {
			data.method = "groupEnd";
			return data;
		}]);
		return this;
	}
	/**
	* Ends the most recently opened log group.
	*
	* MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/groupEnd)
	*/
	static get groupEnd() {
		return new this().groupEnd;
	}
	/**
	* Generates a log message if the provided expression is truthy.
	*
	* This is a non-standard API.
	*/
	if(expression) {
		this.modifierQueue.push(["if", (data) => {
			data.if = expression;
			return data;
		}]);
		return this;
	}
	/**
	* Generates a log message if the provided expression is truthy.
	*
	* This is a non-standard API.
	*/
	static if(expression) {
		return new this().if(expression);
	}
	/**
	* DEPRECATED: Use the equivalent `if` method instead.
	*
	* @deprecated
	*/
	test(expression) {
		return this.if(expression);
	}
	/**
	* DEPRECATED: Use the equivalent `if` method instead.
	*
	* @deprecated
	*/
	static test(expression) {
		return new this().if(expression);
	}
	/**
	* Adds a label to the log. Label's can be used for log identification
	* and grouping. Label's also link log instances together.
	*
	* This is a non-standard API, but it replaces the need to provide
	* a label to methods that require a global identifier for tracking purposes.
	*/
	label(name) {
		this.modifierQueue.unshift(["label", (data) => {
			const label = this.globalStore.getLabel(name) ?? { name };
			data.label = label;
			this.globalStore.setLabel(name, label);
			return data;
		}]);
		return this;
	}
	/**
	* Adds a label to the log. Label's can be used for log identification
	* and grouping. Label's also link log instances together.
	*
	* This is a non-standard API, but it replaces the need to provide
	* a label to methods that require a global identifier for tracking purposes.
	*/
	static label(name) {
		return new this().label(name);
	}
	/**
	* Assign meta data to this log instance that is meant to be
	* retrievable in a log listener or from a `log.data()` dump.
	*
	* This is a non-standard API.
	*/
	meta(meta) {
		this.modifierQueue.push(["meta", (data, ctxt) => {
			ctxt._cfg.meta = {
				...ctxt._cfg.meta,
				...meta
			};
			return data;
		}]);
		return this;
	}
	/**
	* Assign meta data to this log instance that is meant to be
	* retrievable in a log listener or from a `log.data()` dump.
	*
	* This is a non-standard API.
	*/
	static meta(meta) {
		return new this().meta(meta);
	}
	/**
	* Adds a namespace to the log. Namespace's are primarily useful
	* for grouping logs together. Multiple calls to namespace are
	* additive in nature.
	*
	* This is a non-standard API.
	*/
	namespace(...namespace) {
		this.modifierQueue.push(["namespace", (data) => {
			const arr = data.namespace ?? [];
			data.namespace = arr.length > 0 ? [...arr, ...namespace] : namespace;
			return data;
		}]);
		return this;
	}
	/**
	* Adds a namespace to the log. Namespace's are primarily useful
	* for grouping logs together. Multiple calls to namespace are
	* additive in nature.
	*
	* This is a non-standard API.
	*/
	static namespace(...namespace) {
		return new this().namespace(...namespace);
	}
	/**
	* Alias for the `namespace` modifier.
	*
	* Adds a namespace to the log. Namespace's are primarily useful
	* for grouping logs together. Multiple calls to namespace are
	* additive in nature.
	*
	* This is a non-standard API.
	*/
	ns(...namespace) {
		return this.namespace(...namespace);
	}
	/**
	* Alias for the `namespace` modifier.
	*
	* Adds a namespace to the log. Namespace's are primarily useful
	* for grouping logs together. Multiple calls to namespace are
	* additive in nature.
	*
	* This is a non-standard API.
	*/
	static ns(...namespace) {
		return new this().namespace(...namespace);
	}
	/**
	* This modifier prevents the log from printing. It can still be picked up by middleware or
	* listeners.
	*/
	get silent() {
		this.modifierQueue.push(["silent", (data, ctxt) => {
			ctxt._cfg.silent = true;
			return data;
		}]);
		return this;
	}
	/**
	* This modifier prevents the log from printing. It can still be picked up by middleware or
	* listeners.
	*/
	static get silent() {
		return new this().silent;
	}
	/**
	* Instructs this log to print its argument in a table format.
	*
	* MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/table)
	*/
	get table() {
		this.modifierQueue.push(["table", (data) => {
			data.method = "table";
			return data;
		}]);
		return this;
	}
	/**
	* Instructs this log to print its argument in a table format.
	*
	* MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/table)
	*/
	static get table() {
		return new this().table;
	}
	/**
	* Starts a timer associated with this log's *label*. This will do nothing if
	* this log has no label.
	*
	* MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/time).
	*/
	get time() {
		this.modifierQueue.push(["time", (data) => {
			const timeStart = hrtime();
			if (data.label) data.label.timeStart = timeStart;
			return data;
		}]);
		return this;
	}
	/**
	* Starts a timer associated with this log's *label*. This will do nothing if
	* this log has no label.
	*
	* MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/time).
	*/
	static get time() {
		return new this().time;
	}
	/**
	* Stops a timer that was previously started by calling time() on a *labeled* log. Calculates the
	* difference between the start time and when this method was called. This then
	* modifies the log render to show the time difference. This will do nothing if the *label* does
	* not exist.
	*
	* MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/timeEnd).
	*/
	get timeEnd() {
		this.modifierQueue.push(["timeEnd", (data) => {
			if (data.label?.timeStart) data.label.timeElapsed = formatTime(hrtime(data.label.timeStart));
			return data;
		}]);
		return this;
	}
	/**
	* Stops a timer that was previously started by calling time() on a *labeled* log. Calculates the
	* difference between the start time and when this method was called. This then
	* modifies the log render to show the time difference. This will do nothing if the *label* does
	* not exist.
	*
	* MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/timeEnd).
	*/
	static get timeEnd() {
		return new this().timeEnd;
	}
	/**
	* Modifies the log render to show the current high-resolution real time.
	*
	* This is a non-standard method.
	*/
	get timeNow() {
		this.modifierQueue.push(["timeNow", (data) => {
			data.timeNow = captureTimeNow();
			return data;
		}]);
		return this;
	}
	/**
	* Modifies the log render to show the current high-resolution real time.
	*
	* This is a non-standard method.
	*/
	static get timeNow() {
		return new this().timeNow;
	}
	/**
	* This modifier method tells the log to render a timestamp.
	*
	* This is a non-standard API.
	*/
	get timestamp() {
		this.modifierQueue.push(["timestamp", (data, ctxt) => {
			ctxt._cfg.showTimestamp = true;
			return data;
		}]);
		return this;
	}
	/**
	* This modifier method tells the log to render a timestamp.
	*
	* This is a non-standard API.
	*/
	static get timestamp() {
		return new this().timestamp;
	}
	/**
	* Prints a stacktrace along with the log. This does not use the standard "trace" method but
	* derives the stacktrace from the current call stack and appends it to your log.
	*
	* MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/trace)
	*/
	get trace() {
		this.modifierQueue.push(["trace", (data) => {
			data.stacktrace = stacktrace();
			return data;
		}]);
		return this;
	}
	/**
	* Prints a stacktrace along with the log. This does not use the standard "trace" method but
	* derives the stacktrace from the current call stack and appends it to your log.
	*
	* MDN API Docs [here](https://developer.mozilla.org/en-US/docs/Web/API/Console/trace)
	*/
	static get trace() {
		return new this().trace;
	}
	/**
	* Allows emoji's to be printed in pretty logs.
	*/
	get withEmoji() {
		this.modifierQueue.push(["withEmoji", (data, ctxt) => {
			ctxt._cfg.withEmoji = true;
			return data;
		}]);
		return this;
	}
	/**
	* Allows emoji's to be printed in pretty logs.
	*/
	static get withEmoji() {
		return new this().withEmoji;
	}
	/**
	* Prints the log to the console.
	*/
	print(data) {
		if (isTestEnvironment()) return;
		if (data.silent) return;
		if (data.message.length < 1) return;
		if (isMethodWithArgs(data.method)) console[data.method](...data.message);
		else console[data.method]();
	}
	terminate(terminator, args) {
		this.doHook((m) => {
			if (m.beforeTerminated) m.beforeTerminated(this, terminator, args);
		});
		this.runModifierQueue();
		const level = this.getLevelConfig(terminator);
		const formatter = new (this.selectFormatter(this._cfg.format))(this._cfg, level);
		const timestamp = formatter.timestampFormatter(/* @__PURE__ */ new Date());
		let message = cleanMessage(formatter.print(this.modifierData, timestamp, args));
		if (this._cfg.dump && this.modifierData.label?.context) message.push(this.modifierData.label.context);
		this.doHook((m) => {
			if (m.beforeFormatApplied) message = m.beforeFormatApplied(this, this._cfg.format, message);
		});
		const { activeLevel, cache, cacheSize, dump, format, meta, showTimestamp, silent, withEmoji } = this._cfg;
		const data = {
			activeLevel,
			cache,
			cacheSize,
			dump,
			format,
			meta,
			showTimestamp,
			silent,
			withEmoji,
			...level,
			...this._modifierData,
			terminator,
			args,
			timestamp,
			message
		};
		this.doHook((m) => {
			if (m.afterFormatApplied) m.afterFormatApplied(this, this._cfg.format, message);
		});
		this._data = data;
		if (this._cfg.cache) this.globalStore.addLogToCache(this);
		this.doHook((m) => {
			if (m.beforePrint) m.beforePrint(this);
		});
		this.print(this._data);
		this.doHook((m) => {
			if (m.afterTerminated) m.afterTerminated(this, terminator, args);
		});
		this.globalStore.getListeners(level.level).forEach((listener) => {
			listener(this);
		});
	}
	/**
	* Returns a formatter constructor based on the provided format.
	*/
	selectFormatter(format) {
		return this._cfg.formatters[format];
	}
	/**
	* Returns the level configuration object based on the provided level name.
	*/
	getLevelConfig(levelName) {
		return this._cfg.levels[levelName];
	}
	/**
	* Runs the modifier queue against this instance.
	*/
	runModifierQueue() {
		this.modifierQueue.forEach(([modName, modFunc]) => {
			const result = modFunc(this.modifierData, this);
			this.doHook((m) => {
				if (m.beforeModifierApplied) m.beforeModifierApplied(this, modName, result);
			});
			this._modifierData = result;
			this.doHook((m) => {
				if (m.afterModifierApplied) m.afterModifierApplied(this, modName, result);
			});
		});
	}
	/**
	* Execute a middleware hook.
	*/
	doHook(cb) {
		this._cfg.middleware?.forEach((middleware) => {
			cb(middleware);
		});
	}
};
//#endregion
//#region ../../../node_modules/.bun/adze@2.3.0/node_modules/adze/dist/middleware.js
/**
* Middleware abstract class that can be extended to create custom middleware.
*/
var Middleware = class {
	/**
	* The target environment for this middleware.
	*
	* This instructs the middleware to only load dependencies for the specified environment.
	*/
	targetEnvironment;
	/**
	* The environment that the middleware is running in.
	*/
	environment = isBrowser() ? "browser" : "server";
	/**
	* Array of asynchronous dependency loaders.
	*/
	dependencyLoaders = [];
	constructor(targetEnvironment) {
		this.targetEnvironment = targetEnvironment ?? "both";
		if (!isBrowser() && (this.targetEnvironment === "server" || this.targetEnvironment === "both")) this.dependencyLoaders.push(this.loadServerDependencies());
		if (isBrowser() && (this.targetEnvironment === "browser" || this.targetEnvironment === "both")) this.dependencyLoaders.push(this.loadBrowserDependencies());
	}
	/**
	* Load the dependencies for this middleware.
	*/
	async load() {
		await Promise.all(this.dependencyLoaders);
	}
	/**
	* Load dependencies for the server environment.
	*/
	async loadServerDependencies() {}
	/**
	* Load dependencies for the browser environment.
	*/
	async loadBrowserDependencies() {}
};
/**
* Immutable array of all possible console styles.
*/
var console_styles = Object.freeze([
	"black",
	"red",
	"green",
	"yellow",
	"blue",
	"magenta",
	"cyan",
	"white",
	"gray",
	"blackBright",
	"redBright",
	"greenBright",
	"yellowBright",
	"blueBright",
	"magentaBright",
	"cyanBright",
	"whiteBright",
	"bgBlack",
	"bgRed",
	"bgGreen",
	"bgYellow",
	"bgBlue",
	"bgMagenta",
	"bgCyan",
	"bgWhite",
	"bgBlackBright",
	"bgRedBright",
	"bgGreenBright",
	"bgYellowBright",
	"bgBlueBright",
	"bgMagentaBright",
	"bgCyanBright",
	"bgWhiteBright",
	"reset",
	"bold",
	"dim",
	"italic",
	"underline",
	"inverse",
	"hidden",
	"strikethrough"
]);
//#endregion
//#region ../../../node_modules/.bun/adze@2.3.0/node_modules/adze/dist/index.js
var dist_default = Log;
//#endregion
export { CommonFormatter, Configuration, Formatter, JsonFormatter, Middleware, StandardFormatter, addPadding, applyStyles, console_styles, dist_default as default, defaultConfiguration, formatAssert, formatCount, formatIf, formatLabel, formatNamespace, formats, getAlertConfig, getDebugConfig, getErrorConfig, getFailConfig, getInfoConfig, getLogConfig, getSuccessConfig, getVerboseConfig, getWarnConfig, initialCaps, isBrowser, levels, methods, methodsWithArgs, modifiers, serializeError, serializeRequest, serializeResponse, setup, specialMethods, specialMethodsWithArgs, specialMethodsWithArgsAndLeader, specialMethodsWithoutArgs, teardown, terminators };
