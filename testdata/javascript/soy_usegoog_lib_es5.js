var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.arrayIteratorImpl = function(array) {
  var index = 0;
  return function() {
    return index < array.length ? {done:!1, value:array[index++]} : {done:!0};
  };
};
$jscomp.arrayIterator = function(array) {
  return {next:$jscomp.arrayIteratorImpl(array)};
};
$jscomp.makeIterator = function(iterable) {
  var iteratorFunction = "undefined" != typeof Symbol && Symbol.iterator && iterable[Symbol.iterator];
  return iteratorFunction ? iteratorFunction.call(iterable) : $jscomp.arrayIterator(iterable);
};
$jscomp.findInternal = function(array, callback, thisArg) {
  array instanceof String && (array = String(array));
  for (var len = array.length, i = 0; i < len; i++) {
    var value = array[i];
    if (callback.call(thisArg, value, i, array)) {
      return {i:i, v:value};
    }
  }
  return {i:-1, v:void 0};
};
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.SIMPLE_FROUND_POLYFILL = !1;
$jscomp.defineProperty = $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties ? Object.defineProperty : function(target, property, descriptor) {
  target != Array.prototype && target != Object.prototype && (target[property] = descriptor.value);
};
$jscomp.getGlobal = function(maybeGlobal) {
  return "undefined" != typeof window && window === maybeGlobal ? maybeGlobal : "undefined" != typeof global && null != global ? global : maybeGlobal;
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.polyfill = function(target, polyfill) {
  if (polyfill) {
    for (var obj = $jscomp.global, split = target.split("."), i = 0; i < split.length - 1; i++) {
      var key = split[i];
      key in obj || (obj[key] = {});
      obj = obj[key];
    }
    var property = split[split.length - 1], orig = obj[property], impl = polyfill(orig);
    impl != orig && null != impl && $jscomp.defineProperty(obj, property, {configurable:!0, writable:!0, value:impl});
  }
};
$jscomp.checkStringArgs = function(thisArg, arg, func) {
  if (null == thisArg) {
    throw new TypeError("The 'this' value for String.prototype." + func + " must not be null or undefined");
  }
  if (arg instanceof RegExp) {
    throw new TypeError("First argument to String.prototype." + func + " must not be a regular expression");
  }
  return thisArg + "";
};
$jscomp.SYMBOL_PREFIX = "jscomp_symbol_";
$jscomp.initSymbol = function() {
  $jscomp.initSymbol = function() {
  };
  $jscomp.global.Symbol || ($jscomp.global.Symbol = $jscomp.Symbol);
};
$jscomp.SymbolClass = function(id, opt_description) {
  this.$jscomp$symbol$id_ = id;
  $jscomp.defineProperty(this, "description", {configurable:!0, writable:!0, value:opt_description});
};
$jscomp.SymbolClass.prototype.toString = function() {
  return this.$jscomp$symbol$id_;
};
$jscomp.Symbol = function() {
  function Symbol(opt_description) {
    if (this instanceof Symbol) {
      throw new TypeError("Symbol is not a constructor");
    }
    return new $jscomp.SymbolClass($jscomp.SYMBOL_PREFIX + (opt_description || "") + "_" + counter++, opt_description);
  }
  var counter = 0;
  return Symbol;
}();
$jscomp.initSymbolIterator = function() {
  $jscomp.initSymbol();
  var symbolIterator = $jscomp.global.Symbol.iterator;
  symbolIterator || (symbolIterator = $jscomp.global.Symbol.iterator = $jscomp.global.Symbol("Symbol.iterator"));
  "function" != typeof Array.prototype[symbolIterator] && $jscomp.defineProperty(Array.prototype, symbolIterator, {configurable:!0, writable:!0, value:function() {
    return $jscomp.iteratorPrototype($jscomp.arrayIteratorImpl(this));
  }});
  $jscomp.initSymbolIterator = function() {
  };
};
$jscomp.initSymbolAsyncIterator = function() {
  $jscomp.initSymbol();
  var symbolAsyncIterator = $jscomp.global.Symbol.asyncIterator;
  symbolAsyncIterator || (symbolAsyncIterator = $jscomp.global.Symbol.asyncIterator = $jscomp.global.Symbol("Symbol.asyncIterator"));
  $jscomp.initSymbolAsyncIterator = function() {
  };
};
$jscomp.iteratorPrototype = function(next) {
  $jscomp.initSymbolIterator();
  var iterator = {next:next};
  iterator[$jscomp.global.Symbol.iterator] = function() {
    return this;
  };
  return iterator;
};
$jscomp.iteratorFromArray = function(array, transform) {
  $jscomp.initSymbolIterator();
  array instanceof String && (array += "");
  var i = 0, iter = {next:function() {
    if (i < array.length) {
      var index = i++;
      return {value:transform(index, array[index]), done:!1};
    }
    iter.next = function() {
      return {done:!0, value:void 0};
    };
    return iter.next();
  }};
  iter[Symbol.iterator] = function() {
    return iter;
  };
  return iter;
};
$jscomp.polyfill("Array.from", function(orig) {
  return orig ? orig : function(arrayLike, opt_mapFn, opt_thisArg) {
    opt_mapFn = null != opt_mapFn ? opt_mapFn : function(x) {
      return x;
    };
    var result = [], iteratorFunction = "undefined" != typeof Symbol && Symbol.iterator && arrayLike[Symbol.iterator];
    if ("function" == typeof iteratorFunction) {
      arrayLike = iteratorFunction.call(arrayLike);
      for (var next, k = 0; !(next = arrayLike.next()).done;) {
        result.push(opt_mapFn.call(opt_thisArg, next.value, k++));
      }
    } else {
      for (var len = arrayLike.length, i = 0; i < len; i++) {
        result.push(opt_mapFn.call(opt_thisArg, arrayLike[i], i));
      }
    }
    return result;
  };
}, "es6", "es3");
$jscomp.checkEs6ConformanceViaProxy = function() {
  try {
    var proxied = {}, proxy = Object.create(new $jscomp.global.Proxy(proxied, {get:function(target, key, receiver) {
      return target == proxied && "q" == key && receiver == proxy;
    }}));
    return !0 === proxy.q;
  } catch (err) {
    return !1;
  }
};
$jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS = !1;
$jscomp.ES6_CONFORMANCE = $jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS && $jscomp.checkEs6ConformanceViaProxy();
$jscomp.owns = function(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};
$jscomp.polyfill("WeakMap", function(NativeWeakMap) {
  function isConformant() {
    if (!NativeWeakMap || !Object.seal) {
      return !1;
    }
    try {
      var x = Object.seal({}), y = Object.seal({}), map = new NativeWeakMap([[x, 2], [y, 3]]);
      if (2 != map.get(x) || 3 != map.get(y)) {
        return !1;
      }
      map.delete(x);
      map.set(y, 4);
      return !map.has(x) && 4 == map.get(y);
    } catch (err) {
      return !1;
    }
  }
  function WeakMapMembership() {
  }
  function insert(target) {
    if (!$jscomp.owns(target, prop)) {
      var obj = new WeakMapMembership;
      $jscomp.defineProperty(target, prop, {value:obj});
    }
  }
  function patch(name) {
    var prev = Object[name];
    prev && (Object[name] = function(target) {
      if (target instanceof WeakMapMembership) {
        return target;
      }
      insert(target);
      return prev(target);
    });
  }
  if ($jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS) {
    if (NativeWeakMap && $jscomp.ES6_CONFORMANCE) {
      return NativeWeakMap;
    }
  } else {
    if (isConformant()) {
      return NativeWeakMap;
    }
  }
  var prop = "$jscomp_hidden_" + Math.random();
  patch("freeze");
  patch("preventExtensions");
  patch("seal");
  var index = 0, PolyfillWeakMap = function(opt_iterable) {
    this.id_ = (index += Math.random() + 1).toString();
    if (opt_iterable) {
      for (var iter = $jscomp.makeIterator(opt_iterable), entry; !(entry = iter.next()).done;) {
        var item = entry.value;
        this.set(item[0], item[1]);
      }
    }
  };
  PolyfillWeakMap.prototype.set = function(key, value) {
    insert(key);
    if (!$jscomp.owns(key, prop)) {
      throw Error("WeakMap key fail: " + key);
    }
    key[prop][this.id_] = value;
    return this;
  };
  PolyfillWeakMap.prototype.get = function(key) {
    return $jscomp.owns(key, prop) ? key[prop][this.id_] : void 0;
  };
  PolyfillWeakMap.prototype.has = function(key) {
    return $jscomp.owns(key, prop) && $jscomp.owns(key[prop], this.id_);
  };
  PolyfillWeakMap.prototype.delete = function(key) {
    return $jscomp.owns(key, prop) && $jscomp.owns(key[prop], this.id_) ? delete key[prop][this.id_] : !1;
  };
  return PolyfillWeakMap;
}, "es6", "es3");
$jscomp.MapEntry = function() {
};
$jscomp.polyfill("Map", function(NativeMap) {
  function isConformant() {
    if ($jscomp.ASSUME_NO_NATIVE_MAP || !NativeMap || "function" != typeof NativeMap || !NativeMap.prototype.entries || "function" != typeof Object.seal) {
      return !1;
    }
    try {
      var key = Object.seal({x:4}), map = new NativeMap($jscomp.makeIterator([[key, "s"]]));
      if ("s" != map.get(key) || 1 != map.size || map.get({x:4}) || map.set({x:4}, "t") != map || 2 != map.size) {
        return !1;
      }
      var iter = map.entries(), item = iter.next();
      if (item.done || item.value[0] != key || "s" != item.value[1]) {
        return !1;
      }
      item = iter.next();
      return item.done || 4 != item.value[0].x || "t" != item.value[1] || !iter.next().done ? !1 : !0;
    } catch (err) {
      return !1;
    }
  }
  if ($jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS) {
    if (NativeMap && $jscomp.ES6_CONFORMANCE) {
      return NativeMap;
    }
  } else {
    if (isConformant()) {
      return NativeMap;
    }
  }
  $jscomp.initSymbolIterator();
  var idMap = new WeakMap, PolyfillMap = function(opt_iterable) {
    this.data_ = {};
    this.head_ = createHead();
    this.size = 0;
    if (opt_iterable) {
      for (var iter = $jscomp.makeIterator(opt_iterable), entry; !(entry = iter.next()).done;) {
        var item = entry.value;
        this.set(item[0], item[1]);
      }
    }
  };
  PolyfillMap.prototype.set = function(key, value) {
    key = 0 === key ? 0 : key;
    var r = maybeGetEntry(this, key);
    r.list || (r.list = this.data_[r.id] = []);
    r.entry ? r.entry.value = value : (r.entry = {next:this.head_, previous:this.head_.previous, head:this.head_, key:key, value:value}, r.list.push(r.entry), this.head_.previous.next = r.entry, this.head_.previous = r.entry, this.size++);
    return this;
  };
  PolyfillMap.prototype.delete = function(key) {
    var r = maybeGetEntry(this, key);
    return r.entry && r.list ? (r.list.splice(r.index, 1), r.list.length || delete this.data_[r.id], r.entry.previous.next = r.entry.next, r.entry.next.previous = r.entry.previous, r.entry.head = null, this.size--, !0) : !1;
  };
  PolyfillMap.prototype.clear = function() {
    this.data_ = {};
    this.head_ = this.head_.previous = createHead();
    this.size = 0;
  };
  PolyfillMap.prototype.has = function(key) {
    return !!maybeGetEntry(this, key).entry;
  };
  PolyfillMap.prototype.get = function(key) {
    var entry = maybeGetEntry(this, key).entry;
    return entry && entry.value;
  };
  PolyfillMap.prototype.entries = function() {
    return makeIterator(this, function(entry) {
      return [entry.key, entry.value];
    });
  };
  PolyfillMap.prototype.keys = function() {
    return makeIterator(this, function(entry) {
      return entry.key;
    });
  };
  PolyfillMap.prototype.values = function() {
    return makeIterator(this, function(entry) {
      return entry.value;
    });
  };
  PolyfillMap.prototype.forEach = function(callback, opt_thisArg) {
    for (var iter = this.entries(), item; !(item = iter.next()).done;) {
      var entry = item.value;
      callback.call(opt_thisArg, entry[1], entry[0], this);
    }
  };
  PolyfillMap.prototype[Symbol.iterator] = PolyfillMap.prototype.entries;
  var maybeGetEntry = function(map, key) {
    var type = key && typeof key;
    if ("object" == type || "function" == type) {
      if (idMap.has(key)) {
        var id = idMap.get(key);
      } else {
        var id$jscomp$0 = "" + ++mapIndex;
        idMap.set(key, id$jscomp$0);
        id = id$jscomp$0;
      }
    } else {
      id = "p_" + key;
    }
    var list = map.data_[id];
    if (list && $jscomp.owns(map.data_, id)) {
      for (var index = 0; index < list.length; index++) {
        var entry = list[index];
        if (key !== key && entry.key !== entry.key || key === entry.key) {
          return {id:id, list:list, index:index, entry:entry};
        }
      }
    }
    return {id:id, list:list, index:-1, entry:void 0};
  }, makeIterator = function(map, func) {
    var entry = map.head_;
    return $jscomp.iteratorPrototype(function() {
      if (entry) {
        for (; entry.head != map.head_;) {
          entry = entry.previous;
        }
        for (; entry.next != entry.head;) {
          return entry = entry.next, {done:!1, value:func(entry)};
        }
        entry = null;
      }
      return {done:!0, value:void 0};
    });
  }, createHead = function() {
    var head = {};
    return head.previous = head.next = head.head = head;
  }, mapIndex = 0;
  return PolyfillMap;
}, "es6", "es3");
var goog = goog || {};
goog.global = this;
goog.isDef = function(val) {
  return void 0 !== val;
};
goog.isString = function(val) {
  return "string" == typeof val;
};
goog.isBoolean = function(val) {
  return "boolean" == typeof val;
};
goog.isNumber = function(val) {
  return "number" == typeof val;
};
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split("."), cur = opt_objectToExportTo || goog.global;
  parts[0] in cur || "undefined" == typeof cur.execScript || cur.execScript("var " + parts[0]);
  for (var part; parts.length && (part = parts.shift());) {
    !parts.length && goog.isDef(opt_object) ? cur[part] = opt_object : cur = cur[part] && cur[part] !== Object.prototype[part] ? cur[part] : cur[part] = {};
  }
};
goog.define = function(name, defaultValue) {
  goog.exportPath_(name, defaultValue);
  return defaultValue;
};
goog.FEATURESET_YEAR = 2012;
goog.DEBUG = !1;
goog.LOCALE = "en";
goog.TRUSTED_SITE = !0;
goog.STRICT_MODE_COMPATIBLE = !1;
goog.DISALLOW_TEST_ONLY_CODE = !goog.DEBUG;
goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING = !1;
goog.provide = function(name) {
  if (goog.isInModuleLoader_()) {
    throw Error("goog.provide cannot be used within a module.");
  }
  goog.constructNamespace_(name);
};
goog.constructNamespace_ = function(name, opt_obj) {
  goog.exportPath_(name, opt_obj);
};
goog.getScriptNonce = function(opt_window) {
  if (opt_window && opt_window != goog.global) {
    return goog.getScriptNonce_(opt_window.document);
  }
  null === goog.cspNonce_ && (goog.cspNonce_ = goog.getScriptNonce_(goog.global.document));
  return goog.cspNonce_;
};
goog.NONCE_PATTERN_ = /^[\w+/_-]+[=]{0,2}$/;
goog.cspNonce_ = null;
goog.getScriptNonce_ = function(doc) {
  var script = doc.querySelector && doc.querySelector("script[nonce]");
  if (script) {
    var nonce = script.nonce || script.getAttribute("nonce");
    if (nonce && goog.NONCE_PATTERN_.test(nonce)) {
      return nonce;
    }
  }
  return "";
};
goog.VALID_MODULE_RE_ = /^[a-zA-Z_$][a-zA-Z0-9._$]*$/;
goog.module = function(name) {
  if (!goog.isString(name) || !name || -1 == name.search(goog.VALID_MODULE_RE_)) {
    throw Error("Invalid module identifier");
  }
  if (!goog.isInGoogModuleLoader_()) {
    throw Error("Module " + name + " has been loaded incorrectly. Note, modules cannot be loaded as normal scripts. They require some kind of pre-processing step. You're likely trying to load a module via a script tag or as a part of a concatenated bundle without rewriting the module. For more info see: https://github.com/google/closure-library/wiki/goog.module:-an-ES6-module-like-alternative-to-goog.provide.");
  }
  if (goog.moduleLoaderState_.moduleName) {
    throw Error("goog.module may only be called once per module.");
  }
  goog.moduleLoaderState_.moduleName = name;
};
goog.module.get = function() {
  return null;
};
goog.module.getInternal_ = function() {
  return null;
};
goog.ModuleType = {ES6:"es6", GOOG:"goog"};
goog.moduleLoaderState_ = null;
goog.isInModuleLoader_ = function() {
  return goog.isInGoogModuleLoader_() || goog.isInEs6ModuleLoader_();
};
goog.isInGoogModuleLoader_ = function() {
  return !!goog.moduleLoaderState_ && goog.moduleLoaderState_.type == goog.ModuleType.GOOG;
};
goog.isInEs6ModuleLoader_ = function() {
  if (goog.moduleLoaderState_ && goog.moduleLoaderState_.type == goog.ModuleType.ES6) {
    return !0;
  }
  var jscomp = goog.global.$jscomp;
  return jscomp ? "function" != typeof jscomp.getCurrentModulePath ? !1 : !!jscomp.getCurrentModulePath() : !1;
};
goog.module.declareLegacyNamespace = function() {
  goog.moduleLoaderState_.declareLegacyNamespace = !0;
};
goog.declareModuleId = function(namespace) {
  if (goog.moduleLoaderState_) {
    goog.moduleLoaderState_.moduleName = namespace;
  } else {
    var jscomp = goog.global.$jscomp;
    if (!jscomp || "function" != typeof jscomp.getCurrentModulePath) {
      throw Error('Module with namespace "' + namespace + '" has been loaded incorrectly.');
    }
    var exports = jscomp.require(jscomp.getCurrentModulePath());
    goog.loadedModules_[namespace] = {exports:exports, type:goog.ModuleType.ES6, moduleId:namespace};
  }
};
goog.setTestOnly = function(opt_message) {
  if (goog.DISALLOW_TEST_ONLY_CODE) {
    throw opt_message = opt_message || "", Error("Importing test-only code into non-debug environment" + (opt_message ? ": " + opt_message : "."));
  }
};
goog.forwardDeclare = function() {
};
goog.getObjectByName = function(name, opt_obj) {
  for (var parts = name.split("."), cur = opt_obj || goog.global, i = 0; i < parts.length; i++) {
    if (cur = cur[parts[i]], !goog.isDefAndNotNull(cur)) {
      return null;
    }
  }
  return cur;
};
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global, x;
  for (x in obj) {
    global[x] = obj[x];
  }
};
goog.addDependency = function() {
};
goog.useStrictRequires = !1;
goog.ENABLE_DEBUG_LOADER = !0;
goog.logToConsole_ = function(msg) {
  goog.global.console && goog.global.console.error(msg);
};
goog.require = function() {
};
goog.requireType = function() {
  return {};
};
goog.basePath = "";
goog.nullFunction = function() {
};
goog.abstractMethod = function() {
  throw Error("unimplemented abstract method");
};
goog.addSingletonGetter = function(ctor) {
  ctor.instance_ = void 0;
  ctor.getInstance = function() {
    if (ctor.instance_) {
      return ctor.instance_;
    }
    goog.DEBUG && (goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = ctor);
    return ctor.instance_ = new ctor;
  };
};
goog.instantiatedSingletons_ = [];
goog.LOAD_MODULE_USING_EVAL = !0;
goog.SEAL_MODULE_EXPORTS = goog.DEBUG;
goog.loadedModules_ = {};
goog.DEPENDENCIES_ENABLED = !1;
goog.TRANSPILE = "detect";
goog.ASSUME_ES_MODULES_TRANSPILED = !1;
goog.TRANSPILE_TO_LANGUAGE = "";
goog.TRANSPILER = "transpile.js";
goog.hasBadLetScoping = null;
goog.useSafari10Workaround = function() {
  if (null == goog.hasBadLetScoping) {
    try {
      var hasBadLetScoping = !eval('"use strict";let x = 1; function f() { return typeof x; };f() == "number";');
    } catch (e) {
      hasBadLetScoping = !1;
    }
    goog.hasBadLetScoping = hasBadLetScoping;
  }
  return goog.hasBadLetScoping;
};
goog.workaroundSafari10EvalBug = function(moduleDef) {
  return "(function(){" + moduleDef + "\n;})();\n";
};
goog.loadModule = function(moduleDef) {
  var previousState = goog.moduleLoaderState_;
  try {
    goog.moduleLoaderState_ = {moduleName:"", declareLegacyNamespace:!1, type:goog.ModuleType.GOOG};
    if (goog.isFunction(moduleDef)) {
      var exports = moduleDef.call(void 0, {});
    } else {
      if (goog.isString(moduleDef)) {
        goog.useSafari10Workaround() && (moduleDef = goog.workaroundSafari10EvalBug(moduleDef)), exports = goog.loadModuleFromSource_.call(void 0, moduleDef);
      } else {
        throw Error("Invalid module definition");
      }
    }
    var moduleName = goog.moduleLoaderState_.moduleName;
    if (goog.isString(moduleName) && moduleName) {
      goog.moduleLoaderState_.declareLegacyNamespace ? goog.constructNamespace_(moduleName, exports) : goog.SEAL_MODULE_EXPORTS && Object.seal && "object" == typeof exports && null != exports && Object.seal(exports), goog.loadedModules_[moduleName] = {exports:exports, type:goog.ModuleType.GOOG, moduleId:goog.moduleLoaderState_.moduleName};
    } else {
      throw Error('Invalid module name "' + moduleName + '"');
    }
  } finally {
    goog.moduleLoaderState_ = previousState;
  }
};
goog.loadModuleFromSource_ = function(JSCompiler_OptimizeArgumentsArray_p0) {
  eval(JSCompiler_OptimizeArgumentsArray_p0);
  return {};
};
goog.normalizePath_ = function(path) {
  for (var components = path.split("/"), i = 0; i < components.length;) {
    "." == components[i] ? components.splice(i, 1) : i && ".." == components[i] && components[i - 1] && ".." != components[i - 1] ? components.splice(--i, 2) : i++;
  }
  return components.join("/");
};
goog.loadFileSync_ = function(src) {
  if (goog.global.CLOSURE_LOAD_FILE_SYNC) {
    return goog.global.CLOSURE_LOAD_FILE_SYNC(src);
  }
  try {
    var xhr = new goog.global.XMLHttpRequest;
    xhr.open("get", src, !1);
    xhr.send();
    return 0 == xhr.status || 200 == xhr.status ? xhr.responseText : null;
  } catch (err) {
    return null;
  }
};
goog.transpile_ = function(code$jscomp$0, path$jscomp$0, target) {
  var jscomp = goog.global.$jscomp;
  jscomp || (goog.global.$jscomp = jscomp = {});
  var transpile = jscomp.transpile;
  if (!transpile) {
    var transpilerPath = goog.basePath + goog.TRANSPILER, transpilerCode = goog.loadFileSync_(transpilerPath);
    if (transpilerCode) {
      (function() {
        eval(transpilerCode + "\n//# sourceURL=" + transpilerPath);
      }).call(goog.global);
      if (goog.global.$gwtExport && goog.global.$gwtExport.$jscomp && !goog.global.$gwtExport.$jscomp.transpile) {
        throw Error('The transpiler did not properly export the "transpile" method. $gwtExport: ' + JSON.stringify(goog.global.$gwtExport));
      }
      goog.global.$jscomp.transpile = goog.global.$gwtExport.$jscomp.transpile;
      jscomp = goog.global.$jscomp;
      transpile = jscomp.transpile;
    }
  }
  if (!transpile) {
    var suffix = " requires transpilation but no transpiler was found.";
    suffix += ' Please add "//javascript/closure:transpiler" as a data dependency to ensure it is included.';
    transpile = jscomp.transpile = function(code, path) {
      goog.logToConsole_(path + suffix);
      return code;
    };
  }
  return transpile(code$jscomp$0, path$jscomp$0, target);
};
goog.typeOf = function(value) {
  var s = typeof value;
  if ("object" == s) {
    if (value) {
      if (value instanceof Array) {
        return "array";
      }
      if (value instanceof Object) {
        return s;
      }
      var className = Object.prototype.toString.call(value);
      if ("[object Window]" == className) {
        return "object";
      }
      if ("[object Array]" == className || "number" == typeof value.length && "undefined" != typeof value.splice && "undefined" != typeof value.propertyIsEnumerable && !value.propertyIsEnumerable("splice")) {
        return "array";
      }
      if ("[object Function]" == className || "undefined" != typeof value.call && "undefined" != typeof value.propertyIsEnumerable && !value.propertyIsEnumerable("call")) {
        return "function";
      }
    } else {
      return "null";
    }
  } else {
    if ("function" == s && "undefined" == typeof value.call) {
      return "object";
    }
  }
  return s;
};
goog.isNull = function(val) {
  return null === val;
};
goog.isDefAndNotNull = function(val) {
  return null != val;
};
goog.isArray = function(val) {
  return "array" == goog.typeOf(val);
};
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return "array" == type || "object" == type && "number" == typeof val.length;
};
goog.isDateLike = function(val) {
  return goog.isObject(val) && "function" == typeof val.getFullYear;
};
goog.isFunction = function(val) {
  return "function" == goog.typeOf(val);
};
goog.isObject = function(val) {
  var type = typeof val;
  return "object" == type && null != val || "function" == type;
};
goog.getUid = function(obj) {
  return obj[goog.UID_PROPERTY_] || (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_);
};
goog.hasUid = function(obj) {
  return !!obj[goog.UID_PROPERTY_];
};
goog.removeUid = function(obj) {
  null !== obj && "removeAttribute" in obj && obj.removeAttribute(goog.UID_PROPERTY_);
  try {
    delete obj[goog.UID_PROPERTY_];
  } catch (ex) {
  }
};
goog.UID_PROPERTY_ = "closure_uid_" + (1e9 * Math.random() >>> 0);
goog.uidCounter_ = 0;
goog.getHashCode = goog.getUid;
goog.removeHashCode = goog.removeUid;
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if ("object" == type || "array" == type) {
    if ("function" === typeof obj.clone) {
      return obj.clone();
    }
    var clone = "array" == type ? [] : {}, key;
    for (key in obj) {
      clone[key] = goog.cloneObject(obj[key]);
    }
    return clone;
  }
  return obj;
};
goog.bindNative_ = function(fn, selfObj, var_args) {
  return fn.call.apply(fn.bind, arguments);
};
goog.bindJs_ = function(fn, selfObj, var_args) {
  if (!fn) {
    throw Error();
  }
  if (2 < arguments.length) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs);
    };
  }
  return function() {
    return fn.apply(selfObj, arguments);
  };
};
goog.bind = function(fn, selfObj, var_args) {
  Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? goog.bind = goog.bindNative_ : goog.bind = goog.bindJs_;
  return goog.bind.apply(null, arguments);
};
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var newArgs = args.slice();
    newArgs.push.apply(newArgs, arguments);
    return fn.apply(this, newArgs);
  };
};
goog.mixin = function(target, source) {
  for (var x in source) {
    target[x] = source[x];
  }
};
goog.now = goog.TRUSTED_SITE && Date.now || function() {
  return +new Date;
};
goog.globalEval = function(script) {
  if (goog.global.execScript) {
    goog.global.execScript(script, "JavaScript");
  } else {
    if (goog.global.eval) {
      if (null == goog.evalWorksForGlobals_) {
        try {
          goog.global.eval("var _evalTest_ = 1;");
        } catch (ignore) {
        }
        if ("undefined" != typeof goog.global._evalTest_) {
          try {
            delete goog.global._evalTest_;
          } catch (ignore$3) {
          }
          goog.evalWorksForGlobals_ = !0;
        } else {
          goog.evalWorksForGlobals_ = !1;
        }
      }
      if (goog.evalWorksForGlobals_) {
        goog.global.eval(script);
      } else {
        var doc = goog.global.document, scriptElt = doc.createElement("SCRIPT");
        scriptElt.type = "text/javascript";
        scriptElt.defer = !1;
        scriptElt.appendChild(doc.createTextNode(script));
        doc.head.appendChild(scriptElt);
        doc.head.removeChild(scriptElt);
      }
    } else {
      throw Error("goog.globalEval not available");
    }
  }
};
goog.evalWorksForGlobals_ = null;
goog.getCssName = function(className, opt_modifier) {
  if ("." == String(className).charAt(0)) {
    throw Error('className passed in goog.getCssName must not start with ".". You passed: ' + className);
  }
  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName;
  }, renameByParts = function(cssName) {
    for (var parts = cssName.split("-"), mapped = [], i = 0; i < parts.length; i++) {
      mapped.push(getMapping(parts[i]));
    }
    return mapped.join("-");
  };
  var rename = goog.cssNameMapping_ ? "BY_WHOLE" == goog.cssNameMappingStyle_ ? getMapping : renameByParts : function(a) {
    return a;
  };
  var result = opt_modifier ? className + "-" + rename(opt_modifier) : rename(className);
  return goog.global.CLOSURE_CSS_NAME_MAP_FN ? goog.global.CLOSURE_CSS_NAME_MAP_FN(result) : result;
};
goog.setCssNameMapping = function(mapping, opt_style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = opt_style;
};
goog.getMsg = function(str, opt_values) {
  opt_values && (str = str.replace(/\{\$([^}]+)}/g, function(match, key) {
    return null != opt_values && key in opt_values ? opt_values[key] : match;
  }));
  return str;
};
goog.getMsgWithFallback = function(a) {
  return a;
};
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo);
};
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol;
};
goog.inherits = function(childCtor, parentCtor) {
  function tempCtor() {
  }
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor;
  childCtor.prototype.constructor = childCtor;
  childCtor.base = function(me, methodName, var_args) {
    for (var args = Array(arguments.length - 2), i = 2; i < arguments.length; i++) {
      args[i - 2] = arguments[i];
    }
    return parentCtor.prototype[methodName].apply(me, args);
  };
};
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if (goog.STRICT_MODE_COMPATIBLE || goog.DEBUG && !caller) {
    throw Error("arguments.caller not defined.  goog.base() cannot be used with strict mode code. See http://www.ecma-international.org/ecma-262/5.1/#sec-C");
  }
  if ("undefined" !== typeof caller.superClass_) {
    for (var ctorArgs = Array(arguments.length - 1), i = 1; i < arguments.length; i++) {
      ctorArgs[i - 1] = arguments[i];
    }
    return caller.superClass_.constructor.apply(me, ctorArgs);
  }
  if ("string" != typeof opt_methodName && "symbol" != typeof opt_methodName) {
    throw Error("method names provided to goog.base must be a string or a symbol");
  }
  var args = Array(arguments.length - 2);
  for (i = 2; i < arguments.length; i++) {
    args[i - 2] = arguments[i];
  }
  for (var foundCaller = !1, ctor = me.constructor; ctor; ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if (ctor.prototype[opt_methodName] === caller) {
      foundCaller = !0;
    } else {
      if (foundCaller) {
        return ctor.prototype[opt_methodName].apply(me, args);
      }
    }
  }
  if (me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args);
  }
  throw Error("goog.base called from a method of one name to a method of a different name");
};
goog.scope = function(fn) {
  if (goog.isInModuleLoader_()) {
    throw Error("goog.scope is not supported within a module.");
  }
  fn.call(goog.global);
};
goog.defineClass = function(superClass, def) {
  var constructor = def.constructor, statics = def.statics;
  constructor && constructor != Object.prototype.constructor || (constructor = function() {
    throw Error("cannot instantiate an interface (no constructor defined).");
  });
  var cls = goog.defineClass.createSealingConstructor_(constructor, superClass);
  superClass && goog.inherits(cls, superClass);
  delete def.constructor;
  delete def.statics;
  goog.defineClass.applyProperties_(cls.prototype, def);
  null != statics && (statics instanceof Function ? statics(cls) : goog.defineClass.applyProperties_(cls, statics));
  return cls;
};
goog.defineClass.SEAL_CLASS_INSTANCES = goog.DEBUG;
goog.defineClass.createSealingConstructor_ = function(ctr, superClass) {
  if (!goog.defineClass.SEAL_CLASS_INSTANCES) {
    return ctr;
  }
  var superclassSealable = !goog.defineClass.isUnsealable_(superClass), wrappedCtr = function() {
    var instance = ctr.apply(this, arguments) || this;
    instance[goog.UID_PROPERTY_] = instance[goog.UID_PROPERTY_];
    this.constructor === wrappedCtr && superclassSealable && Object.seal instanceof Function && Object.seal(instance);
    return instance;
  };
  return wrappedCtr;
};
goog.defineClass.isUnsealable_ = function(ctr) {
  return ctr && ctr.prototype && ctr.prototype[goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_];
};
goog.defineClass.OBJECT_PROTOTYPE_FIELDS_ = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
goog.defineClass.applyProperties_ = function(target, source) {
  for (var key in source) {
    Object.prototype.hasOwnProperty.call(source, key) && (target[key] = source[key]);
  }
  for (var i = 0; i < goog.defineClass.OBJECT_PROTOTYPE_FIELDS_.length; i++) {
    key = goog.defineClass.OBJECT_PROTOTYPE_FIELDS_[i], Object.prototype.hasOwnProperty.call(source, key) && (target[key] = source[key]);
  }
};
goog.tagUnsealableClass = function() {
};
goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_ = "goog_defineClass_legacy_unsealable";
goog.TRUSTED_TYPES_POLICY_NAME = "";
goog.identity_ = function(s) {
  return s;
};
goog.createTrustedTypesPolicy = function(name) {
  return "undefined" !== typeof TrustedTypes && TrustedTypes.createPolicy ? TrustedTypes.createPolicy(name, {createHTML:goog.identity_, createScript:goog.identity_, createScriptURL:goog.identity_, createURL:goog.identity_}) : null;
};
goog.TRUSTED_TYPES_POLICY_ = goog.TRUSTED_TYPES_POLICY_NAME ? goog.createTrustedTypesPolicy(goog.TRUSTED_TYPES_POLICY_NAME + "#base") : null;
goog.debug = {};
goog.debug.Error = function(opt_msg) {
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, goog.debug.Error);
  } else {
    var stack = Error().stack;
    stack && (this.stack = stack);
  }
  opt_msg && (this.message = String(opt_msg));
};
goog.inherits(goog.debug.Error, Error);
goog.debug.Error.prototype.name = "CustomError";
goog.dom = {};
goog.dom.NodeType = {ELEMENT:1, ATTRIBUTE:2, TEXT:3, CDATA_SECTION:4, ENTITY_REFERENCE:5, ENTITY:6, PROCESSING_INSTRUCTION:7, COMMENT:8, DOCUMENT:9, DOCUMENT_TYPE:10, DOCUMENT_FRAGMENT:11, NOTATION:12};
goog.asserts = {};
goog.asserts.ENABLE_ASSERTS = goog.DEBUG;
goog.asserts.AssertionError = function(messagePattern, messageArgs) {
  goog.debug.Error.call(this, goog.asserts.subs_(messagePattern, messageArgs));
};
goog.inherits(goog.asserts.AssertionError, goog.debug.Error);
goog.asserts.AssertionError.prototype.name = "AssertionError";
goog.asserts.DEFAULT_ERROR_HANDLER = function(e) {
  throw e;
};
goog.asserts.errorHandler_ = goog.asserts.DEFAULT_ERROR_HANDLER;
goog.asserts.subs_ = function(pattern, subs) {
  for (var splitParts = pattern.split("%s"), returnString = "", subLast = splitParts.length - 1, i = 0; i < subLast; i++) {
    returnString += splitParts[i] + (i < subs.length ? subs[i] : "%s");
  }
  return returnString + splitParts[subLast];
};
goog.asserts.doAssertFailure_ = function(defaultMessage, defaultArgs, givenMessage, givenArgs) {
  var message = "Assertion failed";
  if (givenMessage) {
    message += ": " + givenMessage;
    var args = givenArgs;
  } else {
    defaultMessage && (message += ": " + defaultMessage, args = defaultArgs);
  }
  var e = new goog.asserts.AssertionError("" + message, args || []);
  goog.asserts.errorHandler_(e);
};
goog.asserts.setErrorHandler = function(errorHandler) {
  goog.asserts.ENABLE_ASSERTS && (goog.asserts.errorHandler_ = errorHandler);
};
goog.asserts.assert = function(condition, opt_message, var_args) {
  goog.asserts.ENABLE_ASSERTS && !condition && goog.asserts.doAssertFailure_("", null, opt_message, Array.prototype.slice.call(arguments, 2));
  return condition;
};
goog.asserts.fail = function(opt_message, var_args) {
  goog.asserts.ENABLE_ASSERTS && goog.asserts.errorHandler_(new goog.asserts.AssertionError("Failure" + (opt_message ? ": " + opt_message : ""), Array.prototype.slice.call(arguments, 1)));
};
goog.asserts.assertNumber = function(value, opt_message, var_args) {
  goog.asserts.ENABLE_ASSERTS && !goog.isNumber(value) && goog.asserts.doAssertFailure_("Expected number but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2));
  return value;
};
goog.asserts.assertString = function(value, opt_message, var_args) {
  goog.asserts.ENABLE_ASSERTS && !goog.isString(value) && goog.asserts.doAssertFailure_("Expected string but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2));
  return value;
};
goog.asserts.assertFunction = function(value, opt_message, var_args) {
  goog.asserts.ENABLE_ASSERTS && !goog.isFunction(value) && goog.asserts.doAssertFailure_("Expected function but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2));
  return value;
};
goog.asserts.assertObject = function(value, opt_message, var_args) {
  goog.asserts.ENABLE_ASSERTS && !goog.isObject(value) && goog.asserts.doAssertFailure_("Expected object but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2));
  return value;
};
goog.asserts.assertArray = function(value, opt_message, var_args) {
  goog.asserts.ENABLE_ASSERTS && !goog.isArray(value) && goog.asserts.doAssertFailure_("Expected array but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2));
  return value;
};
goog.asserts.assertBoolean = function(value, opt_message, var_args) {
  goog.asserts.ENABLE_ASSERTS && !goog.isBoolean(value) && goog.asserts.doAssertFailure_("Expected boolean but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2));
  return value;
};
goog.asserts.assertElement = function(value, opt_message, var_args) {
  !goog.asserts.ENABLE_ASSERTS || goog.isObject(value) && value.nodeType == goog.dom.NodeType.ELEMENT || goog.asserts.doAssertFailure_("Expected Element but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2));
  return value;
};
goog.asserts.assertInstanceof = function(value, type, opt_message, var_args) {
  !goog.asserts.ENABLE_ASSERTS || value instanceof type || goog.asserts.doAssertFailure_("Expected instanceof %s but got %s.", [goog.asserts.getType_(type), goog.asserts.getType_(value)], opt_message, Array.prototype.slice.call(arguments, 3));
  return value;
};
goog.asserts.assertFinite = function(value, opt_message, var_args) {
  !goog.asserts.ENABLE_ASSERTS || "number" == typeof value && isFinite(value) || goog.asserts.doAssertFailure_("Expected %s to be a finite number but it is not.", [value], opt_message, Array.prototype.slice.call(arguments, 2));
  return value;
};
goog.asserts.assertObjectPrototypeIsIntact = function() {
  for (var key in Object.prototype) {
    goog.asserts.fail(key + " should not be enumerable in Object.prototype.");
  }
};
goog.asserts.getType_ = function(value) {
  return value instanceof Function ? value.displayName || value.name || "unknown type name" : value instanceof Object ? value.constructor.displayName || value.constructor.name || Object.prototype.toString.call(value) : null === value ? "null" : typeof value;
};
goog.array = {};
goog.NATIVE_ARRAY_PROTOTYPES = goog.TRUSTED_SITE;
goog.array.ASSUME_NATIVE_FUNCTIONS = !1;
goog.array.peek = function(array) {
  return array[array.length - 1];
};
goog.array.last = goog.array.peek;
goog.array.indexOf = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.indexOf) ? function(arr, obj, opt_fromIndex) {
  goog.asserts.assert(null != arr.length);
  return Array.prototype.indexOf.call(arr, obj, opt_fromIndex);
} : function(arr, obj, opt_fromIndex) {
  var fromIndex = null == opt_fromIndex ? 0 : 0 > opt_fromIndex ? Math.max(0, arr.length + opt_fromIndex) : opt_fromIndex;
  if (goog.isString(arr)) {
    return goog.isString(obj) && 1 == obj.length ? arr.indexOf(obj, fromIndex) : -1;
  }
  for (var i = fromIndex; i < arr.length; i++) {
    if (i in arr && arr[i] === obj) {
      return i;
    }
  }
  return -1;
};
goog.array.lastIndexOf = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.lastIndexOf) ? function(arr, obj, opt_fromIndex) {
  goog.asserts.assert(null != arr.length);
  return Array.prototype.lastIndexOf.call(arr, obj, null == opt_fromIndex ? arr.length - 1 : opt_fromIndex);
} : function(arr, obj, opt_fromIndex) {
  var fromIndex = null == opt_fromIndex ? arr.length - 1 : opt_fromIndex;
  0 > fromIndex && (fromIndex = Math.max(0, arr.length + fromIndex));
  if (goog.isString(arr)) {
    return goog.isString(obj) && 1 == obj.length ? arr.lastIndexOf(obj, fromIndex) : -1;
  }
  for (var i = fromIndex; 0 <= i; i--) {
    if (i in arr && arr[i] === obj) {
      return i;
    }
  }
  return -1;
};
goog.array.forEach = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.forEach) ? function(arr, f, opt_obj) {
  goog.asserts.assert(null != arr.length);
  Array.prototype.forEach.call(arr, f, opt_obj);
} : function(arr, f, opt_obj) {
  for (var l = arr.length, arr2 = goog.isString(arr) ? arr.split("") : arr, i = 0; i < l; i++) {
    i in arr2 && f.call(opt_obj, arr2[i], i, arr);
  }
};
goog.array.forEachRight = function(arr, f, opt_obj) {
  for (var l = arr.length, arr2 = goog.isString(arr) ? arr.split("") : arr, i = l - 1; 0 <= i; --i) {
    i in arr2 && f.call(opt_obj, arr2[i], i, arr);
  }
};
goog.array.filter = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.filter) ? function(arr, f, opt_obj) {
  goog.asserts.assert(null != arr.length);
  return Array.prototype.filter.call(arr, f, opt_obj);
} : function(arr, f, opt_obj) {
  for (var l = arr.length, res = [], resLength = 0, arr2 = goog.isString(arr) ? arr.split("") : arr, i = 0; i < l; i++) {
    if (i in arr2) {
      var val = arr2[i];
      f.call(opt_obj, val, i, arr) && (res[resLength++] = val);
    }
  }
  return res;
};
goog.array.map = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.map) ? function(arr, f, opt_obj) {
  goog.asserts.assert(null != arr.length);
  return Array.prototype.map.call(arr, f, opt_obj);
} : function(arr, f, opt_obj) {
  for (var l = arr.length, res = Array(l), arr2 = goog.isString(arr) ? arr.split("") : arr, i = 0; i < l; i++) {
    i in arr2 && (res[i] = f.call(opt_obj, arr2[i], i, arr));
  }
  return res;
};
goog.array.reduce = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.reduce) ? function(arr, f, val, opt_obj) {
  goog.asserts.assert(null != arr.length);
  opt_obj && (f = goog.bind(f, opt_obj));
  return Array.prototype.reduce.call(arr, f, val);
} : function(arr, f, val$jscomp$0, opt_obj) {
  var rval = val$jscomp$0;
  goog.array.forEach(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr);
  });
  return rval;
};
goog.array.reduceRight = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.reduceRight) ? function(arr, f, val, opt_obj) {
  goog.asserts.assert(null != arr.length);
  goog.asserts.assert(null != f);
  opt_obj && (f = goog.bind(f, opt_obj));
  return Array.prototype.reduceRight.call(arr, f, val);
} : function(arr, f, val$jscomp$0, opt_obj) {
  var rval = val$jscomp$0;
  goog.array.forEachRight(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr);
  });
  return rval;
};
goog.array.some = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.some) ? function(arr, f, opt_obj) {
  goog.asserts.assert(null != arr.length);
  return Array.prototype.some.call(arr, f, opt_obj);
} : function(arr, f, opt_obj) {
  for (var l = arr.length, arr2 = goog.isString(arr) ? arr.split("") : arr, i = 0; i < l; i++) {
    if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return !0;
    }
  }
  return !1;
};
goog.array.every = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.every) ? function(arr, f, opt_obj) {
  goog.asserts.assert(null != arr.length);
  return Array.prototype.every.call(arr, f, opt_obj);
} : function(arr, f, opt_obj) {
  for (var l = arr.length, arr2 = goog.isString(arr) ? arr.split("") : arr, i = 0; i < l; i++) {
    if (i in arr2 && !f.call(opt_obj, arr2[i], i, arr)) {
      return !1;
    }
  }
  return !0;
};
goog.array.count = function(arr$jscomp$0, f, opt_obj) {
  var count = 0;
  goog.array.forEach(arr$jscomp$0, function(element, index, arr) {
    f.call(opt_obj, element, index, arr) && ++count;
  }, opt_obj);
  return count;
};
goog.array.find = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  return 0 > i ? null : goog.isString(arr) ? arr.charAt(i) : arr[i];
};
goog.array.findIndex = function(arr, f, opt_obj) {
  for (var l = arr.length, arr2 = goog.isString(arr) ? arr.split("") : arr, i = 0; i < l; i++) {
    if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i;
    }
  }
  return -1;
};
goog.array.findRight = function(arr, f, opt_obj) {
  var i = goog.array.findIndexRight(arr, f, opt_obj);
  return 0 > i ? null : goog.isString(arr) ? arr.charAt(i) : arr[i];
};
goog.array.findIndexRight = function(arr, f, opt_obj) {
  for (var l = arr.length, arr2 = goog.isString(arr) ? arr.split("") : arr, i = l - 1; 0 <= i; i--) {
    if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i;
    }
  }
  return -1;
};
goog.array.contains = function(arr, obj) {
  return 0 <= goog.array.indexOf(arr, obj);
};
goog.array.isEmpty = function(arr) {
  return 0 == arr.length;
};
goog.array.clear = function(arr) {
  if (!goog.isArray(arr)) {
    for (var i = arr.length - 1; 0 <= i; i--) {
      delete arr[i];
    }
  }
  arr.length = 0;
};
goog.array.insert = function(arr, obj) {
  goog.array.contains(arr, obj) || arr.push(obj);
};
goog.array.insertAt = function(arr, obj, opt_i) {
  goog.array.splice(arr, opt_i, 0, obj);
};
goog.array.insertArrayAt = function(arr, elementsToAdd, opt_i) {
  goog.partial(goog.array.splice, arr, opt_i, 0).apply(null, elementsToAdd);
};
goog.array.insertBefore = function(arr, obj, opt_obj2) {
  var i;
  2 == arguments.length || 0 > (i = goog.array.indexOf(arr, opt_obj2)) ? arr.push(obj) : goog.array.insertAt(arr, obj, i);
};
goog.array.remove = function(arr, obj) {
  var i = goog.array.indexOf(arr, obj), rv;
  (rv = 0 <= i) && goog.array.removeAt(arr, i);
  return rv;
};
goog.array.removeLast = function(arr, obj) {
  var i = goog.array.lastIndexOf(arr, obj);
  return 0 <= i ? (goog.array.removeAt(arr, i), !0) : !1;
};
goog.array.removeAt = function(arr, i) {
  goog.asserts.assert(null != arr.length);
  return 1 == Array.prototype.splice.call(arr, i, 1).length;
};
goog.array.removeIf = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  return 0 <= i ? (goog.array.removeAt(arr, i), !0) : !1;
};
goog.array.removeAllIf = function(arr, f, opt_obj) {
  var removedCount = 0;
  goog.array.forEachRight(arr, function(val, index) {
    f.call(opt_obj, val, index, arr) && goog.array.removeAt(arr, index) && removedCount++;
  });
  return removedCount;
};
goog.array.concat = function(var_args) {
  return Array.prototype.concat.apply([], arguments);
};
goog.array.join = function(var_args) {
  return Array.prototype.concat.apply([], arguments);
};
goog.array.toArray = function(object) {
  var length = object.length;
  if (0 < length) {
    for (var rv = Array(length), i = 0; i < length; i++) {
      rv[i] = object[i];
    }
    return rv;
  }
  return [];
};
goog.array.clone = goog.array.toArray;
goog.array.extend = function(arr1, var_args) {
  for (var i = 1; i < arguments.length; i++) {
    var arr2 = arguments[i];
    if (goog.isArrayLike(arr2)) {
      var len1 = arr1.length || 0, len2 = arr2.length || 0;
      arr1.length = len1 + len2;
      for (var j = 0; j < len2; j++) {
        arr1[len1 + j] = arr2[j];
      }
    } else {
      arr1.push(arr2);
    }
  }
};
goog.array.splice = function(arr, index, howMany, var_args) {
  goog.asserts.assert(null != arr.length);
  return Array.prototype.splice.apply(arr, goog.array.slice(arguments, 1));
};
goog.array.slice = function(arr, start, opt_end) {
  goog.asserts.assert(null != arr.length);
  return 2 >= arguments.length ? Array.prototype.slice.call(arr, start) : Array.prototype.slice.call(arr, start, opt_end);
};
goog.array.removeDuplicates = function(arr, opt_rv, opt_hashFn) {
  for (var returnArray = opt_rv || arr, defaultHashFn = function(item) {
    return goog.isObject(item) ? "o" + goog.getUid(item) : (typeof item).charAt(0) + item;
  }, hashFn = opt_hashFn || defaultHashFn, seen = {}, cursorInsert = 0, cursorRead = 0; cursorRead < arr.length;) {
    var current = arr[cursorRead++], key = hashFn(current);
    Object.prototype.hasOwnProperty.call(seen, key) || (seen[key] = !0, returnArray[cursorInsert++] = current);
  }
  returnArray.length = cursorInsert;
};
goog.array.binarySearch = function(arr, target, opt_compareFn) {
  return goog.array.binarySearch_(arr, opt_compareFn || goog.array.defaultCompare, !1, target);
};
goog.array.binarySelect = function(arr, evaluator, opt_obj) {
  return goog.array.binarySearch_(arr, evaluator, !0, void 0, opt_obj);
};
goog.array.binarySearch_ = function(arr, compareFn, isEvaluator, opt_target, opt_selfObj) {
  for (var left = 0, right = arr.length, found; left < right;) {
    var middle = left + right >> 1;
    var compareResult = isEvaluator ? compareFn.call(opt_selfObj, arr[middle], middle, arr) : compareFn(opt_target, arr[middle]);
    0 < compareResult ? left = middle + 1 : (right = middle, found = !compareResult);
  }
  return found ? left : ~left;
};
goog.array.sort = function(arr, opt_compareFn) {
  arr.sort(opt_compareFn || goog.array.defaultCompare);
};
goog.array.stableSort = function(arr, opt_compareFn) {
  for (var compArr = Array(arr.length), i = 0; i < arr.length; i++) {
    compArr[i] = {index:i, value:arr[i]};
  }
  var valueCompareFn = opt_compareFn || goog.array.defaultCompare;
  goog.array.sort(compArr, function(obj1, obj2) {
    return valueCompareFn(obj1.value, obj2.value) || obj1.index - obj2.index;
  });
  for (i = 0; i < arr.length; i++) {
    arr[i] = compArr[i].value;
  }
};
goog.array.sortByKey = function(arr, keyFn, opt_compareFn) {
  var keyCompareFn = opt_compareFn || goog.array.defaultCompare;
  goog.array.sort(arr, function(a, b) {
    return keyCompareFn(keyFn(a), keyFn(b));
  });
};
goog.array.sortObjectsByKey = function(arr, key, opt_compareFn) {
  goog.array.sortByKey(arr, function(obj) {
    return obj[key];
  }, opt_compareFn);
};
goog.array.isSorted = function(arr, opt_compareFn, opt_strict) {
  for (var compare = opt_compareFn || goog.array.defaultCompare, i = 1; i < arr.length; i++) {
    var compareResult = compare(arr[i - 1], arr[i]);
    if (0 < compareResult || 0 == compareResult && opt_strict) {
      return !1;
    }
  }
  return !0;
};
goog.array.equals = function(arr1, arr2, opt_equalsFn) {
  if (!goog.isArrayLike(arr1) || !goog.isArrayLike(arr2) || arr1.length != arr2.length) {
    return !1;
  }
  for (var l = arr1.length, equalsFn = opt_equalsFn || goog.array.defaultCompareEquality, i = 0; i < l; i++) {
    if (!equalsFn(arr1[i], arr2[i])) {
      return !1;
    }
  }
  return !0;
};
goog.array.compare3 = function(arr1, arr2, opt_compareFn) {
  for (var compare = opt_compareFn || goog.array.defaultCompare, l = Math.min(arr1.length, arr2.length), i = 0; i < l; i++) {
    var result = compare(arr1[i], arr2[i]);
    if (0 != result) {
      return result;
    }
  }
  return goog.array.defaultCompare(arr1.length, arr2.length);
};
goog.array.defaultCompare = function(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
};
goog.array.inverseDefaultCompare = function(a, b) {
  return -goog.array.defaultCompare(a, b);
};
goog.array.defaultCompareEquality = function(a, b) {
  return a === b;
};
goog.array.binaryInsert = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  return 0 > index ? (goog.array.insertAt(array, value, -(index + 1)), !0) : !1;
};
goog.array.binaryRemove = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  return 0 <= index ? goog.array.removeAt(array, index) : !1;
};
goog.array.bucket = function(array, sorter, opt_obj) {
  for (var buckets = {}, i = 0; i < array.length; i++) {
    var value = array[i], key = sorter.call(opt_obj, value, i, array);
    goog.isDef(key) && (buckets[key] || (buckets[key] = [])).push(value);
  }
  return buckets;
};
goog.array.toObject = function(arr, keyFunc, opt_obj) {
  var ret = {};
  goog.array.forEach(arr, function(element, index) {
    ret[keyFunc.call(opt_obj, element, index, arr)] = element;
  });
  return ret;
};
goog.array.range = function(startOrEnd, opt_end, opt_step) {
  var array = [], start = 0, end = startOrEnd, step = opt_step || 1;
  void 0 !== opt_end && (start = startOrEnd, end = opt_end);
  if (0 > step * (end - start)) {
    return [];
  }
  if (0 < step) {
    for (var i = start; i < end; i += step) {
      array.push(i);
    }
  } else {
    for (i = start; i > end; i += step) {
      array.push(i);
    }
  }
  return array;
};
goog.array.repeat = function(value, n) {
  for (var array = [], i = 0; i < n; i++) {
    array[i] = value;
  }
  return array;
};
goog.array.flatten = function(var_args) {
  for (var result = [], i = 0; i < arguments.length; i++) {
    var element = arguments[i];
    if (goog.isArray(element)) {
      for (var c = 0; c < element.length; c += 8192) {
        for (var chunk = goog.array.slice(element, c, c + 8192), recurseResult = goog.array.flatten.apply(null, chunk), r = 0; r < recurseResult.length; r++) {
          result.push(recurseResult[r]);
        }
      }
    } else {
      result.push(element);
    }
  }
  return result;
};
goog.array.rotate = function(array, n) {
  goog.asserts.assert(null != array.length);
  array.length && (n %= array.length, 0 < n ? Array.prototype.unshift.apply(array, array.splice(-n, n)) : 0 > n && Array.prototype.push.apply(array, array.splice(0, -n)));
  return array;
};
goog.array.moveItem = function(arr, fromIndex, toIndex) {
  goog.asserts.assert(0 <= fromIndex && fromIndex < arr.length);
  goog.asserts.assert(0 <= toIndex && toIndex < arr.length);
  var removedItems = Array.prototype.splice.call(arr, fromIndex, 1);
  Array.prototype.splice.call(arr, toIndex, 0, removedItems[0]);
};
goog.array.zip = function(var_args) {
  if (!arguments.length) {
    return [];
  }
  for (var result = [], minLen = arguments[0].length, i = 1; i < arguments.length; i++) {
    arguments[i].length < minLen && (minLen = arguments[i].length);
  }
  for (i = 0; i < minLen; i++) {
    for (var value = [], j = 0; j < arguments.length; j++) {
      value.push(arguments[j][i]);
    }
    result.push(value);
  }
  return result;
};
goog.array.shuffle = function(arr, opt_randFn) {
  for (var randFn = opt_randFn || Math.random, i = arr.length - 1; 0 < i; i--) {
    var j = Math.floor(randFn() * (i + 1)), tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
};
goog.array.copyByIndex = function(arr, index_arr) {
  var result = [];
  goog.array.forEach(index_arr, function(index) {
    result.push(arr[index]);
  });
  return result;
};
goog.array.concatMap = function(arr, f, opt_obj) {
  return goog.array.concat.apply([], goog.array.map(arr, f, opt_obj));
};
goog.debug.errorcontext = {};
goog.debug.errorcontext.addErrorContext = function(err, contextKey, contextValue) {
  err[goog.debug.errorcontext.CONTEXT_KEY_] || (err[goog.debug.errorcontext.CONTEXT_KEY_] = {});
  err[goog.debug.errorcontext.CONTEXT_KEY_][contextKey] = contextValue;
};
goog.debug.errorcontext.getErrorContext = function(err) {
  return err[goog.debug.errorcontext.CONTEXT_KEY_] || {};
};
goog.debug.errorcontext.CONTEXT_KEY_ = "__closure__error__context__984382";
goog.string = {};
goog.string.internal = {};
goog.string.internal.startsWith = function(str, prefix) {
  return 0 == str.lastIndexOf(prefix, 0);
};
goog.string.internal.endsWith = function(str, suffix) {
  var l = str.length - suffix.length;
  return 0 <= l && str.indexOf(suffix, l) == l;
};
goog.string.internal.caseInsensitiveStartsWith = function(str, prefix) {
  return 0 == goog.string.internal.caseInsensitiveCompare(prefix, str.substr(0, prefix.length));
};
goog.string.internal.caseInsensitiveEndsWith = function(str, suffix) {
  return 0 == goog.string.internal.caseInsensitiveCompare(suffix, str.substr(str.length - suffix.length, suffix.length));
};
goog.string.internal.caseInsensitiveEquals = function(str1, str2) {
  return str1.toLowerCase() == str2.toLowerCase();
};
goog.string.internal.isEmptyOrWhitespace = function(str) {
  return /^[\s\xa0]*$/.test(str);
};
goog.string.internal.trim = goog.TRUSTED_SITE && String.prototype.trim ? function(str) {
  return str.trim();
} : function(str) {
  return /^[\s\xa0]*([\s\S]*?)[\s\xa0]*$/.exec(str)[1];
};
goog.string.internal.caseInsensitiveCompare = function(str1, str2) {
  var test1 = String(str1).toLowerCase(), test2 = String(str2).toLowerCase();
  return test1 < test2 ? -1 : test1 == test2 ? 0 : 1;
};
goog.string.internal.newLineToBr = function(str, opt_xml) {
  return str.replace(/(\r\n|\r|\n)/g, opt_xml ? "<br />" : "<br>");
};
goog.string.internal.htmlEscape = function(str, opt_isLikelyToContainHtmlChars) {
  if (opt_isLikelyToContainHtmlChars) {
    str = str.replace(goog.string.internal.AMP_RE_, "&amp;").replace(goog.string.internal.LT_RE_, "&lt;").replace(goog.string.internal.GT_RE_, "&gt;").replace(goog.string.internal.QUOT_RE_, "&quot;").replace(goog.string.internal.SINGLE_QUOTE_RE_, "&#39;").replace(goog.string.internal.NULL_RE_, "&#0;");
  } else {
    if (!goog.string.internal.ALL_RE_.test(str)) {
      return str;
    }
    -1 != str.indexOf("&") && (str = str.replace(goog.string.internal.AMP_RE_, "&amp;"));
    -1 != str.indexOf("<") && (str = str.replace(goog.string.internal.LT_RE_, "&lt;"));
    -1 != str.indexOf(">") && (str = str.replace(goog.string.internal.GT_RE_, "&gt;"));
    -1 != str.indexOf('"') && (str = str.replace(goog.string.internal.QUOT_RE_, "&quot;"));
    -1 != str.indexOf("'") && (str = str.replace(goog.string.internal.SINGLE_QUOTE_RE_, "&#39;"));
    -1 != str.indexOf("\x00") && (str = str.replace(goog.string.internal.NULL_RE_, "&#0;"));
  }
  return str;
};
goog.string.internal.AMP_RE_ = /&/g;
goog.string.internal.LT_RE_ = /</g;
goog.string.internal.GT_RE_ = />/g;
goog.string.internal.QUOT_RE_ = /"/g;
goog.string.internal.SINGLE_QUOTE_RE_ = /'/g;
goog.string.internal.NULL_RE_ = /\x00/g;
goog.string.internal.ALL_RE_ = /[\x00&<>"']/;
goog.string.internal.whitespaceEscape = function(str, opt_xml) {
  return goog.string.internal.newLineToBr(str.replace(/  /g, " &#160;"), opt_xml);
};
goog.string.internal.contains = function(str, subString) {
  return -1 != str.indexOf(subString);
};
goog.string.internal.caseInsensitiveContains = function(str, subString) {
  return goog.string.internal.contains(str.toLowerCase(), subString.toLowerCase());
};
goog.string.internal.compareVersions = function(version1, version2) {
  for (var order = 0, v1Subs = goog.string.internal.trim(String(version1)).split("."), v2Subs = goog.string.internal.trim(String(version2)).split("."), subCount = Math.max(v1Subs.length, v2Subs.length), subIdx = 0; 0 == order && subIdx < subCount; subIdx++) {
    var v1Sub = v1Subs[subIdx] || "", v2Sub = v2Subs[subIdx] || "";
    do {
      var v1Comp = /(\d*)(\D*)(.*)/.exec(v1Sub) || ["", "", "", ""], v2Comp = /(\d*)(\D*)(.*)/.exec(v2Sub) || ["", "", "", ""];
      if (0 == v1Comp[0].length && 0 == v2Comp[0].length) {
        break;
      }
      order = goog.string.internal.compareElements_(0 == v1Comp[1].length ? 0 : parseInt(v1Comp[1], 10), 0 == v2Comp[1].length ? 0 : parseInt(v2Comp[1], 10)) || goog.string.internal.compareElements_(0 == v1Comp[2].length, 0 == v2Comp[2].length) || goog.string.internal.compareElements_(v1Comp[2], v2Comp[2]);
      v1Sub = v1Comp[3];
      v2Sub = v2Comp[3];
    } while (0 == order);
  }
  return order;
};
goog.string.internal.compareElements_ = function(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
};
goog.labs = {};
goog.labs.userAgent = {};
goog.labs.userAgent.util = {};
goog.labs.userAgent.util.getNativeUserAgentString_ = function() {
  var navigator = goog.labs.userAgent.util.getNavigator_();
  if (navigator) {
    var userAgent = navigator.userAgent;
    if (userAgent) {
      return userAgent;
    }
  }
  return "";
};
goog.labs.userAgent.util.getNavigator_ = function() {
  return goog.global.navigator;
};
goog.labs.userAgent.util.userAgent_ = goog.labs.userAgent.util.getNativeUserAgentString_();
goog.labs.userAgent.util.setUserAgent = function(opt_userAgent) {
  goog.labs.userAgent.util.userAgent_ = opt_userAgent || goog.labs.userAgent.util.getNativeUserAgentString_();
};
goog.labs.userAgent.util.getUserAgent = function() {
  return goog.labs.userAgent.util.userAgent_;
};
goog.labs.userAgent.util.matchUserAgent = function(str) {
  return goog.string.internal.contains(goog.labs.userAgent.util.getUserAgent(), str);
};
goog.labs.userAgent.util.matchUserAgentIgnoreCase = function(str) {
  return goog.string.internal.caseInsensitiveContains(goog.labs.userAgent.util.getUserAgent(), str);
};
goog.labs.userAgent.util.extractVersionTuples = function(userAgent) {
  for (var versionRegExp = /(\w[\w ]+)\/([^\s]+)\s*(?:\((.*?)\))?/g, data = [], match; match = versionRegExp.exec(userAgent);) {
    data.push([match[1], match[2], match[3] || void 0]);
  }
  return data;
};
goog.object = {};
goog.object.is = function(v, v2) {
  return v === v2 ? 0 !== v || 1 / v === 1 / v2 : v !== v && v2 !== v2;
};
goog.object.forEach = function(obj, f, opt_obj) {
  for (var key in obj) {
    f.call(opt_obj, obj[key], key, obj);
  }
};
goog.object.filter = function(obj, f, opt_obj) {
  var res = {}, key;
  for (key in obj) {
    f.call(opt_obj, obj[key], key, obj) && (res[key] = obj[key]);
  }
  return res;
};
goog.object.map = function(obj, f, opt_obj) {
  var res = {}, key;
  for (key in obj) {
    res[key] = f.call(opt_obj, obj[key], key, obj);
  }
  return res;
};
goog.object.some = function(obj, f, opt_obj) {
  for (var key in obj) {
    if (f.call(opt_obj, obj[key], key, obj)) {
      return !0;
    }
  }
  return !1;
};
goog.object.every = function(obj, f, opt_obj) {
  for (var key in obj) {
    if (!f.call(opt_obj, obj[key], key, obj)) {
      return !1;
    }
  }
  return !0;
};
goog.object.getCount = function(obj) {
  var rv = 0, key;
  for (key in obj) {
    rv++;
  }
  return rv;
};
goog.object.getAnyKey = function(obj) {
  for (var key in obj) {
    return key;
  }
};
goog.object.getAnyValue = function(obj) {
  for (var key in obj) {
    return obj[key];
  }
};
goog.object.contains = function(obj, val) {
  return goog.object.containsValue(obj, val);
};
goog.object.getValues = function(obj) {
  var res = [], i = 0, key;
  for (key in obj) {
    res[i++] = obj[key];
  }
  return res;
};
goog.object.getKeys = function(obj) {
  var res = [], i = 0, key;
  for (key in obj) {
    res[i++] = key;
  }
  return res;
};
goog.object.getValueByKeys = function(obj, var_args) {
  for (var isArrayLike = goog.isArrayLike(var_args), keys = isArrayLike ? var_args : arguments, i = isArrayLike ? 0 : 1; i < keys.length; i++) {
    if (null == obj) {
      return;
    }
    obj = obj[keys[i]];
  }
  return obj;
};
goog.object.containsKey = function(obj, key) {
  return null !== obj && key in obj;
};
goog.object.containsValue = function(obj, val) {
  for (var key in obj) {
    if (obj[key] == val) {
      return !0;
    }
  }
  return !1;
};
goog.object.findKey = function(obj, f, opt_this) {
  for (var key in obj) {
    if (f.call(opt_this, obj[key], key, obj)) {
      return key;
    }
  }
};
goog.object.findValue = function(obj, f, opt_this) {
  var key = goog.object.findKey(obj, f, opt_this);
  return key && obj[key];
};
goog.object.isEmpty = function(obj) {
  for (var key in obj) {
    return !1;
  }
  return !0;
};
goog.object.clear = function(obj) {
  for (var i in obj) {
    delete obj[i];
  }
};
goog.object.remove = function(obj, key) {
  var rv;
  (rv = key in obj) && delete obj[key];
  return rv;
};
goog.object.add = function(obj, key, val) {
  if (null !== obj && key in obj) {
    throw Error('The object already contains the key "' + key + '"');
  }
  goog.object.set(obj, key, val);
};
goog.object.get = function(obj, key, opt_val) {
  return null !== obj && key in obj ? obj[key] : opt_val;
};
goog.object.set = function(obj, key, value) {
  obj[key] = value;
};
goog.object.setIfUndefined = function(obj, key, value) {
  return key in obj ? obj[key] : obj[key] = value;
};
goog.object.setWithReturnValueIfNotSet = function(obj, key, f) {
  if (key in obj) {
    return obj[key];
  }
  var val = f();
  return obj[key] = val;
};
goog.object.equals = function(a, b) {
  for (var k in a) {
    if (!(k in b) || a[k] !== b[k]) {
      return !1;
    }
  }
  for (k in b) {
    if (!(k in a)) {
      return !1;
    }
  }
  return !0;
};
goog.object.clone = function(obj) {
  var res = {}, key;
  for (key in obj) {
    res[key] = obj[key];
  }
  return res;
};
goog.object.unsafeClone = function(obj) {
  var type = goog.typeOf(obj);
  if ("object" == type || "array" == type) {
    if (goog.isFunction(obj.clone)) {
      return obj.clone();
    }
    var clone = "array" == type ? [] : {}, key;
    for (key in obj) {
      clone[key] = goog.object.unsafeClone(obj[key]);
    }
    return clone;
  }
  return obj;
};
goog.object.transpose = function(obj) {
  var transposed = {}, key;
  for (key in obj) {
    transposed[obj[key]] = key;
  }
  return transposed;
};
goog.object.PROTOTYPE_FIELDS_ = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
goog.object.extend = function(target, var_args) {
  for (var key, source, i = 1; i < arguments.length; i++) {
    source = arguments[i];
    for (key in source) {
      target[key] = source[key];
    }
    for (var j = 0; j < goog.object.PROTOTYPE_FIELDS_.length; j++) {
      key = goog.object.PROTOTYPE_FIELDS_[j], Object.prototype.hasOwnProperty.call(source, key) && (target[key] = source[key]);
    }
  }
};
goog.object.create = function(var_args) {
  var argLength = arguments.length;
  if (1 == argLength && goog.isArray(arguments[0])) {
    return goog.object.create.apply(null, arguments[0]);
  }
  if (argLength % 2) {
    throw Error("Uneven number of arguments");
  }
  for (var rv = {}, i = 0; i < argLength; i += 2) {
    rv[arguments[i]] = arguments[i + 1];
  }
  return rv;
};
goog.object.createSet = function(var_args) {
  var argLength = arguments.length;
  if (1 == argLength && goog.isArray(arguments[0])) {
    return goog.object.createSet.apply(null, arguments[0]);
  }
  for (var rv = {}, i = 0; i < argLength; i++) {
    rv[arguments[i]] = !0;
  }
  return rv;
};
goog.object.createImmutableView = function(obj) {
  var result = obj;
  Object.isFrozen && !Object.isFrozen(obj) && (result = Object.create(obj), Object.freeze(result));
  return result;
};
goog.object.isImmutableView = function(obj) {
  return !!Object.isFrozen && Object.isFrozen(obj);
};
goog.object.getAllPropertyNames = function(obj, opt_includeObjectPrototype, opt_includeFunctionPrototype) {
  if (!obj) {
    return [];
  }
  if (!Object.getOwnPropertyNames || !Object.getPrototypeOf) {
    return goog.object.getKeys(obj);
  }
  for (var visitedSet = {}, proto = obj; proto && (proto !== Object.prototype || opt_includeObjectPrototype) && (proto !== Function.prototype || opt_includeFunctionPrototype);) {
    for (var names = Object.getOwnPropertyNames(proto), i = 0; i < names.length; i++) {
      visitedSet[names[i]] = !0;
    }
    proto = Object.getPrototypeOf(proto);
  }
  return goog.object.getKeys(visitedSet);
};
goog.labs.userAgent.browser = {};
goog.labs.userAgent.browser.matchOpera_ = function() {
  return goog.labs.userAgent.util.matchUserAgent("Opera");
};
goog.labs.userAgent.browser.matchIE_ = function() {
  return goog.labs.userAgent.util.matchUserAgent("Trident") || goog.labs.userAgent.util.matchUserAgent("MSIE");
};
goog.labs.userAgent.browser.matchEdge_ = function() {
  return goog.labs.userAgent.util.matchUserAgent("Edge");
};
goog.labs.userAgent.browser.matchFirefox_ = function() {
  return goog.labs.userAgent.util.matchUserAgent("Firefox") || goog.labs.userAgent.util.matchUserAgent("FxiOS");
};
goog.labs.userAgent.browser.matchSafari_ = function() {
  return goog.labs.userAgent.util.matchUserAgent("Safari") && !(goog.labs.userAgent.browser.matchChrome_() || goog.labs.userAgent.browser.matchCoast_() || goog.labs.userAgent.browser.matchOpera_() || goog.labs.userAgent.browser.matchEdge_() || goog.labs.userAgent.browser.matchFirefox_() || goog.labs.userAgent.browser.isSilk() || goog.labs.userAgent.util.matchUserAgent("Android"));
};
goog.labs.userAgent.browser.matchCoast_ = function() {
  return goog.labs.userAgent.util.matchUserAgent("Coast");
};
goog.labs.userAgent.browser.matchIosWebview_ = function() {
  return (goog.labs.userAgent.util.matchUserAgent("iPad") || goog.labs.userAgent.util.matchUserAgent("iPhone")) && !goog.labs.userAgent.browser.matchSafari_() && !goog.labs.userAgent.browser.matchChrome_() && !goog.labs.userAgent.browser.matchCoast_() && !goog.labs.userAgent.browser.matchFirefox_() && goog.labs.userAgent.util.matchUserAgent("AppleWebKit");
};
goog.labs.userAgent.browser.matchChrome_ = function() {
  return (goog.labs.userAgent.util.matchUserAgent("Chrome") || goog.labs.userAgent.util.matchUserAgent("CriOS")) && !goog.labs.userAgent.browser.matchEdge_();
};
goog.labs.userAgent.browser.matchAndroidBrowser_ = function() {
  return goog.labs.userAgent.util.matchUserAgent("Android") && !(goog.labs.userAgent.browser.isChrome() || goog.labs.userAgent.browser.isFirefox() || goog.labs.userAgent.browser.isOpera() || goog.labs.userAgent.browser.isSilk());
};
goog.labs.userAgent.browser.isOpera = goog.labs.userAgent.browser.matchOpera_;
goog.labs.userAgent.browser.isIE = goog.labs.userAgent.browser.matchIE_;
goog.labs.userAgent.browser.isEdge = goog.labs.userAgent.browser.matchEdge_;
goog.labs.userAgent.browser.isFirefox = goog.labs.userAgent.browser.matchFirefox_;
goog.labs.userAgent.browser.isSafari = goog.labs.userAgent.browser.matchSafari_;
goog.labs.userAgent.browser.isCoast = goog.labs.userAgent.browser.matchCoast_;
goog.labs.userAgent.browser.isIosWebview = goog.labs.userAgent.browser.matchIosWebview_;
goog.labs.userAgent.browser.isChrome = goog.labs.userAgent.browser.matchChrome_;
goog.labs.userAgent.browser.isAndroidBrowser = goog.labs.userAgent.browser.matchAndroidBrowser_;
goog.labs.userAgent.browser.isSilk = function() {
  return goog.labs.userAgent.util.matchUserAgent("Silk");
};
goog.labs.userAgent.browser.getVersion = function() {
  function lookUpValueWithKeys(keys) {
    var key = goog.array.find(keys, versionMapHasKey);
    return versionMap[key] || "";
  }
  var userAgentString = goog.labs.userAgent.util.getUserAgent();
  if (goog.labs.userAgent.browser.isIE()) {
    return goog.labs.userAgent.browser.getIEVersion_(userAgentString);
  }
  var versionTuples = goog.labs.userAgent.util.extractVersionTuples(userAgentString), versionMap = {};
  goog.array.forEach(versionTuples, function(tuple) {
    versionMap[tuple[0]] = tuple[1];
  });
  var versionMapHasKey = goog.partial(goog.object.containsKey, versionMap);
  if (goog.labs.userAgent.browser.isOpera()) {
    return lookUpValueWithKeys(["Version", "Opera"]);
  }
  if (goog.labs.userAgent.browser.isEdge()) {
    return lookUpValueWithKeys(["Edge"]);
  }
  if (goog.labs.userAgent.browser.isChrome()) {
    return lookUpValueWithKeys(["Chrome", "CriOS"]);
  }
  var tuple = versionTuples[2];
  return tuple && tuple[1] || "";
};
goog.labs.userAgent.browser.isVersionOrHigher = function(version) {
  return 0 <= goog.string.internal.compareVersions(goog.labs.userAgent.browser.getVersion(), version);
};
goog.labs.userAgent.browser.getIEVersion_ = function(userAgent) {
  var rv = /rv: *([\d\.]*)/.exec(userAgent);
  if (rv && rv[1]) {
    return rv[1];
  }
  var version = "", msie = /MSIE +([\d\.]+)/.exec(userAgent);
  if (msie && msie[1]) {
    var tridentVersion = /Trident\/(\d.\d)/.exec(userAgent);
    if ("7.0" == msie[1]) {
      if (tridentVersion && tridentVersion[1]) {
        switch(tridentVersion[1]) {
          case "4.0":
            version = "8.0";
            break;
          case "5.0":
            version = "9.0";
            break;
          case "6.0":
            version = "10.0";
            break;
          case "7.0":
            version = "11.0";
        }
      } else {
        version = "7.0";
      }
    } else {
      version = msie[1];
    }
  }
  return version;
};
goog.string.DETECT_DOUBLE_ESCAPING = !1;
goog.string.FORCE_NON_DOM_HTML_UNESCAPING = !1;
goog.string.Unicode = {NBSP:"\u00a0"};
goog.string.startsWith = goog.string.internal.startsWith;
goog.string.endsWith = goog.string.internal.endsWith;
goog.string.caseInsensitiveStartsWith = goog.string.internal.caseInsensitiveStartsWith;
goog.string.caseInsensitiveEndsWith = goog.string.internal.caseInsensitiveEndsWith;
goog.string.caseInsensitiveEquals = goog.string.internal.caseInsensitiveEquals;
goog.string.subs = function(str, var_args) {
  for (var splitParts = str.split("%s"), returnString = "", subsArguments = Array.prototype.slice.call(arguments, 1); subsArguments.length && 1 < splitParts.length;) {
    returnString += splitParts.shift() + subsArguments.shift();
  }
  return returnString + splitParts.join("%s");
};
goog.string.collapseWhitespace = function(str) {
  return str.replace(/[\s\xa0]+/g, " ").replace(/^\s+|\s+$/g, "");
};
goog.string.isEmptyOrWhitespace = goog.string.internal.isEmptyOrWhitespace;
goog.string.isEmptyString = function(str) {
  return 0 == str.length;
};
goog.string.isEmpty = goog.string.isEmptyOrWhitespace;
goog.string.isEmptyOrWhitespaceSafe = function(str) {
  return goog.string.isEmptyOrWhitespace(goog.string.makeSafe(str));
};
goog.string.isEmptySafe = goog.string.isEmptyOrWhitespaceSafe;
goog.string.isBreakingWhitespace = function(str) {
  return !/[^\t\n\r ]/.test(str);
};
goog.string.isAlpha = function(str) {
  return !/[^a-zA-Z]/.test(str);
};
goog.string.isNumeric = function(str) {
  return !/[^0-9]/.test(str);
};
goog.string.isAlphaNumeric = function(str) {
  return !/[^a-zA-Z0-9]/.test(str);
};
goog.string.isSpace = function(ch) {
  return " " == ch;
};
goog.string.isUnicodeChar = function(ch) {
  return 1 == ch.length && " " <= ch && "~" >= ch || "\u0080" <= ch && "\ufffd" >= ch;
};
goog.string.stripNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)+/g, " ");
};
goog.string.canonicalizeNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)/g, "\n");
};
goog.string.normalizeWhitespace = function(str) {
  return str.replace(/\xa0|\s/g, " ");
};
goog.string.normalizeSpaces = function(str) {
  return str.replace(/\xa0|[ \t]+/g, " ");
};
goog.string.collapseBreakingSpaces = function(str) {
  return str.replace(/[\t\r\n ]+/g, " ").replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, "");
};
goog.string.trim = goog.string.internal.trim;
goog.string.trimLeft = function(str) {
  return str.replace(/^[\s\xa0]+/, "");
};
goog.string.trimRight = function(str) {
  return str.replace(/[\s\xa0]+$/, "");
};
goog.string.caseInsensitiveCompare = goog.string.internal.caseInsensitiveCompare;
goog.string.numberAwareCompare_ = function(str1, str2, tokenizerRegExp) {
  if (str1 == str2) {
    return 0;
  }
  if (!str1) {
    return -1;
  }
  if (!str2) {
    return 1;
  }
  for (var tokens1 = str1.toLowerCase().match(tokenizerRegExp), tokens2 = str2.toLowerCase().match(tokenizerRegExp), count = Math.min(tokens1.length, tokens2.length), i = 0; i < count; i++) {
    var a = tokens1[i], b = tokens2[i];
    if (a != b) {
      var num1 = parseInt(a, 10);
      if (!isNaN(num1)) {
        var num2 = parseInt(b, 10);
        if (!isNaN(num2) && num1 - num2) {
          return num1 - num2;
        }
      }
      return a < b ? -1 : 1;
    }
  }
  return tokens1.length != tokens2.length ? tokens1.length - tokens2.length : str1 < str2 ? -1 : 1;
};
goog.string.intAwareCompare = function(str1, str2) {
  return goog.string.numberAwareCompare_(str1, str2, /\d+|\D+/g);
};
goog.string.floatAwareCompare = function(str1, str2) {
  return goog.string.numberAwareCompare_(str1, str2, /\d+|\.\d+|\D+/g);
};
goog.string.numerateCompare = goog.string.floatAwareCompare;
goog.string.urlEncode = function(str) {
  return encodeURIComponent(String(str));
};
goog.string.urlDecode = function(str) {
  return decodeURIComponent(str.replace(/\+/g, " "));
};
goog.string.newLineToBr = goog.string.internal.newLineToBr;
goog.string.htmlEscape = function(str, opt_isLikelyToContainHtmlChars) {
  str = goog.string.internal.htmlEscape(str, opt_isLikelyToContainHtmlChars);
  goog.string.DETECT_DOUBLE_ESCAPING && (str = str.replace(goog.string.E_RE_, "&#101;"));
  return str;
};
goog.string.E_RE_ = /e/g;
goog.string.unescapeEntities = function(str) {
  return goog.string.contains(str, "&") ? !goog.string.FORCE_NON_DOM_HTML_UNESCAPING && "document" in goog.global ? goog.string.unescapeEntitiesUsingDom_(str) : goog.string.unescapePureXmlEntities_(str) : str;
};
goog.string.unescapeEntitiesWithDocument = function(str, document) {
  return goog.string.contains(str, "&") ? goog.string.unescapeEntitiesUsingDom_(str, document) : str;
};
goog.string.unescapeEntitiesUsingDom_ = function(str, opt_document) {
  var seen = {"&amp;":"&", "&lt;":"<", "&gt;":">", "&quot;":'"'};
  var div = opt_document ? opt_document.createElement("div") : goog.global.document.createElement("div");
  return str.replace(goog.string.HTML_ENTITY_PATTERN_, function(s, entity) {
    var value = seen[s];
    if (value) {
      return value;
    }
    if ("#" == entity.charAt(0)) {
      var n = Number("0" + entity.substr(1));
      isNaN(n) || (value = String.fromCharCode(n));
    }
    value || (div.innerHTML = s + " ", value = div.firstChild.nodeValue.slice(0, -1));
    return seen[s] = value;
  });
};
goog.string.unescapePureXmlEntities_ = function(str) {
  return str.replace(/&([^;]+);/g, function(s, entity) {
    switch(entity) {
      case "amp":
        return "&";
      case "lt":
        return "<";
      case "gt":
        return ">";
      case "quot":
        return '"';
      default:
        if ("#" == entity.charAt(0)) {
          var n = Number("0" + entity.substr(1));
          if (!isNaN(n)) {
            return String.fromCharCode(n);
          }
        }
        return s;
    }
  });
};
goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;
goog.string.whitespaceEscape = function(str, opt_xml) {
  return goog.string.newLineToBr(str.replace(/  /g, " &#160;"), opt_xml);
};
goog.string.preserveSpaces = function(str) {
  return str.replace(/(^|[\n ]) /g, "$1" + goog.string.Unicode.NBSP);
};
goog.string.stripQuotes = function(str, quoteChars) {
  for (var length = quoteChars.length, i = 0; i < length; i++) {
    var quoteChar = 1 == length ? quoteChars : quoteChars.charAt(i);
    if (str.charAt(0) == quoteChar && str.charAt(str.length - 1) == quoteChar) {
      return str.substring(1, str.length - 1);
    }
  }
  return str;
};
goog.string.truncate = function(str, chars, opt_protectEscapedCharacters) {
  opt_protectEscapedCharacters && (str = goog.string.unescapeEntities(str));
  str.length > chars && (str = str.substring(0, chars - 3) + "...");
  opt_protectEscapedCharacters && (str = goog.string.htmlEscape(str));
  return str;
};
goog.string.truncateMiddle = function(str, chars, opt_protectEscapedCharacters, opt_trailingChars) {
  opt_protectEscapedCharacters && (str = goog.string.unescapeEntities(str));
  if (opt_trailingChars && str.length > chars) {
    opt_trailingChars > chars && (opt_trailingChars = chars), str = str.substring(0, chars - opt_trailingChars) + "..." + str.substring(str.length - opt_trailingChars);
  } else {
    if (str.length > chars) {
      var half = Math.floor(chars / 2);
      str = str.substring(0, half + chars % 2) + "..." + str.substring(str.length - half);
    }
  }
  opt_protectEscapedCharacters && (str = goog.string.htmlEscape(str));
  return str;
};
goog.string.specialEscapeChars_ = {"\x00":"\\0", "\b":"\\b", "\f":"\\f", "\n":"\\n", "\r":"\\r", "\t":"\\t", "\x0B":"\\x0B", '"':'\\"', "\\":"\\\\", "<":"<"};
goog.string.jsEscapeCache_ = {"'":"\\'"};
goog.string.quote = function(s) {
  s = String(s);
  for (var sb = ['"'], i = 0; i < s.length; i++) {
    var ch = s.charAt(i), cc = ch.charCodeAt(0);
    sb[i + 1] = goog.string.specialEscapeChars_[ch] || (31 < cc && 127 > cc ? ch : goog.string.escapeChar(ch));
  }
  sb.push('"');
  return sb.join("");
};
goog.string.escapeString = function(str) {
  for (var sb = [], i = 0; i < str.length; i++) {
    sb[i] = goog.string.escapeChar(str.charAt(i));
  }
  return sb.join("");
};
goog.string.escapeChar = function(c) {
  if (c in goog.string.jsEscapeCache_) {
    return goog.string.jsEscapeCache_[c];
  }
  if (c in goog.string.specialEscapeChars_) {
    return goog.string.jsEscapeCache_[c] = goog.string.specialEscapeChars_[c];
  }
  var cc = c.charCodeAt(0);
  if (31 < cc && 127 > cc) {
    var rv = c;
  } else {
    if (256 > cc) {
      if (rv = "\\x", 16 > cc || 256 < cc) {
        rv += "0";
      }
    } else {
      rv = "\\u", 4096 > cc && (rv += "0");
    }
    rv += cc.toString(16).toUpperCase();
  }
  return goog.string.jsEscapeCache_[c] = rv;
};
goog.string.contains = goog.string.internal.contains;
goog.string.caseInsensitiveContains = goog.string.internal.caseInsensitiveContains;
goog.string.countOf = function(s, ss) {
  return s && ss ? s.split(ss).length - 1 : 0;
};
goog.string.removeAt = function(s, index, stringLength) {
  var resultStr = s;
  0 <= index && index < s.length && 0 < stringLength && (resultStr = s.substr(0, index) + s.substr(index + stringLength, s.length - index - stringLength));
  return resultStr;
};
goog.string.remove = function(str, substr) {
  return str.replace(substr, "");
};
goog.string.removeAll = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), "g");
  return s.replace(re, "");
};
goog.string.replaceAll = function(s, ss, replacement) {
  var re = new RegExp(goog.string.regExpEscape(ss), "g");
  return s.replace(re, replacement.replace(/\$/g, "$$$$"));
};
goog.string.regExpEscape = function(s) {
  return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08");
};
goog.string.repeat = String.prototype.repeat ? function(string, length) {
  return string.repeat(length);
} : function(string, length) {
  return Array(length + 1).join(string);
};
goog.string.padNumber = function(num, length, opt_precision) {
  var s = goog.isDef(opt_precision) ? num.toFixed(opt_precision) : String(num), index = s.indexOf(".");
  -1 == index && (index = s.length);
  return goog.string.repeat("0", Math.max(0, length - index)) + s;
};
goog.string.makeSafe = function(obj) {
  return null == obj ? "" : String(obj);
};
goog.string.buildString = function(var_args) {
  return Array.prototype.join.call(arguments, "");
};
goog.string.getRandomString = function() {
  return Math.floor(2147483648 * Math.random()).toString(36) + Math.abs(Math.floor(2147483648 * Math.random()) ^ goog.now()).toString(36);
};
goog.string.compareVersions = goog.string.internal.compareVersions;
goog.string.hashCode = function(str) {
  for (var result = 0, i = 0; i < str.length; ++i) {
    result = 31 * result + str.charCodeAt(i) >>> 0;
  }
  return result;
};
goog.string.uniqueStringCounter_ = 2147483648 * Math.random() | 0;
goog.string.createUniqueString = function() {
  return "goog_" + goog.string.uniqueStringCounter_++;
};
goog.string.toNumber = function(str) {
  var num = Number(str);
  return 0 == num && goog.string.isEmptyOrWhitespace(str) ? NaN : num;
};
goog.string.isLowerCamelCase = function(str) {
  return /^[a-z]+([A-Z][a-z]*)*$/.test(str);
};
goog.string.isUpperCamelCase = function(str) {
  return /^([A-Z][a-z]*)+$/.test(str);
};
goog.string.toCamelCase = function(str) {
  return String(str).replace(/\-([a-z])/g, function(all, match) {
    return match.toUpperCase();
  });
};
goog.string.toSelectorCase = function(str) {
  return String(str).replace(/([A-Z])/g, "-$1").toLowerCase();
};
goog.string.toTitleCase = function(str, opt_delimiters) {
  var delimiters = goog.isString(opt_delimiters) ? goog.string.regExpEscape(opt_delimiters) : "\\s";
  return str.replace(new RegExp("(^" + (delimiters ? "|[" + delimiters + "]+" : "") + ")([a-z])", "g"), function(all, p1, p2) {
    return p1 + p2.toUpperCase();
  });
};
goog.string.capitalize = function(str) {
  return String(str.charAt(0)).toUpperCase() + String(str.substr(1)).toLowerCase();
};
goog.string.parseInt = function(value) {
  isFinite(value) && (value = String(value));
  return goog.isString(value) ? /^\s*-?0x/i.test(value) ? parseInt(value, 16) : parseInt(value, 10) : NaN;
};
goog.string.splitLimit = function(str, separator, limit) {
  for (var parts = str.split(separator), returnVal = []; 0 < limit && parts.length;) {
    returnVal.push(parts.shift()), limit--;
  }
  parts.length && returnVal.push(parts.join(separator));
  return returnVal;
};
goog.string.lastComponent = function(str, separators) {
  if (separators) {
    "string" == typeof separators && (separators = [separators]);
  } else {
    return str;
  }
  for (var lastSeparatorIndex = -1, i = 0; i < separators.length; i++) {
    if ("" != separators[i]) {
      var currentSeparatorIndex = str.lastIndexOf(separators[i]);
      currentSeparatorIndex > lastSeparatorIndex && (lastSeparatorIndex = currentSeparatorIndex);
    }
  }
  return -1 == lastSeparatorIndex ? str : str.slice(lastSeparatorIndex + 1);
};
goog.string.editDistance = function(a, b) {
  var v0 = [], v1 = [];
  if (a == b) {
    return 0;
  }
  if (!a.length || !b.length) {
    return Math.max(a.length, b.length);
  }
  for (var i = 0; i < b.length + 1; i++) {
    v0[i] = i;
  }
  for (i = 0; i < a.length; i++) {
    v1[0] = i + 1;
    for (var j = 0; j < b.length; j++) {
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + Number(a[i] != b[j]));
    }
    for (j = 0; j < v0.length; j++) {
      v0[j] = v1[j];
    }
  }
  return v1[b.length];
};
goog.labs.userAgent.engine = {};
goog.labs.userAgent.engine.isPresto = function() {
  return goog.labs.userAgent.util.matchUserAgent("Presto");
};
goog.labs.userAgent.engine.isTrident = function() {
  return goog.labs.userAgent.util.matchUserAgent("Trident") || goog.labs.userAgent.util.matchUserAgent("MSIE");
};
goog.labs.userAgent.engine.isEdge = function() {
  return goog.labs.userAgent.util.matchUserAgent("Edge");
};
goog.labs.userAgent.engine.isWebKit = function() {
  return goog.labs.userAgent.util.matchUserAgentIgnoreCase("WebKit") && !goog.labs.userAgent.engine.isEdge();
};
goog.labs.userAgent.engine.isGecko = function() {
  return goog.labs.userAgent.util.matchUserAgent("Gecko") && !goog.labs.userAgent.engine.isWebKit() && !goog.labs.userAgent.engine.isTrident() && !goog.labs.userAgent.engine.isEdge();
};
goog.labs.userAgent.engine.getVersion = function() {
  var userAgentString = goog.labs.userAgent.util.getUserAgent();
  if (userAgentString) {
    var tuples = goog.labs.userAgent.util.extractVersionTuples(userAgentString), engineTuple = goog.labs.userAgent.engine.getEngineTuple_(tuples);
    if (engineTuple) {
      return "Gecko" == engineTuple[0] ? goog.labs.userAgent.engine.getVersionForKey_(tuples, "Firefox") : engineTuple[1];
    }
    var browserTuple = tuples[0], info;
    if (browserTuple && (info = browserTuple[2])) {
      var match = /Trident\/([^\s;]+)/.exec(info);
      if (match) {
        return match[1];
      }
    }
  }
  return "";
};
goog.labs.userAgent.engine.getEngineTuple_ = function(tuples) {
  if (!goog.labs.userAgent.engine.isEdge()) {
    return tuples[1];
  }
  for (var i = 0; i < tuples.length; i++) {
    var tuple = tuples[i];
    if ("Edge" == tuple[0]) {
      return tuple;
    }
  }
};
goog.labs.userAgent.engine.isVersionOrHigher = function(version) {
  return 0 <= goog.string.compareVersions(goog.labs.userAgent.engine.getVersion(), version);
};
goog.labs.userAgent.engine.getVersionForKey_ = function(tuples, key) {
  var pair = goog.array.find(tuples, function(pair) {
    return key == pair[0];
  });
  return pair && pair[1] || "";
};
goog.labs.userAgent.platform = {};
goog.labs.userAgent.platform.isAndroid = function() {
  return goog.labs.userAgent.util.matchUserAgent("Android");
};
goog.labs.userAgent.platform.isIpod = function() {
  return goog.labs.userAgent.util.matchUserAgent("iPod");
};
goog.labs.userAgent.platform.isIphone = function() {
  return goog.labs.userAgent.util.matchUserAgent("iPhone") && !goog.labs.userAgent.util.matchUserAgent("iPod") && !goog.labs.userAgent.util.matchUserAgent("iPad");
};
goog.labs.userAgent.platform.isIpad = function() {
  return goog.labs.userAgent.util.matchUserAgent("iPad");
};
goog.labs.userAgent.platform.isIos = function() {
  return goog.labs.userAgent.platform.isIphone() || goog.labs.userAgent.platform.isIpad() || goog.labs.userAgent.platform.isIpod();
};
goog.labs.userAgent.platform.isMacintosh = function() {
  return goog.labs.userAgent.util.matchUserAgent("Macintosh");
};
goog.labs.userAgent.platform.isLinux = function() {
  return goog.labs.userAgent.util.matchUserAgent("Linux");
};
goog.labs.userAgent.platform.isWindows = function() {
  return goog.labs.userAgent.util.matchUserAgent("Windows");
};
goog.labs.userAgent.platform.isChromeOS = function() {
  return goog.labs.userAgent.util.matchUserAgent("CrOS");
};
goog.labs.userAgent.platform.isChromecast = function() {
  return goog.labs.userAgent.util.matchUserAgent("CrKey");
};
goog.labs.userAgent.platform.isKaiOS = function() {
  return goog.labs.userAgent.util.matchUserAgentIgnoreCase("KaiOS");
};
goog.labs.userAgent.platform.isGo2Phone = function() {
  return goog.labs.userAgent.util.matchUserAgentIgnoreCase("GAFP");
};
goog.labs.userAgent.platform.getVersion = function() {
  var userAgentString = goog.labs.userAgent.util.getUserAgent(), version = "";
  if (goog.labs.userAgent.platform.isWindows()) {
    var re = /Windows (?:NT|Phone) ([0-9.]+)/;
    var match = re.exec(userAgentString);
    version = match ? match[1] : "0.0";
  } else {
    goog.labs.userAgent.platform.isIos() ? (re = /(?:iPhone|iPod|iPad|CPU)\s+OS\s+(\S+)/, version = (match = re.exec(userAgentString)) && match[1].replace(/_/g, ".")) : goog.labs.userAgent.platform.isMacintosh() ? (re = /Mac OS X ([0-9_.]+)/, version = (match = re.exec(userAgentString)) ? match[1].replace(/_/g, ".") : "10") : goog.labs.userAgent.platform.isKaiOS() ? (re = /(?:KaiOS)\/(\S+)/i, version = (match = re.exec(userAgentString)) && match[1]) : goog.labs.userAgent.platform.isAndroid() ? (re = 
    /Android\s+([^\);]+)(\)|;)/, version = (match = re.exec(userAgentString)) && match[1]) : goog.labs.userAgent.platform.isChromeOS() && (re = /(?:CrOS\s+(?:i686|x86_64)\s+([0-9.]+))/, version = (match = re.exec(userAgentString)) && match[1]);
  }
  return version || "";
};
goog.labs.userAgent.platform.isVersionOrHigher = function(version) {
  return 0 <= goog.string.compareVersions(goog.labs.userAgent.platform.getVersion(), version);
};
goog.reflect = {};
goog.reflect.object = function(type, object) {
  return object;
};
goog.reflect.objectProperty = function(prop) {
  return prop;
};
goog.reflect.sinkValue = function(x) {
  goog.reflect.sinkValue[" "](x);
  return x;
};
goog.reflect.sinkValue[" "] = goog.nullFunction;
goog.reflect.canAccessProperty = function(obj, prop) {
  try {
    return goog.reflect.sinkValue(obj[prop]), !0;
  } catch (e) {
  }
  return !1;
};
goog.reflect.cache = function(cacheObj, key, valueFn, opt_keyFn) {
  var storedKey = opt_keyFn ? opt_keyFn(key) : key;
  return Object.prototype.hasOwnProperty.call(cacheObj, storedKey) ? cacheObj[storedKey] : cacheObj[storedKey] = valueFn(key);
};
goog.userAgent = {};
goog.userAgent.ASSUME_IE = !1;
goog.userAgent.ASSUME_EDGE = !1;
goog.userAgent.ASSUME_GECKO = !1;
goog.userAgent.ASSUME_WEBKIT = !1;
goog.userAgent.ASSUME_MOBILE_WEBKIT = !1;
goog.userAgent.ASSUME_OPERA = !1;
goog.userAgent.ASSUME_ANY_VERSION = !1;
goog.userAgent.BROWSER_KNOWN_ = goog.userAgent.ASSUME_IE || goog.userAgent.ASSUME_EDGE || goog.userAgent.ASSUME_GECKO || goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_OPERA;
goog.userAgent.getUserAgentString = function() {
  return goog.labs.userAgent.util.getUserAgent();
};
goog.userAgent.getNavigatorTyped = function() {
  return goog.global.navigator || null;
};
goog.userAgent.getNavigator = function() {
  return goog.userAgent.getNavigatorTyped();
};
goog.userAgent.OPERA = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_OPERA : goog.labs.userAgent.browser.isOpera();
goog.userAgent.IE = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_IE : goog.labs.userAgent.browser.isIE();
goog.userAgent.EDGE = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_EDGE : goog.labs.userAgent.engine.isEdge();
goog.userAgent.EDGE_OR_IE = goog.userAgent.EDGE || goog.userAgent.IE;
goog.userAgent.GECKO = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_GECKO : goog.labs.userAgent.engine.isGecko();
goog.userAgent.WEBKIT = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_MOBILE_WEBKIT : goog.labs.userAgent.engine.isWebKit();
goog.userAgent.isMobile_ = function() {
  return goog.userAgent.WEBKIT && goog.labs.userAgent.util.matchUserAgent("Mobile");
};
goog.userAgent.MOBILE = goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.isMobile_();
goog.userAgent.SAFARI = goog.userAgent.WEBKIT;
goog.userAgent.determinePlatform_ = function() {
  var navigator = goog.userAgent.getNavigatorTyped();
  return navigator && navigator.platform || "";
};
goog.userAgent.PLATFORM = goog.userAgent.determinePlatform_();
goog.userAgent.ASSUME_MAC = !1;
goog.userAgent.ASSUME_WINDOWS = !1;
goog.userAgent.ASSUME_LINUX = !1;
goog.userAgent.ASSUME_X11 = !1;
goog.userAgent.ASSUME_ANDROID = !1;
goog.userAgent.ASSUME_IPHONE = !1;
goog.userAgent.ASSUME_IPAD = !1;
goog.userAgent.ASSUME_IPOD = !1;
goog.userAgent.ASSUME_KAIOS = !1;
goog.userAgent.ASSUME_GO2PHONE = !1;
goog.userAgent.PLATFORM_KNOWN_ = goog.userAgent.ASSUME_MAC || goog.userAgent.ASSUME_WINDOWS || goog.userAgent.ASSUME_LINUX || goog.userAgent.ASSUME_X11 || goog.userAgent.ASSUME_ANDROID || goog.userAgent.ASSUME_IPHONE || goog.userAgent.ASSUME_IPAD || goog.userAgent.ASSUME_IPOD;
goog.userAgent.MAC = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_MAC : goog.labs.userAgent.platform.isMacintosh();
goog.userAgent.WINDOWS = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_WINDOWS : goog.labs.userAgent.platform.isWindows();
goog.userAgent.isLegacyLinux_ = function() {
  return goog.labs.userAgent.platform.isLinux() || goog.labs.userAgent.platform.isChromeOS();
};
goog.userAgent.LINUX = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_LINUX : goog.userAgent.isLegacyLinux_();
goog.userAgent.isX11_ = function() {
  var navigator = goog.userAgent.getNavigatorTyped();
  return !!navigator && goog.string.contains(navigator.appVersion || "", "X11");
};
goog.userAgent.X11 = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_X11 : goog.userAgent.isX11_();
goog.userAgent.ANDROID = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_ANDROID : goog.labs.userAgent.platform.isAndroid();
goog.userAgent.IPHONE = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_IPHONE : goog.labs.userAgent.platform.isIphone();
goog.userAgent.IPAD = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_IPAD : goog.labs.userAgent.platform.isIpad();
goog.userAgent.IPOD = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_IPOD : goog.labs.userAgent.platform.isIpod();
goog.userAgent.IOS = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_IPHONE || goog.userAgent.ASSUME_IPAD || goog.userAgent.ASSUME_IPOD : goog.labs.userAgent.platform.isIos();
goog.userAgent.KAIOS = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_KAIOS : goog.labs.userAgent.platform.isKaiOS();
goog.userAgent.GO2PHONE = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_GO2PHONE : goog.labs.userAgent.platform.isGo2Phone();
goog.userAgent.determineVersion_ = function() {
  var version = "", arr = goog.userAgent.getVersionRegexResult_();
  arr && (version = arr ? arr[1] : "");
  if (goog.userAgent.IE) {
    var docMode = goog.userAgent.getDocumentMode_();
    if (null != docMode && docMode > parseFloat(version)) {
      return String(docMode);
    }
  }
  return version;
};
goog.userAgent.getVersionRegexResult_ = function() {
  var userAgent = goog.userAgent.getUserAgentString();
  if (goog.userAgent.GECKO) {
    return /rv:([^\);]+)(\)|;)/.exec(userAgent);
  }
  if (goog.userAgent.EDGE) {
    return /Edge\/([\d\.]+)/.exec(userAgent);
  }
  if (goog.userAgent.IE) {
    return /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(userAgent);
  }
  if (goog.userAgent.WEBKIT) {
    return /WebKit\/(\S+)/.exec(userAgent);
  }
  if (goog.userAgent.OPERA) {
    return /(?:Version)[ \/]?(\S+)/.exec(userAgent);
  }
};
goog.userAgent.getDocumentMode_ = function() {
  var doc = goog.global.document;
  return doc ? doc.documentMode : void 0;
};
goog.userAgent.VERSION = goog.userAgent.determineVersion_();
goog.userAgent.compare = function(v1, v2) {
  return goog.string.compareVersions(v1, v2);
};
goog.userAgent.isVersionOrHigherCache_ = {};
goog.userAgent.isVersionOrHigher = function(version) {
  return goog.userAgent.ASSUME_ANY_VERSION || goog.reflect.cache(goog.userAgent.isVersionOrHigherCache_, version, function() {
    return 0 <= goog.string.compareVersions(goog.userAgent.VERSION, version);
  });
};
goog.userAgent.isVersion = goog.userAgent.isVersionOrHigher;
goog.userAgent.isDocumentModeOrHigher = function(documentMode) {
  return Number(goog.userAgent.DOCUMENT_MODE) >= documentMode;
};
goog.userAgent.isDocumentMode = goog.userAgent.isDocumentModeOrHigher;
var JSCompiler_inline_result$jscomp$6;
var doc$jscomp$inline_11 = goog.global.document;
JSCompiler_inline_result$jscomp$6 = doc$jscomp$inline_11 && goog.userAgent.IE ? goog.userAgent.getDocumentMode_() || ("CSS1Compat" == doc$jscomp$inline_11.compatMode ? parseInt(goog.userAgent.VERSION, 10) : 5) : void 0;
goog.userAgent.DOCUMENT_MODE = JSCompiler_inline_result$jscomp$6;
goog.debug.LOGGING_ENABLED = goog.DEBUG;
goog.debug.FORCE_SLOPPY_STACKS = !1;
goog.debug.catchErrors = function(logFunc, opt_cancel, opt_target) {
  var target = opt_target || goog.global, oldErrorHandler = target.onerror, retVal = !!opt_cancel;
  goog.userAgent.WEBKIT && !goog.userAgent.isVersionOrHigher("535.3") && (retVal = !retVal);
  target.onerror = function(message, url, line, opt_col, opt_error) {
    oldErrorHandler && oldErrorHandler(message, url, line, opt_col, opt_error);
    logFunc({message:message, fileName:url, line:line, lineNumber:line, col:opt_col, error:opt_error});
    return retVal;
  };
};
goog.debug.expose = function(obj, opt_showFn) {
  if ("undefined" == typeof obj) {
    return "undefined";
  }
  if (null == obj) {
    return "NULL";
  }
  var str = [], x;
  for (x in obj) {
    if (opt_showFn || !goog.isFunction(obj[x])) {
      var s = x + " = ";
      try {
        s += obj[x];
      } catch (e) {
        s += "*** " + e + " ***";
      }
      str.push(s);
    }
  }
  return str.join("\n");
};
goog.debug.deepExpose = function(obj$jscomp$0, opt_showFn) {
  var str = [], uidsToCleanup = [], ancestorUids = {}, helper = function(obj, space) {
    var nestspace = space + "  ";
    try {
      if (goog.isDef(obj)) {
        if (goog.isNull(obj)) {
          str.push("NULL");
        } else {
          if (goog.isString(obj)) {
            str.push('"' + obj.replace(/\n/g, "\n" + space) + '"');
          } else {
            if (goog.isFunction(obj)) {
              str.push(String(obj).replace(/\n/g, "\n" + space));
            } else {
              if (goog.isObject(obj)) {
                goog.hasUid(obj) || uidsToCleanup.push(obj);
                var uid = goog.getUid(obj);
                if (ancestorUids[uid]) {
                  str.push("*** reference loop detected (id=" + uid + ") ***");
                } else {
                  ancestorUids[uid] = !0;
                  str.push("{");
                  for (var x in obj) {
                    if (opt_showFn || !goog.isFunction(obj[x])) {
                      str.push("\n"), str.push(nestspace), str.push(x + " = "), helper(obj[x], nestspace);
                    }
                  }
                  str.push("\n" + space + "}");
                  delete ancestorUids[uid];
                }
              } else {
                str.push(obj);
              }
            }
          }
        }
      } else {
        str.push("undefined");
      }
    } catch (e) {
      str.push("*** " + e + " ***");
    }
  };
  helper(obj$jscomp$0, "");
  for (var i = 0; i < uidsToCleanup.length; i++) {
    goog.removeUid(uidsToCleanup[i]);
  }
  return str.join("");
};
goog.debug.exposeArray = function(arr) {
  for (var str = [], i = 0; i < arr.length; i++) {
    goog.isArray(arr[i]) ? str.push(goog.debug.exposeArray(arr[i])) : str.push(arr[i]);
  }
  return "[ " + str.join(", ") + " ]";
};
goog.debug.normalizeErrorObject = function(err) {
  var href = goog.getObjectByName("window.location.href");
  null == err && (err = 'Unknown Error of type "null/undefined"');
  if (goog.isString(err)) {
    return {message:err, name:"Unknown error", lineNumber:"Not available", fileName:href, stack:"Not available"};
  }
  var threwError = !1;
  try {
    var lineNumber = err.lineNumber || err.line || "Not available";
  } catch (e) {
    lineNumber = "Not available", threwError = !0;
  }
  try {
    var fileName = err.fileName || err.filename || err.sourceURL || goog.global.$googDebugFname || href;
  } catch (e$4) {
    fileName = "Not available", threwError = !0;
  }
  if (!(!threwError && err.lineNumber && err.fileName && err.stack && err.message && err.name)) {
    var message = err.message;
    null == message && (message = err.constructor && err.constructor instanceof Function ? 'Unknown Error of type "' + (err.constructor.name ? err.constructor.name : goog.debug.getFunctionName(err.constructor)) + '"' : "Unknown Error of unknown type");
    return {message:message, name:err.name || "UnknownError", lineNumber:lineNumber, fileName:fileName, stack:err.stack || "Not available"};
  }
  return err;
};
goog.debug.enhanceError = function(err, opt_message) {
  if (err instanceof Error) {
    var error = err;
  } else {
    error = Error(err), Error.captureStackTrace && Error.captureStackTrace(error, goog.debug.enhanceError);
  }
  error.stack || (error.stack = goog.debug.getStacktrace(goog.debug.enhanceError));
  if (opt_message) {
    for (var x = 0; error["message" + x];) {
      ++x;
    }
    error["message" + x] = String(opt_message);
  }
  return error;
};
goog.debug.enhanceErrorWithContext = function(err, opt_context) {
  var error = goog.debug.enhanceError(err);
  if (opt_context) {
    for (var key in opt_context) {
      goog.debug.errorcontext.addErrorContext(error, key, opt_context[key]);
    }
  }
  return error;
};
goog.debug.getStacktraceSimple = function(opt_depth) {
  if (!goog.debug.FORCE_SLOPPY_STACKS) {
    var stack = goog.debug.getNativeStackTrace_(goog.debug.getStacktraceSimple);
    if (stack) {
      return stack;
    }
  }
  for (var sb = [], fn = arguments.callee.caller, depth = 0; fn && (!opt_depth || depth < opt_depth);) {
    sb.push(goog.debug.getFunctionName(fn));
    sb.push("()\n");
    try {
      fn = fn.caller;
    } catch (e) {
      sb.push("[exception trying to get caller]\n");
      break;
    }
    depth++;
    if (depth >= goog.debug.MAX_STACK_DEPTH) {
      sb.push("[...long stack...]");
      break;
    }
  }
  opt_depth && depth >= opt_depth ? sb.push("[...reached max depth limit...]") : sb.push("[end]");
  return sb.join("");
};
goog.debug.MAX_STACK_DEPTH = 50;
goog.debug.getNativeStackTrace_ = function(fn) {
  var tempErr = Error();
  if (Error.captureStackTrace) {
    return Error.captureStackTrace(tempErr, fn), String(tempErr.stack);
  }
  try {
    throw tempErr;
  } catch (e) {
    tempErr = e;
  }
  var stack = tempErr.stack;
  return stack ? String(stack) : null;
};
goog.debug.getStacktrace = function(fn) {
  var stack;
  goog.debug.FORCE_SLOPPY_STACKS || (stack = goog.debug.getNativeStackTrace_(fn || goog.debug.getStacktrace));
  stack || (stack = goog.debug.getStacktraceHelper_(fn || arguments.callee.caller, []));
  return stack;
};
goog.debug.getStacktraceHelper_ = function(fn, visited) {
  var sb = [];
  if (goog.array.contains(visited, fn)) {
    sb.push("[...circular reference...]");
  } else {
    if (fn && visited.length < goog.debug.MAX_STACK_DEPTH) {
      sb.push(goog.debug.getFunctionName(fn) + "(");
      for (var args = fn.arguments, i = 0; args && i < args.length; i++) {
        0 < i && sb.push(", ");
        var arg = args[i];
        switch(typeof arg) {
          case "object":
            var argDesc = arg ? "object" : "null";
            break;
          case "string":
            argDesc = arg;
            break;
          case "number":
            argDesc = String(arg);
            break;
          case "boolean":
            argDesc = arg ? "true" : "false";
            break;
          case "function":
            argDesc = (argDesc = goog.debug.getFunctionName(arg)) ? argDesc : "[fn]";
            break;
          default:
            argDesc = typeof arg;
        }
        40 < argDesc.length && (argDesc = argDesc.substr(0, 40) + "...");
        sb.push(argDesc);
      }
      visited.push(fn);
      sb.push(")\n");
      try {
        sb.push(goog.debug.getStacktraceHelper_(fn.caller, visited));
      } catch (e) {
        sb.push("[exception trying to get caller]\n");
      }
    } else {
      fn ? sb.push("[...long stack...]") : sb.push("[end]");
    }
  }
  return sb.join("");
};
goog.debug.getFunctionName = function(fn) {
  if (goog.debug.fnNameCache_[fn]) {
    return goog.debug.fnNameCache_[fn];
  }
  var functionSource = String(fn);
  if (!goog.debug.fnNameCache_[functionSource]) {
    var matches = /function\s+([^\(]+)/m.exec(functionSource);
    goog.debug.fnNameCache_[functionSource] = matches ? matches[1] : "[Anonymous]";
  }
  return goog.debug.fnNameCache_[functionSource];
};
goog.debug.makeWhitespaceVisible = function(string) {
  return string.replace(/ /g, "[_]").replace(/\f/g, "[f]").replace(/\n/g, "[n]\n").replace(/\r/g, "[r]").replace(/\t/g, "[t]");
};
goog.debug.runtimeType = function(value) {
  return value instanceof Function ? value.displayName || value.name || "unknown type name" : value instanceof Object ? value.constructor.displayName || value.constructor.name || Object.prototype.toString.call(value) : null === value ? "null" : typeof value;
};
goog.debug.fnNameCache_ = {};
goog.debug.freezeInternal_ = goog.DEBUG && Object.freeze || function(arg) {
  return arg;
};
goog.debug.freeze = function(arg) {
  return goog.debug.freezeInternal_(arg);
};
goog.dom.HtmlElement = function() {
};
goog.dom.TagName = function(tagName) {
  this.tagName_ = tagName;
};
goog.dom.TagName.prototype.toString = function() {
  return this.tagName_;
};
goog.dom.TagName.A = new goog.dom.TagName("A");
goog.dom.TagName.ABBR = new goog.dom.TagName("ABBR");
goog.dom.TagName.ACRONYM = new goog.dom.TagName("ACRONYM");
goog.dom.TagName.ADDRESS = new goog.dom.TagName("ADDRESS");
goog.dom.TagName.APPLET = new goog.dom.TagName("APPLET");
goog.dom.TagName.AREA = new goog.dom.TagName("AREA");
goog.dom.TagName.ARTICLE = new goog.dom.TagName("ARTICLE");
goog.dom.TagName.ASIDE = new goog.dom.TagName("ASIDE");
goog.dom.TagName.AUDIO = new goog.dom.TagName("AUDIO");
goog.dom.TagName.B = new goog.dom.TagName("B");
goog.dom.TagName.BASE = new goog.dom.TagName("BASE");
goog.dom.TagName.BASEFONT = new goog.dom.TagName("BASEFONT");
goog.dom.TagName.BDI = new goog.dom.TagName("BDI");
goog.dom.TagName.BDO = new goog.dom.TagName("BDO");
goog.dom.TagName.BIG = new goog.dom.TagName("BIG");
goog.dom.TagName.BLOCKQUOTE = new goog.dom.TagName("BLOCKQUOTE");
goog.dom.TagName.BODY = new goog.dom.TagName("BODY");
goog.dom.TagName.BR = new goog.dom.TagName("BR");
goog.dom.TagName.BUTTON = new goog.dom.TagName("BUTTON");
goog.dom.TagName.CANVAS = new goog.dom.TagName("CANVAS");
goog.dom.TagName.CAPTION = new goog.dom.TagName("CAPTION");
goog.dom.TagName.CENTER = new goog.dom.TagName("CENTER");
goog.dom.TagName.CITE = new goog.dom.TagName("CITE");
goog.dom.TagName.CODE = new goog.dom.TagName("CODE");
goog.dom.TagName.COL = new goog.dom.TagName("COL");
goog.dom.TagName.COLGROUP = new goog.dom.TagName("COLGROUP");
goog.dom.TagName.COMMAND = new goog.dom.TagName("COMMAND");
goog.dom.TagName.DATA = new goog.dom.TagName("DATA");
goog.dom.TagName.DATALIST = new goog.dom.TagName("DATALIST");
goog.dom.TagName.DD = new goog.dom.TagName("DD");
goog.dom.TagName.DEL = new goog.dom.TagName("DEL");
goog.dom.TagName.DETAILS = new goog.dom.TagName("DETAILS");
goog.dom.TagName.DFN = new goog.dom.TagName("DFN");
goog.dom.TagName.DIALOG = new goog.dom.TagName("DIALOG");
goog.dom.TagName.DIR = new goog.dom.TagName("DIR");
goog.dom.TagName.DIV = new goog.dom.TagName("DIV");
goog.dom.TagName.DL = new goog.dom.TagName("DL");
goog.dom.TagName.DT = new goog.dom.TagName("DT");
goog.dom.TagName.EM = new goog.dom.TagName("EM");
goog.dom.TagName.EMBED = new goog.dom.TagName("EMBED");
goog.dom.TagName.FIELDSET = new goog.dom.TagName("FIELDSET");
goog.dom.TagName.FIGCAPTION = new goog.dom.TagName("FIGCAPTION");
goog.dom.TagName.FIGURE = new goog.dom.TagName("FIGURE");
goog.dom.TagName.FONT = new goog.dom.TagName("FONT");
goog.dom.TagName.FOOTER = new goog.dom.TagName("FOOTER");
goog.dom.TagName.FORM = new goog.dom.TagName("FORM");
goog.dom.TagName.FRAME = new goog.dom.TagName("FRAME");
goog.dom.TagName.FRAMESET = new goog.dom.TagName("FRAMESET");
goog.dom.TagName.H1 = new goog.dom.TagName("H1");
goog.dom.TagName.H2 = new goog.dom.TagName("H2");
goog.dom.TagName.H3 = new goog.dom.TagName("H3");
goog.dom.TagName.H4 = new goog.dom.TagName("H4");
goog.dom.TagName.H5 = new goog.dom.TagName("H5");
goog.dom.TagName.H6 = new goog.dom.TagName("H6");
goog.dom.TagName.HEAD = new goog.dom.TagName("HEAD");
goog.dom.TagName.HEADER = new goog.dom.TagName("HEADER");
goog.dom.TagName.HGROUP = new goog.dom.TagName("HGROUP");
goog.dom.TagName.HR = new goog.dom.TagName("HR");
goog.dom.TagName.HTML = new goog.dom.TagName("HTML");
goog.dom.TagName.I = new goog.dom.TagName("I");
goog.dom.TagName.IFRAME = new goog.dom.TagName("IFRAME");
goog.dom.TagName.IMG = new goog.dom.TagName("IMG");
goog.dom.TagName.INPUT = new goog.dom.TagName("INPUT");
goog.dom.TagName.INS = new goog.dom.TagName("INS");
goog.dom.TagName.ISINDEX = new goog.dom.TagName("ISINDEX");
goog.dom.TagName.KBD = new goog.dom.TagName("KBD");
goog.dom.TagName.KEYGEN = new goog.dom.TagName("KEYGEN");
goog.dom.TagName.LABEL = new goog.dom.TagName("LABEL");
goog.dom.TagName.LEGEND = new goog.dom.TagName("LEGEND");
goog.dom.TagName.LI = new goog.dom.TagName("LI");
goog.dom.TagName.LINK = new goog.dom.TagName("LINK");
goog.dom.TagName.MAIN = new goog.dom.TagName("MAIN");
goog.dom.TagName.MAP = new goog.dom.TagName("MAP");
goog.dom.TagName.MARK = new goog.dom.TagName("MARK");
goog.dom.TagName.MATH = new goog.dom.TagName("MATH");
goog.dom.TagName.MENU = new goog.dom.TagName("MENU");
goog.dom.TagName.MENUITEM = new goog.dom.TagName("MENUITEM");
goog.dom.TagName.META = new goog.dom.TagName("META");
goog.dom.TagName.METER = new goog.dom.TagName("METER");
goog.dom.TagName.NAV = new goog.dom.TagName("NAV");
goog.dom.TagName.NOFRAMES = new goog.dom.TagName("NOFRAMES");
goog.dom.TagName.NOSCRIPT = new goog.dom.TagName("NOSCRIPT");
goog.dom.TagName.OBJECT = new goog.dom.TagName("OBJECT");
goog.dom.TagName.OL = new goog.dom.TagName("OL");
goog.dom.TagName.OPTGROUP = new goog.dom.TagName("OPTGROUP");
goog.dom.TagName.OPTION = new goog.dom.TagName("OPTION");
goog.dom.TagName.OUTPUT = new goog.dom.TagName("OUTPUT");
goog.dom.TagName.P = new goog.dom.TagName("P");
goog.dom.TagName.PARAM = new goog.dom.TagName("PARAM");
goog.dom.TagName.PICTURE = new goog.dom.TagName("PICTURE");
goog.dom.TagName.PRE = new goog.dom.TagName("PRE");
goog.dom.TagName.PROGRESS = new goog.dom.TagName("PROGRESS");
goog.dom.TagName.Q = new goog.dom.TagName("Q");
goog.dom.TagName.RP = new goog.dom.TagName("RP");
goog.dom.TagName.RT = new goog.dom.TagName("RT");
goog.dom.TagName.RTC = new goog.dom.TagName("RTC");
goog.dom.TagName.RUBY = new goog.dom.TagName("RUBY");
goog.dom.TagName.S = new goog.dom.TagName("S");
goog.dom.TagName.SAMP = new goog.dom.TagName("SAMP");
goog.dom.TagName.SCRIPT = new goog.dom.TagName("SCRIPT");
goog.dom.TagName.SECTION = new goog.dom.TagName("SECTION");
goog.dom.TagName.SELECT = new goog.dom.TagName("SELECT");
goog.dom.TagName.SMALL = new goog.dom.TagName("SMALL");
goog.dom.TagName.SOURCE = new goog.dom.TagName("SOURCE");
goog.dom.TagName.SPAN = new goog.dom.TagName("SPAN");
goog.dom.TagName.STRIKE = new goog.dom.TagName("STRIKE");
goog.dom.TagName.STRONG = new goog.dom.TagName("STRONG");
goog.dom.TagName.STYLE = new goog.dom.TagName("STYLE");
goog.dom.TagName.SUB = new goog.dom.TagName("SUB");
goog.dom.TagName.SUMMARY = new goog.dom.TagName("SUMMARY");
goog.dom.TagName.SUP = new goog.dom.TagName("SUP");
goog.dom.TagName.SVG = new goog.dom.TagName("SVG");
goog.dom.TagName.TABLE = new goog.dom.TagName("TABLE");
goog.dom.TagName.TBODY = new goog.dom.TagName("TBODY");
goog.dom.TagName.TD = new goog.dom.TagName("TD");
goog.dom.TagName.TEMPLATE = new goog.dom.TagName("TEMPLATE");
goog.dom.TagName.TEXTAREA = new goog.dom.TagName("TEXTAREA");
goog.dom.TagName.TFOOT = new goog.dom.TagName("TFOOT");
goog.dom.TagName.TH = new goog.dom.TagName("TH");
goog.dom.TagName.THEAD = new goog.dom.TagName("THEAD");
goog.dom.TagName.TIME = new goog.dom.TagName("TIME");
goog.dom.TagName.TITLE = new goog.dom.TagName("TITLE");
goog.dom.TagName.TR = new goog.dom.TagName("TR");
goog.dom.TagName.TRACK = new goog.dom.TagName("TRACK");
goog.dom.TagName.TT = new goog.dom.TagName("TT");
goog.dom.TagName.U = new goog.dom.TagName("U");
goog.dom.TagName.UL = new goog.dom.TagName("UL");
goog.dom.TagName.VAR = new goog.dom.TagName("VAR");
goog.dom.TagName.VIDEO = new goog.dom.TagName("VIDEO");
goog.dom.TagName.WBR = new goog.dom.TagName("WBR");
goog.dom.tags = {};
goog.dom.tags.VOID_TAGS_ = {area:!0, base:!0, br:!0, col:!0, command:!0, embed:!0, hr:!0, img:!0, input:!0, keygen:!0, link:!0, meta:!0, param:!0, source:!0, track:!0, wbr:!0};
goog.dom.tags.isVoidTag = function(tagName) {
  return !0 === goog.dom.tags.VOID_TAGS_[tagName];
};
goog.i18n = {};
goog.i18n.uChar = {};
goog.i18n.uChar.SUPPLEMENTARY_CODE_POINT_MIN_VALUE_ = 65536;
goog.i18n.uChar.CODE_POINT_MAX_VALUE_ = 1114111;
goog.i18n.uChar.LEAD_SURROGATE_MIN_VALUE_ = 55296;
goog.i18n.uChar.LEAD_SURROGATE_MAX_VALUE_ = 56319;
goog.i18n.uChar.TRAIL_SURROGATE_MIN_VALUE_ = 56320;
goog.i18n.uChar.TRAIL_SURROGATE_MAX_VALUE_ = 57343;
goog.i18n.uChar.TRAIL_SURROGATE_BIT_COUNT_ = 10;
goog.i18n.uChar.toHexString = function(ch) {
  return "U+" + goog.i18n.uChar.padString_(goog.i18n.uChar.toCharCode(ch).toString(16).toUpperCase(), 4, "0");
};
goog.i18n.uChar.padString_ = function(str, length, ch) {
  for (; str.length < length;) {
    str = ch + str;
  }
  return str;
};
goog.i18n.uChar.toCharCode = function(ch) {
  return goog.i18n.uChar.getCodePointAround(ch, 0);
};
goog.i18n.uChar.fromCharCode = function(code) {
  return goog.isDefAndNotNull(code) && 0 <= code && code <= goog.i18n.uChar.CODE_POINT_MAX_VALUE_ ? goog.i18n.uChar.isSupplementaryCodePoint(code) ? String.fromCharCode((code >> goog.i18n.uChar.TRAIL_SURROGATE_BIT_COUNT_) + (goog.i18n.uChar.LEAD_SURROGATE_MIN_VALUE_ - (goog.i18n.uChar.SUPPLEMENTARY_CODE_POINT_MIN_VALUE_ >> goog.i18n.uChar.TRAIL_SURROGATE_BIT_COUNT_))) + String.fromCharCode((code & (1 << goog.i18n.uChar.TRAIL_SURROGATE_BIT_COUNT_) - 1) + goog.i18n.uChar.TRAIL_SURROGATE_MIN_VALUE_) : 
  String.fromCharCode(code) : null;
};
goog.i18n.uChar.getCodePointAround = function(string, index) {
  var charCode = string.charCodeAt(index);
  if (goog.i18n.uChar.isLeadSurrogateCodePoint(charCode) && index + 1 < string.length) {
    var trail = string.charCodeAt(index + 1);
    if (goog.i18n.uChar.isTrailSurrogateCodePoint(trail)) {
      return goog.i18n.uChar.buildSupplementaryCodePoint(charCode, trail);
    }
  } else {
    if (goog.i18n.uChar.isTrailSurrogateCodePoint(charCode) && 0 < index) {
      var lead = string.charCodeAt(index - 1);
      if (goog.i18n.uChar.isLeadSurrogateCodePoint(lead)) {
        return -goog.i18n.uChar.buildSupplementaryCodePoint(lead, charCode);
      }
    }
  }
  return charCode;
};
goog.i18n.uChar.charCount = function(codePoint) {
  return goog.i18n.uChar.isSupplementaryCodePoint(codePoint) ? 2 : 1;
};
goog.i18n.uChar.isSupplementaryCodePoint = function(codePoint) {
  return codePoint >= goog.i18n.uChar.SUPPLEMENTARY_CODE_POINT_MIN_VALUE_ && codePoint <= goog.i18n.uChar.CODE_POINT_MAX_VALUE_;
};
goog.i18n.uChar.isLeadSurrogateCodePoint = function(codePoint) {
  return codePoint >= goog.i18n.uChar.LEAD_SURROGATE_MIN_VALUE_ && codePoint <= goog.i18n.uChar.LEAD_SURROGATE_MAX_VALUE_;
};
goog.i18n.uChar.isTrailSurrogateCodePoint = function(codePoint) {
  return codePoint >= goog.i18n.uChar.TRAIL_SURROGATE_MIN_VALUE_ && codePoint <= goog.i18n.uChar.TRAIL_SURROGATE_MAX_VALUE_;
};
goog.i18n.uChar.buildSupplementaryCodePoint = function(lead, trail) {
  return goog.i18n.uChar.isLeadSurrogateCodePoint(lead) && goog.i18n.uChar.isTrailSurrogateCodePoint(trail) ? (lead << goog.i18n.uChar.TRAIL_SURROGATE_BIT_COUNT_) - (goog.i18n.uChar.LEAD_SURROGATE_MIN_VALUE_ << goog.i18n.uChar.TRAIL_SURROGATE_BIT_COUNT_) + (trail - goog.i18n.uChar.TRAIL_SURROGATE_MIN_VALUE_ + goog.i18n.uChar.SUPPLEMENTARY_CODE_POINT_MIN_VALUE_) : null;
};
goog.structs = {};
goog.structs.InversionMap = function(rangeArray, valueArray, opt_delta) {
  this.rangeArray = null;
  goog.asserts.assert(rangeArray.length == valueArray.length, "rangeArray and valueArray must have the same length.");
  this.storeInversion_(rangeArray, opt_delta);
  this.values = valueArray;
};
goog.structs.InversionMap.prototype.storeInversion_ = function(rangeArray, opt_delta) {
  this.rangeArray = rangeArray;
  for (var i = 1; i < rangeArray.length; i++) {
    null == rangeArray[i] ? rangeArray[i] = rangeArray[i - 1] + 1 : opt_delta && (rangeArray[i] += rangeArray[i - 1]);
  }
};
goog.structs.InversionMap.prototype.at = function(intKey) {
  var index = this.getLeast(intKey);
  return 0 > index ? null : this.values[index];
};
goog.structs.InversionMap.prototype.getLeast = function(intKey) {
  for (var arr = this.rangeArray, low = 0, high = arr.length; 8 < high - low;) {
    var mid = high + low >> 1;
    arr[mid] <= intKey ? low = mid : high = mid;
  }
  for (; low < high && !(intKey < arr[low]); ++low) {
  }
  return low - 1;
};
goog.i18n.GraphemeBreak = {};
goog.i18n.GraphemeBreak.property = {OTHER:0, CONTROL:1, EXTEND:2, PREPEND:3, SPACING_MARK:4, INDIC_LETTER:5, VIRAMA:6, L:7, V:8, T:9, LV:10, LVT:11, CR:12, LF:13, REGIONAL_INDICATOR:14, ZWJ:15, E_BASE:16, GLUE_AFTER_ZWJ:17, E_MODIFIER:18, E_BASE_GAZ:19};
goog.i18n.GraphemeBreak.inversions_ = null;
goog.i18n.GraphemeBreak.applyBreakRules_ = function(a, b, extended) {
  var prop = goog.i18n.GraphemeBreak.property, aCode = goog.isString(a) ? goog.i18n.GraphemeBreak.getCodePoint_(a, a.length - 1) : a, bCode = goog.isString(b) ? goog.i18n.GraphemeBreak.getCodePoint_(b, 0) : b, aProp = goog.i18n.GraphemeBreak.getBreakProp_(aCode), bProp = goog.i18n.GraphemeBreak.getBreakProp_(bCode), isString = goog.isString(a);
  if (aProp === prop.CR && bProp === prop.LF) {
    return !1;
  }
  if (aProp === prop.CONTROL || aProp === prop.CR || aProp === prop.LF || bProp === prop.CONTROL || bProp === prop.CR || bProp === prop.LF) {
    return !0;
  }
  if (aProp === prop.L && (bProp === prop.L || bProp === prop.V || bProp === prop.LV || bProp === prop.LVT) || !(aProp !== prop.LV && aProp !== prop.V || bProp !== prop.V && bProp !== prop.T) || (aProp === prop.LVT || aProp === prop.T) && bProp === prop.T || bProp === prop.EXTEND || bProp === prop.ZWJ || bProp === prop.VIRAMA || extended && (aProp === prop.PREPEND || bProp === prop.SPACING_MARK) || extended && aProp === prop.VIRAMA && bProp === prop.INDIC_LETTER) {
    return !1;
  }
  var codePointProp;
  if (isString) {
    if (bProp === prop.E_MODIFIER) {
      var aStr = a;
      var index = aStr.length - 1;
      var codePoint = aCode;
      for (codePointProp = aProp; 0 < index && codePointProp === prop.EXTEND;) {
        index -= goog.i18n.uChar.charCount(codePoint), codePoint = goog.i18n.GraphemeBreak.getCodePoint_(aStr, index), codePointProp = goog.i18n.GraphemeBreak.getBreakProp_(codePoint);
      }
      if (codePointProp === prop.E_BASE || codePointProp === prop.E_BASE_GAZ) {
        return !1;
      }
    }
  } else {
    if ((aProp === prop.E_BASE || aProp === prop.E_BASE_GAZ) && bProp === prop.E_MODIFIER) {
      return !1;
    }
  }
  if (aProp === prop.ZWJ && (bProp === prop.GLUE_AFTER_ZWJ || bProp === prop.E_BASE_GAZ)) {
    return !1;
  }
  if (isString) {
    if (bProp === prop.REGIONAL_INDICATOR) {
      var numberOfRi = 0;
      aStr = a;
      index = aStr.length - 1;
      codePoint = aCode;
      for (codePointProp = aProp; 0 < index && codePointProp === prop.REGIONAL_INDICATOR;) {
        numberOfRi++, index -= goog.i18n.uChar.charCount(codePoint), codePoint = goog.i18n.GraphemeBreak.getCodePoint_(aStr, index), codePointProp = goog.i18n.GraphemeBreak.getBreakProp_(codePoint);
      }
      codePointProp === prop.REGIONAL_INDICATOR && numberOfRi++;
      if (1 === numberOfRi % 2) {
        return !1;
      }
    }
  } else {
    if (aProp === prop.REGIONAL_INDICATOR && bProp === prop.REGIONAL_INDICATOR) {
      return !1;
    }
  }
  return !0;
};
goog.i18n.GraphemeBreak.getBreakProp_ = function(codePoint) {
  if (44032 <= codePoint && 55203 >= codePoint) {
    var prop = goog.i18n.GraphemeBreak.property;
    return 16 === codePoint % 28 ? prop.LV : prop.LVT;
  }
  goog.i18n.GraphemeBreak.inversions_ || (goog.i18n.GraphemeBreak.inversions_ = new goog.structs.InversionMap([0, 10, 1, 2, 1, 18, 95, 33, 13, 1, 594, 112, 275, 7, 263, 45, 1, 1, 1, 2, 1, 2, 1, 1, 56, 6, 10, 11, 1, 1, 46, 21, 16, 1, 101, 7, 1, 1, 6, 2, 2, 1, 4, 33, 1, 1, 1, 30, 27, 91, 11, 58, 9, 34, 4, 1, 9, 1, 3, 1, 5, 43, 3, 120, 14, 1, 32, 1, 17, 37, 1, 1, 1, 1, 3, 8, 4, 1, 2, 1, 7, 8, 2, 2, 21, 7, 1, 1, 2, 17, 39, 1, 1, 1, 2, 6, 6, 1, 9, 5, 4, 2, 2, 12, 2, 15, 2, 1, 17, 39, 2, 3, 12, 4, 8, 6, 
  17, 2, 3, 14, 1, 17, 39, 1, 1, 3, 8, 4, 1, 20, 2, 29, 1, 2, 17, 39, 1, 1, 2, 1, 6, 6, 9, 6, 4, 2, 2, 13, 1, 16, 1, 18, 41, 1, 1, 1, 12, 1, 9, 1, 40, 1, 3, 17, 31, 1, 5, 4, 3, 5, 7, 8, 3, 2, 8, 2, 29, 1, 2, 17, 39, 1, 1, 1, 1, 2, 1, 3, 1, 5, 1, 8, 9, 1, 3, 2, 29, 1, 2, 17, 38, 3, 1, 2, 5, 7, 1, 1, 8, 1, 10, 2, 30, 2, 22, 48, 5, 1, 2, 6, 7, 1, 18, 2, 13, 46, 2, 1, 1, 1, 6, 1, 12, 8, 50, 46, 2, 1, 1, 1, 9, 11, 6, 14, 2, 58, 2, 27, 1, 1, 1, 1, 1, 4, 2, 49, 14, 1, 4, 1, 1, 2, 5, 48, 9, 1, 57, 33, 12, 
  4, 1, 6, 1, 2, 2, 2, 1, 16, 2, 4, 2, 2, 4, 3, 1, 3, 2, 7, 3, 4, 13, 1, 1, 1, 2, 6, 1, 1, 14, 1, 98, 96, 72, 88, 349, 3, 931, 15, 2, 1, 14, 15, 2, 1, 14, 15, 2, 15, 15, 14, 35, 17, 2, 1, 7, 8, 1, 2, 9, 1, 1, 9, 1, 45, 3, 1, 118, 2, 34, 1, 87, 28, 3, 3, 4, 2, 9, 1, 6, 3, 20, 19, 29, 44, 84, 23, 2, 2, 1, 4, 45, 6, 2, 1, 1, 1, 8, 1, 1, 1, 2, 8, 6, 13, 48, 84, 1, 14, 33, 1, 1, 5, 1, 1, 5, 1, 1, 1, 7, 31, 9, 12, 2, 1, 7, 23, 1, 4, 2, 2, 2, 2, 2, 11, 3, 2, 36, 2, 1, 1, 2, 3, 1, 1, 3, 2, 12, 36, 8, 8, 
  2, 2, 21, 3, 128, 3, 1, 13, 1, 7, 4, 1, 4, 2, 1, 3, 2, 198, 64, 523, 1, 1, 1, 2, 24, 7, 49, 16, 96, 33, 1324, 1, 34, 1, 1, 1, 82, 2, 98, 1, 14, 1, 1, 4, 86, 1, 1418, 3, 141, 1, 96, 32, 554, 6, 105, 2, 30164, 4, 1, 10, 32, 2, 80, 2, 272, 1, 3, 1, 4, 1, 23, 2, 2, 1, 24, 30, 4, 4, 3, 8, 1, 1, 13, 2, 16, 34, 16, 1, 1, 26, 18, 24, 24, 4, 8, 2, 23, 11, 1, 1, 12, 32, 3, 1, 5, 3, 3, 36, 1, 2, 4, 2, 1, 3, 1, 36, 1, 32, 35, 6, 2, 2, 2, 2, 12, 1, 8, 1, 1, 18, 16, 1, 3, 6, 1, 1, 1, 3, 48, 1, 1, 3, 2, 2, 5, 
  2, 1, 1, 32, 9, 1, 2, 2, 5, 1, 1, 201, 14, 2, 1, 1, 9, 8, 2, 1, 2, 1, 2, 1, 1, 1, 18, 11184, 27, 49, 1028, 1024, 6942, 1, 737, 16, 16, 16, 207, 1, 158, 2, 89, 3, 513, 1, 226, 1, 149, 5, 1670, 15, 40, 7, 1, 165, 2, 1305, 1, 1, 1, 53, 14, 1, 56, 1, 2, 1, 45, 3, 4, 2, 1, 1, 2, 1, 66, 3, 36, 5, 1, 6, 2, 62, 1, 12, 2, 1, 48, 3, 9, 1, 1, 1, 2, 6, 3, 95, 3, 3, 2, 1, 1, 2, 6, 1, 160, 1, 3, 7, 1, 21, 2, 2, 56, 1, 1, 1, 1, 1, 12, 1, 9, 1, 10, 4, 15, 192, 3, 8, 2, 1, 2, 1, 1, 105, 1, 2, 6, 1, 1, 2, 1, 1, 
  2, 1, 1, 1, 235, 1, 2, 6, 4, 2, 1, 1, 1, 27, 2, 82, 3, 8, 2, 1, 1, 1, 1, 106, 1, 1, 1, 2, 6, 1, 1, 101, 3, 2, 4, 1, 4, 1, 1283, 1, 14, 1, 1, 82, 23, 1, 7, 1, 2, 1, 2, 20025, 5, 59, 7, 1050, 62, 4, 19722, 2, 1, 4, 5313, 1, 1, 3, 3, 1, 5, 8, 8, 2, 7, 30, 4, 148, 3, 1979, 55, 4, 50, 8, 1, 14, 1, 22, 1424, 2213, 7, 109, 7, 2203, 26, 264, 1, 53, 1, 52, 1, 17, 1, 13, 1, 16, 1, 3, 1, 25, 3, 2, 1, 2, 3, 30, 1, 1, 1, 13, 5, 66, 2, 2, 11, 21, 4, 4, 1, 1, 9, 3, 1, 4, 3, 1, 3, 3, 1, 30, 1, 16, 2, 106, 1, 4, 
  1, 71, 2, 4, 1, 21, 1, 4, 2, 81, 1, 92, 3, 3, 5, 48, 1, 17, 1, 16, 1, 16, 3, 9, 1, 11, 1, 587, 5, 1, 1, 7, 1, 9, 10, 3, 2, 788162, 31], [1, 13, 1, 12, 1, 0, 1, 0, 1, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 3, 0, 2, 0, 1, 0, 2, 0, 2, 0, 2, 3, 0, 2, 0, 2, 0, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 3, 2, 4, 0, 5, 2, 4, 2, 0, 4, 2, 4, 6, 4, 0, 2, 5, 0, 2, 0, 5, 0, 2, 4, 0, 5, 2, 0, 2, 4, 2, 4, 6, 0, 2, 5, 0, 2, 0, 5, 0, 2, 4, 0, 5, 2, 4, 2, 6, 2, 5, 0, 2, 0, 2, 4, 
  0, 5, 2, 0, 4, 2, 4, 6, 0, 2, 0, 2, 4, 0, 5, 2, 0, 2, 4, 2, 4, 6, 2, 5, 0, 2, 0, 5, 0, 2, 0, 5, 2, 4, 2, 4, 6, 0, 2, 0, 2, 4, 0, 5, 0, 5, 0, 2, 4, 2, 6, 2, 5, 0, 2, 0, 2, 4, 0, 5, 2, 0, 4, 2, 4, 2, 4, 2, 4, 2, 6, 2, 5, 0, 2, 0, 2, 4, 0, 5, 0, 2, 4, 2, 4, 6, 3, 0, 2, 0, 2, 0, 4, 0, 5, 6, 2, 4, 2, 4, 2, 0, 4, 0, 5, 0, 2, 0, 4, 2, 6, 0, 2, 0, 5, 0, 2, 0, 4, 2, 0, 2, 0, 5, 0, 2, 0, 2, 0, 2, 0, 2, 0, 4, 5, 2, 4, 2, 6, 0, 2, 0, 2, 0, 2, 0, 5, 0, 2, 4, 2, 0, 6, 4, 2, 5, 0, 5, 0, 4, 2, 5, 2, 5, 0, 5, 0, 
  5, 2, 5, 2, 0, 4, 2, 0, 2, 5, 0, 2, 0, 7, 8, 9, 0, 2, 0, 5, 2, 6, 0, 5, 2, 6, 0, 5, 2, 0, 5, 2, 5, 0, 2, 4, 2, 4, 2, 4, 2, 6, 2, 0, 2, 0, 2, 1, 0, 2, 0, 2, 0, 5, 0, 2, 4, 2, 4, 2, 4, 2, 0, 5, 0, 5, 0, 5, 2, 4, 2, 0, 5, 0, 5, 4, 2, 4, 2, 6, 0, 2, 0, 2, 4, 2, 0, 2, 4, 0, 5, 2, 4, 2, 4, 2, 4, 2, 4, 6, 5, 0, 2, 0, 2, 4, 0, 5, 4, 2, 4, 2, 6, 2, 5, 0, 5, 0, 5, 0, 2, 4, 2, 4, 2, 4, 2, 6, 0, 5, 4, 2, 4, 2, 0, 5, 0, 2, 0, 2, 4, 2, 0, 2, 0, 4, 2, 0, 2, 0, 2, 0, 1, 2, 15, 1, 0, 1, 0, 1, 0, 2, 0, 16, 0, 17, 
  0, 17, 0, 17, 0, 16, 0, 17, 0, 16, 0, 17, 0, 2, 0, 6, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 6, 5, 2, 5, 4, 2, 4, 0, 5, 0, 5, 0, 5, 0, 5, 0, 4, 0, 5, 4, 6, 2, 0, 2, 0, 5, 0, 2, 0, 5, 2, 4, 6, 0, 7, 2, 4, 0, 5, 0, 5, 2, 4, 2, 4, 2, 4, 6, 0, 2, 0, 5, 2, 4, 2, 4, 2, 0, 2, 0, 2, 4, 0, 5, 0, 5, 0, 5, 0, 2, 0, 5, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 5, 4, 2, 4, 0, 4, 6, 0, 5, 0, 5, 0, 5, 0, 4, 2, 4, 2, 4, 0, 4, 6, 0, 11, 8, 9, 0, 2, 0, 2, 0, 2, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 2, 0, 2, 0, 2, 0, 
  2, 6, 0, 2, 0, 4, 2, 4, 0, 2, 6, 0, 6, 2, 4, 0, 4, 2, 4, 6, 2, 0, 3, 0, 2, 0, 2, 4, 2, 6, 0, 2, 0, 2, 4, 0, 4, 2, 4, 6, 0, 3, 0, 2, 0, 4, 2, 4, 2, 6, 2, 0, 2, 0, 2, 4, 2, 6, 0, 2, 4, 0, 2, 0, 2, 4, 2, 4, 6, 0, 2, 0, 4, 2, 0, 4, 2, 4, 6, 2, 4, 2, 0, 2, 4, 2, 4, 2, 4, 2, 4, 2, 4, 6, 2, 0, 2, 4, 2, 4, 2, 4, 6, 2, 0, 2, 0, 4, 2, 4, 2, 4, 6, 2, 0, 2, 4, 2, 4, 2, 6, 2, 0, 2, 4, 2, 4, 2, 6, 0, 4, 2, 4, 6, 0, 2, 4, 2, 4, 2, 4, 2, 0, 2, 0, 2, 0, 4, 2, 0, 2, 0, 1, 0, 2, 4, 2, 0, 4, 2, 1, 2, 0, 2, 0, 2, 0, 
  2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 14, 0, 17, 0, 17, 0, 17, 0, 16, 0, 17, 0, 17, 0, 17, 0, 16, 0, 16, 0, 16, 0, 17, 0, 17, 0, 18, 0, 16, 0, 16, 0, 19, 0, 16, 0, 16, 0, 16, 0, 16, 0, 16, 0, 17, 0, 16, 0, 17, 0, 17, 0, 17, 0, 16, 0, 16, 0, 16, 0, 16, 0, 17, 0, 16, 0, 16, 0, 17, 0, 17, 0, 16, 0, 16, 0, 16, 0, 16, 0, 16, 0, 16, 0, 16, 0, 16, 0, 16, 0, 1, 2], !0));
  return goog.i18n.GraphemeBreak.inversions_.at(codePoint);
};
goog.i18n.GraphemeBreak.getCodePoint_ = function(str, index) {
  var codePoint = goog.i18n.uChar.getCodePointAround(str, index);
  return 0 > codePoint ? -codePoint : codePoint;
};
goog.i18n.GraphemeBreak.hasGraphemeBreak = function(a, b, opt_extended) {
  return goog.i18n.GraphemeBreak.applyBreakRules_(a, b, !1 !== opt_extended);
};
goog.i18n.GraphemeBreak.hasGraphemeBreakStrings = function(a, b, opt_extended) {
  goog.asserts.assert(goog.isDef(a), "First string should be defined.");
  goog.asserts.assert(goog.isDef(b), "Second string should be defined.");
  return 0 === a.length || 0 === b.length ? !0 : goog.i18n.GraphemeBreak.applyBreakRules_(a, b, !1 !== opt_extended);
};
goog.format = {};
goog.format.fileSize = function(bytes, opt_decimals) {
  return goog.format.numBytesToString(bytes, opt_decimals, !1);
};
goog.format.isConvertableScaledNumber = function(val) {
  return goog.format.SCALED_NUMERIC_RE_.test(val);
};
goog.format.stringToNumericValue = function(stringValue) {
  return goog.string.endsWith(stringValue, "B") ? goog.format.stringToNumericValue_(stringValue, goog.format.NUMERIC_SCALES_BINARY_) : goog.format.stringToNumericValue_(stringValue, goog.format.NUMERIC_SCALES_SI_);
};
goog.format.stringToNumBytes = function(stringValue) {
  return goog.format.stringToNumericValue_(stringValue, goog.format.NUMERIC_SCALES_BINARY_);
};
goog.format.numericValueToString = function(val, opt_decimals) {
  return goog.format.numericValueToString_(val, goog.format.NUMERIC_SCALES_SI_, opt_decimals);
};
goog.format.numBytesToString = function(val, opt_decimals, opt_suffix, opt_useSeparator) {
  var suffix = "";
  if (!goog.isDef(opt_suffix) || opt_suffix) {
    suffix = "B";
  }
  return goog.format.numericValueToString_(val, goog.format.NUMERIC_SCALES_BINARY_, opt_decimals, suffix, opt_useSeparator);
};
goog.format.stringToNumericValue_ = function(stringValue, conversion) {
  var match = stringValue.match(goog.format.SCALED_NUMERIC_RE_);
  return match ? Number(match[1]) * conversion[match[2]] : NaN;
};
goog.format.numericValueToString_ = function(val, conversion, opt_decimals, opt_suffix, opt_useSeparator) {
  var prefixes = goog.format.NUMERIC_SCALE_PREFIXES_, orig_val = val, symbol = "", separator = "", scale = 1;
  0 > val && (val = -val);
  for (var i = 0; i < prefixes.length; i++) {
    var unit = prefixes[i];
    scale = conversion[unit];
    if (val >= scale || 1 >= scale && val > 0.1 * scale) {
      symbol = unit;
      break;
    }
  }
  symbol ? (opt_suffix && (symbol += opt_suffix), opt_useSeparator && (separator = " ")) : scale = 1;
  var ex = Math.pow(10, goog.isDef(opt_decimals) ? opt_decimals : 2);
  return Math.round(orig_val / scale * ex) / ex + separator + symbol;
};
goog.format.SCALED_NUMERIC_RE_ = /^([-]?\d+\.?\d*)([K,M,G,T,P,E,Z,Y,k,m,u,n]?)[B]?$/;
goog.format.NUMERIC_SCALE_PREFIXES_ = "Y Z E P T G M K  m u n".split(" ");
goog.format.NUMERIC_SCALES_SI_ = {"":1, n:1e-9, u:1e-6, m:1e-3, k:1e3, K:1e3, M:1e6, G:1e9, T:1e12, P:1e15, E:1e18, Z:1e21, Y:1e24};
goog.format.NUMERIC_SCALES_BINARY_ = {"":1, n:Math.pow(1024, -3), u:Math.pow(1024, -2), m:1.0 / 1024, k:1024, K:1024, M:Math.pow(1024, 2), G:Math.pow(1024, 3), T:Math.pow(1024, 4), P:Math.pow(1024, 5), E:Math.pow(1024, 6), Z:Math.pow(1024, 7), Y:Math.pow(1024, 8)};
goog.format.FIRST_GRAPHEME_EXTEND_ = 768;
goog.format.isTreatedAsBreakingSpace_ = function(charCode) {
  return charCode <= goog.format.WbrToken_.SPACE || 4096 <= charCode && (8192 <= charCode && 8198 >= charCode || 8200 <= charCode && 8203 >= charCode || 5760 == charCode || 6158 == charCode || 8232 == charCode || 8233 == charCode || 8287 == charCode || 12288 == charCode);
};
goog.format.isInvisibleFormattingCharacter_ = function(charCode) {
  return 8204 <= charCode && 8207 >= charCode || 8234 <= charCode && 8238 >= charCode;
};
goog.format.insertWordBreaksGeneric_ = function(str, hasGraphemeBreak, opt_maxlen) {
  var maxlen = opt_maxlen || 10;
  if (maxlen > str.length) {
    return str;
  }
  for (var rv = [], n = 0, nestingCharCode = 0, lastDumpPosition = 0, charCode = 0, i = 0; i < str.length; i++) {
    var lastCharCode = charCode;
    charCode = str.charCodeAt(i);
    var isPotentiallyGraphemeExtending = charCode >= goog.format.FIRST_GRAPHEME_EXTEND_ && !hasGraphemeBreak(lastCharCode, charCode, !0);
    n >= maxlen && !goog.format.isTreatedAsBreakingSpace_(charCode) && !isPotentiallyGraphemeExtending && (rv.push(str.substring(lastDumpPosition, i), goog.format.WORD_BREAK_HTML), lastDumpPosition = i, n = 0);
    nestingCharCode ? charCode == goog.format.WbrToken_.GT && nestingCharCode == goog.format.WbrToken_.LT ? nestingCharCode = 0 : charCode == goog.format.WbrToken_.SEMI_COLON && nestingCharCode == goog.format.WbrToken_.AMP && (nestingCharCode = 0, n++) : charCode == goog.format.WbrToken_.LT || charCode == goog.format.WbrToken_.AMP ? nestingCharCode = charCode : goog.format.isTreatedAsBreakingSpace_(charCode) ? n = 0 : goog.format.isInvisibleFormattingCharacter_(charCode) || n++;
  }
  rv.push(str.substr(lastDumpPosition));
  return rv.join("");
};
goog.format.insertWordBreaks = function(str, opt_maxlen) {
  return goog.format.insertWordBreaksGeneric_(str, goog.i18n.GraphemeBreak.hasGraphemeBreak, opt_maxlen);
};
goog.format.conservativelyHasGraphemeBreak_ = function(lastCharCode, charCode) {
  return 1024 <= charCode && 1315 > charCode;
};
goog.format.insertWordBreaksBasic = function(str, opt_maxlen) {
  return goog.format.insertWordBreaksGeneric_(str, goog.format.conservativelyHasGraphemeBreak_, opt_maxlen);
};
goog.format.IS_IE8_OR_ABOVE_ = goog.userAgent.IE && goog.userAgent.isVersionOrHigher(8);
goog.format.WORD_BREAK_HTML = goog.userAgent.WEBKIT ? "<wbr></wbr>" : goog.userAgent.OPERA ? "&shy;" : goog.format.IS_IE8_OR_ABOVE_ ? "&#8203;" : "<wbr>";
goog.format.WbrToken_ = {LT:60, GT:62, AMP:38, SEMI_COLON:59, SPACE:32};
goog.fs = {};
goog.fs.url = {};
goog.fs.url.createObjectUrl = function(blob) {
  return goog.fs.url.getUrlObject_().createObjectURL(blob);
};
goog.fs.url.revokeObjectUrl = function(url) {
  goog.fs.url.getUrlObject_().revokeObjectURL(url);
};
goog.fs.url.getUrlObject_ = function() {
  var urlObject = goog.fs.url.findUrlObject_();
  if (null != urlObject) {
    return urlObject;
  }
  throw Error("This browser doesn't seem to support blob URLs");
};
goog.fs.url.findUrlObject_ = function() {
  return goog.isDef(goog.global.URL) && goog.isDef(goog.global.URL.createObjectURL) ? goog.global.URL : goog.isDef(goog.global.webkitURL) && goog.isDef(goog.global.webkitURL.createObjectURL) ? goog.global.webkitURL : goog.isDef(goog.global.createObjectURL) ? goog.global : null;
};
goog.fs.url.browserSupportsObjectUrls = function() {
  return null != goog.fs.url.findUrlObject_();
};
goog.functions = {};
goog.functions.constant = function(retValue) {
  return function() {
    return retValue;
  };
};
goog.functions.FALSE = function() {
  return !1;
};
goog.functions.TRUE = function() {
  return !0;
};
goog.functions.NULL = function() {
  return null;
};
goog.functions.identity = function(opt_returnValue) {
  return opt_returnValue;
};
goog.functions.error = function(message) {
  return function() {
    throw Error(message);
  };
};
goog.functions.fail = function(err) {
  return function() {
    throw err;
  };
};
goog.functions.lock = function(f, opt_numArgs) {
  opt_numArgs = opt_numArgs || 0;
  return function() {
    return f.apply(this, Array.prototype.slice.call(arguments, 0, opt_numArgs));
  };
};
goog.functions.nth = function(n) {
  return function() {
    return arguments[n];
  };
};
goog.functions.partialRight = function(fn, var_args) {
  var rightArgs = Array.prototype.slice.call(arguments, 1);
  return function() {
    var newArgs = Array.prototype.slice.call(arguments);
    newArgs.push.apply(newArgs, rightArgs);
    return fn.apply(this, newArgs);
  };
};
goog.functions.withReturnValue = function(f, retValue) {
  return goog.functions.sequence(f, goog.functions.constant(retValue));
};
goog.functions.equalTo = function(value, opt_useLooseComparison) {
  return function(other) {
    return opt_useLooseComparison ? value == other : value === other;
  };
};
goog.functions.compose = function(fn, var_args) {
  var functions = arguments, length = functions.length;
  return function() {
    var result;
    length && (result = functions[length - 1].apply(this, arguments));
    for (var i = length - 2; 0 <= i; i--) {
      result = functions[i].call(this, result);
    }
    return result;
  };
};
goog.functions.sequence = function(var_args) {
  var functions = arguments, length = functions.length;
  return function() {
    for (var result, i = 0; i < length; i++) {
      result = functions[i].apply(this, arguments);
    }
    return result;
  };
};
goog.functions.and = function(var_args) {
  var functions = arguments, length = functions.length;
  return function() {
    for (var i = 0; i < length; i++) {
      if (!functions[i].apply(this, arguments)) {
        return !1;
      }
    }
    return !0;
  };
};
goog.functions.or = function(var_args) {
  var functions = arguments, length = functions.length;
  return function() {
    for (var i = 0; i < length; i++) {
      if (functions[i].apply(this, arguments)) {
        return !0;
      }
    }
    return !1;
  };
};
goog.functions.not = function(f) {
  return function() {
    return !f.apply(this, arguments);
  };
};
goog.functions.create = function(constructor, var_args) {
  var temp = function() {
  };
  temp.prototype = constructor.prototype;
  var obj = new temp;
  constructor.apply(obj, Array.prototype.slice.call(arguments, 1));
  return obj;
};
goog.functions.CACHE_RETURN_VALUE = !0;
goog.functions.cacheReturnValue = function(fn) {
  var called = !1, value;
  return function() {
    if (!goog.functions.CACHE_RETURN_VALUE) {
      return fn();
    }
    called || (value = fn(), called = !0);
    return value;
  };
};
goog.functions.once = function(f) {
  var inner = f;
  return function() {
    if (inner) {
      var tmp = inner;
      inner = null;
      tmp();
    }
  };
};
goog.functions.debounce = function(f, interval, opt_scope) {
  var timeout = 0;
  return function(var_args) {
    goog.global.clearTimeout(timeout);
    var args = arguments;
    timeout = goog.global.setTimeout(function() {
      f.apply(opt_scope, args);
    }, interval);
  };
};
goog.functions.throttle = function(f, interval, opt_scope) {
  var timeout = 0, shouldFire = !1, args = [], handleTimeout = function() {
    timeout = 0;
    shouldFire && (shouldFire = !1, fire());
  }, fire = function() {
    timeout = goog.global.setTimeout(handleTimeout, interval);
    f.apply(opt_scope, args);
  };
  return function(var_args) {
    args = arguments;
    timeout ? shouldFire = !0 : fire();
  };
};
goog.functions.rateLimit = function(f, interval, opt_scope) {
  var timeout = 0, handleTimeout = function() {
    timeout = 0;
  };
  return function(var_args) {
    timeout || (timeout = goog.global.setTimeout(handleTimeout, interval), f.apply(opt_scope, arguments));
  };
};
goog.html = {};
goog.html.trustedtypes = {};
goog.html.trustedtypes.PRIVATE_DO_NOT_ACCESS_OR_ELSE_POLICY = goog.TRUSTED_TYPES_POLICY_NAME ? goog.createTrustedTypesPolicy(goog.TRUSTED_TYPES_POLICY_NAME + "#html") : null;
goog.string.TypedString = function() {
};
goog.string.Const = function(opt_token, opt_content) {
  this.stringConstValueWithSecurityContract__googStringSecurityPrivate_ = opt_token === goog.string.Const.GOOG_STRING_CONSTRUCTOR_TOKEN_PRIVATE_ && opt_content || "";
  this.STRING_CONST_TYPE_MARKER__GOOG_STRING_SECURITY_PRIVATE_ = goog.string.Const.TYPE_MARKER_;
};
goog.string.Const.prototype.implementsGoogStringTypedString = !0;
goog.string.Const.prototype.getTypedStringValue = function() {
  return this.stringConstValueWithSecurityContract__googStringSecurityPrivate_;
};
goog.string.Const.prototype.toString = function() {
  return "Const{" + this.stringConstValueWithSecurityContract__googStringSecurityPrivate_ + "}";
};
goog.string.Const.unwrap = function(stringConst) {
  if (stringConst instanceof goog.string.Const && stringConst.constructor === goog.string.Const && stringConst.STRING_CONST_TYPE_MARKER__GOOG_STRING_SECURITY_PRIVATE_ === goog.string.Const.TYPE_MARKER_) {
    return stringConst.stringConstValueWithSecurityContract__googStringSecurityPrivate_;
  }
  goog.asserts.fail("expected object of type Const, got '" + stringConst + "'");
  return "type_error:Const";
};
goog.string.Const.from = function(s) {
  return new goog.string.Const(goog.string.Const.GOOG_STRING_CONSTRUCTOR_TOKEN_PRIVATE_, s);
};
goog.string.Const.TYPE_MARKER_ = {};
goog.string.Const.GOOG_STRING_CONSTRUCTOR_TOKEN_PRIVATE_ = {};
goog.string.Const.EMPTY = goog.string.Const.from("");
goog.html.SafeScript = function() {
  this.privateDoNotAccessOrElseSafeScriptWrappedValue_ = "";
  this.SAFE_SCRIPT_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = goog.html.SafeScript.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
};
goog.html.SafeScript.prototype.implementsGoogStringTypedString = !0;
goog.html.SafeScript.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};
goog.html.SafeScript.fromConstant = function(script) {
  var scriptString = goog.string.Const.unwrap(script);
  return 0 === scriptString.length ? goog.html.SafeScript.EMPTY : goog.html.SafeScript.createSafeScriptSecurityPrivateDoNotAccessOrElse(scriptString);
};
goog.html.SafeScript.fromConstantAndArgs = function(code, var_args) {
  for (var args = [], i = 1; i < arguments.length; i++) {
    args.push(goog.html.SafeScript.stringify_(arguments[i]));
  }
  return goog.html.SafeScript.createSafeScriptSecurityPrivateDoNotAccessOrElse("(" + goog.string.Const.unwrap(code) + ")(" + args.join(", ") + ");");
};
goog.html.SafeScript.fromJson = function(val) {
  return goog.html.SafeScript.createSafeScriptSecurityPrivateDoNotAccessOrElse(goog.html.SafeScript.stringify_(val));
};
goog.html.SafeScript.prototype.getTypedStringValue = function() {
  return this.privateDoNotAccessOrElseSafeScriptWrappedValue_.toString();
};
goog.DEBUG && (goog.html.SafeScript.prototype.toString = function() {
  return "SafeScript{" + this.privateDoNotAccessOrElseSafeScriptWrappedValue_ + "}";
});
goog.html.SafeScript.unwrap = function(safeScript) {
  return goog.html.SafeScript.unwrapTrustedScript(safeScript).toString();
};
goog.html.SafeScript.unwrapTrustedScript = function(safeScript) {
  if (safeScript instanceof goog.html.SafeScript && safeScript.constructor === goog.html.SafeScript && safeScript.SAFE_SCRIPT_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ === goog.html.SafeScript.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
    return safeScript.privateDoNotAccessOrElseSafeScriptWrappedValue_;
  }
  goog.asserts.fail("expected object of type SafeScript, got '" + safeScript + "' of type " + goog.typeOf(safeScript));
  return "type_error:SafeScript";
};
goog.html.SafeScript.stringify_ = function(val) {
  return JSON.stringify(val).replace(/</g, "\\x3c");
};
goog.html.SafeScript.createSafeScriptSecurityPrivateDoNotAccessOrElse = function(script) {
  return (new goog.html.SafeScript).initSecurityPrivateDoNotAccessOrElse_(script);
};
goog.html.SafeScript.prototype.initSecurityPrivateDoNotAccessOrElse_ = function(script) {
  this.privateDoNotAccessOrElseSafeScriptWrappedValue_ = goog.html.trustedtypes.PRIVATE_DO_NOT_ACCESS_OR_ELSE_POLICY ? goog.html.trustedtypes.PRIVATE_DO_NOT_ACCESS_OR_ELSE_POLICY.createScript(script) : script;
  return this;
};
goog.html.SafeScript.EMPTY = goog.html.SafeScript.createSafeScriptSecurityPrivateDoNotAccessOrElse("");
goog.i18n.bidi = {};
goog.i18n.bidi.FORCE_RTL = !1;
goog.i18n.bidi.IS_RTL = goog.i18n.bidi.FORCE_RTL || ("ar" == goog.LOCALE.substring(0, 2).toLowerCase() || "fa" == goog.LOCALE.substring(0, 2).toLowerCase() || "he" == goog.LOCALE.substring(0, 2).toLowerCase() || "iw" == goog.LOCALE.substring(0, 2).toLowerCase() || "ps" == goog.LOCALE.substring(0, 2).toLowerCase() || "sd" == goog.LOCALE.substring(0, 2).toLowerCase() || "ug" == goog.LOCALE.substring(0, 2).toLowerCase() || "ur" == goog.LOCALE.substring(0, 2).toLowerCase() || "yi" == goog.LOCALE.substring(0, 
2).toLowerCase()) && (2 == goog.LOCALE.length || "-" == goog.LOCALE.substring(2, 3) || "_" == goog.LOCALE.substring(2, 3)) || 3 <= goog.LOCALE.length && "ckb" == goog.LOCALE.substring(0, 3).toLowerCase() && (3 == goog.LOCALE.length || "-" == goog.LOCALE.substring(3, 4) || "_" == goog.LOCALE.substring(3, 4)) || 7 <= goog.LOCALE.length && ("-" == goog.LOCALE.substring(2, 3) || "_" == goog.LOCALE.substring(2, 3)) && ("adlm" == goog.LOCALE.substring(3, 7).toLowerCase() || "arab" == goog.LOCALE.substring(3, 
7).toLowerCase() || "hebr" == goog.LOCALE.substring(3, 7).toLowerCase() || "nkoo" == goog.LOCALE.substring(3, 7).toLowerCase() || "rohg" == goog.LOCALE.substring(3, 7).toLowerCase() || "thaa" == goog.LOCALE.substring(3, 7).toLowerCase()) || 8 <= goog.LOCALE.length && ("-" == goog.LOCALE.substring(3, 4) || "_" == goog.LOCALE.substring(3, 4)) && ("adlm" == goog.LOCALE.substring(4, 8).toLowerCase() || "arab" == goog.LOCALE.substring(4, 8).toLowerCase() || "hebr" == goog.LOCALE.substring(4, 8).toLowerCase() || 
"nkoo" == goog.LOCALE.substring(4, 8).toLowerCase() || "rohg" == goog.LOCALE.substring(4, 8).toLowerCase() || "thaa" == goog.LOCALE.substring(4, 8).toLowerCase());
goog.i18n.bidi.Format = {LRE:"\u202a", RLE:"\u202b", PDF:"\u202c", LRM:"\u200e", RLM:"\u200f"};
goog.i18n.bidi.Dir = {LTR:1, RTL:-1, NEUTRAL:0};
goog.i18n.bidi.RIGHT = "right";
goog.i18n.bidi.LEFT = "left";
goog.i18n.bidi.I18N_RIGHT = goog.i18n.bidi.IS_RTL ? goog.i18n.bidi.LEFT : goog.i18n.bidi.RIGHT;
goog.i18n.bidi.I18N_LEFT = goog.i18n.bidi.IS_RTL ? goog.i18n.bidi.RIGHT : goog.i18n.bidi.LEFT;
goog.i18n.bidi.toDir = function(givenDir, opt_noNeutral) {
  return "number" == typeof givenDir ? 0 < givenDir ? goog.i18n.bidi.Dir.LTR : 0 > givenDir ? goog.i18n.bidi.Dir.RTL : opt_noNeutral ? null : goog.i18n.bidi.Dir.NEUTRAL : null == givenDir ? null : givenDir ? goog.i18n.bidi.Dir.RTL : goog.i18n.bidi.Dir.LTR;
};
goog.i18n.bidi.ltrChars_ = "A-Za-z\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u02b8\u0300-\u0590\u0900-\u1fff\u200e\u2c00-\ud801\ud804-\ud839\ud83c-\udbff\uf900-\ufb1c\ufe00-\ufe6f\ufefd-\uffff";
goog.i18n.bidi.rtlChars_ = "\u0591-\u06ef\u06fa-\u08ff\u200f\ud802-\ud803\ud83a-\ud83b\ufb1d-\ufdff\ufe70-\ufefc";
goog.i18n.bidi.htmlSkipReg_ = /<[^>]*>|&[^;]+;/g;
goog.i18n.bidi.stripHtmlIfNeeded_ = function(str, opt_isStripNeeded) {
  return opt_isStripNeeded ? str.replace(goog.i18n.bidi.htmlSkipReg_, "") : str;
};
goog.i18n.bidi.rtlCharReg_ = new RegExp("[" + goog.i18n.bidi.rtlChars_ + "]");
goog.i18n.bidi.ltrCharReg_ = new RegExp("[" + goog.i18n.bidi.ltrChars_ + "]");
goog.i18n.bidi.hasAnyRtl = function(str, opt_isHtml) {
  return goog.i18n.bidi.rtlCharReg_.test(goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml));
};
goog.i18n.bidi.hasRtlChar = goog.i18n.bidi.hasAnyRtl;
goog.i18n.bidi.hasAnyLtr = function(str, opt_isHtml) {
  return goog.i18n.bidi.ltrCharReg_.test(goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml));
};
goog.i18n.bidi.ltrRe_ = new RegExp("^[" + goog.i18n.bidi.ltrChars_ + "]");
goog.i18n.bidi.rtlRe_ = new RegExp("^[" + goog.i18n.bidi.rtlChars_ + "]");
goog.i18n.bidi.isRtlChar = function(str) {
  return goog.i18n.bidi.rtlRe_.test(str);
};
goog.i18n.bidi.isLtrChar = function(str) {
  return goog.i18n.bidi.ltrRe_.test(str);
};
goog.i18n.bidi.isNeutralChar = function(str) {
  return !goog.i18n.bidi.isLtrChar(str) && !goog.i18n.bidi.isRtlChar(str);
};
goog.i18n.bidi.ltrDirCheckRe_ = new RegExp("^[^" + goog.i18n.bidi.rtlChars_ + "]*[" + goog.i18n.bidi.ltrChars_ + "]");
goog.i18n.bidi.rtlDirCheckRe_ = new RegExp("^[^" + goog.i18n.bidi.ltrChars_ + "]*[" + goog.i18n.bidi.rtlChars_ + "]");
goog.i18n.bidi.startsWithRtl = function(str, opt_isHtml) {
  return goog.i18n.bidi.rtlDirCheckRe_.test(goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml));
};
goog.i18n.bidi.isRtlText = goog.i18n.bidi.startsWithRtl;
goog.i18n.bidi.startsWithLtr = function(str, opt_isHtml) {
  return goog.i18n.bidi.ltrDirCheckRe_.test(goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml));
};
goog.i18n.bidi.isLtrText = goog.i18n.bidi.startsWithLtr;
goog.i18n.bidi.isRequiredLtrRe_ = /^http:\/\/.*/;
goog.i18n.bidi.isNeutralText = function(str, opt_isHtml) {
  str = goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml);
  return goog.i18n.bidi.isRequiredLtrRe_.test(str) || !goog.i18n.bidi.hasAnyLtr(str) && !goog.i18n.bidi.hasAnyRtl(str);
};
goog.i18n.bidi.ltrExitDirCheckRe_ = new RegExp("[" + goog.i18n.bidi.ltrChars_ + "][^" + goog.i18n.bidi.rtlChars_ + "]*$");
goog.i18n.bidi.rtlExitDirCheckRe_ = new RegExp("[" + goog.i18n.bidi.rtlChars_ + "][^" + goog.i18n.bidi.ltrChars_ + "]*$");
goog.i18n.bidi.endsWithLtr = function(str, opt_isHtml) {
  return goog.i18n.bidi.ltrExitDirCheckRe_.test(goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml));
};
goog.i18n.bidi.isLtrExitText = goog.i18n.bidi.endsWithLtr;
goog.i18n.bidi.endsWithRtl = function(str, opt_isHtml) {
  return goog.i18n.bidi.rtlExitDirCheckRe_.test(goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml));
};
goog.i18n.bidi.isRtlExitText = goog.i18n.bidi.endsWithRtl;
goog.i18n.bidi.rtlLocalesRe_ = /^(ar|ckb|dv|he|iw|fa|nqo|ps|sd|ug|ur|yi|.*[-_](Adlm|Arab|Hebr|Nkoo|Rohg|Thaa))(?!.*[-_](Latn|Cyrl)($|-|_))($|-|_)/i;
goog.i18n.bidi.isRtlLanguage = function(lang) {
  return goog.i18n.bidi.rtlLocalesRe_.test(lang);
};
goog.i18n.bidi.bracketGuardTextRe_ = /(\(.*?\)+)|(\[.*?\]+)|(\{.*?\}+)|(<.*?>+)/g;
goog.i18n.bidi.guardBracketInText = function(s, opt_isRtlContext) {
  var mark = (void 0 === opt_isRtlContext ? goog.i18n.bidi.hasAnyRtl(s) : opt_isRtlContext) ? goog.i18n.bidi.Format.RLM : goog.i18n.bidi.Format.LRM;
  return s.replace(goog.i18n.bidi.bracketGuardTextRe_, mark + "$&" + mark);
};
goog.i18n.bidi.enforceRtlInHtml = function(html) {
  return "<" == html.charAt(0) ? html.replace(/<\w+/, "$& dir=rtl") : "\n<span dir=rtl>" + html + "</span>";
};
goog.i18n.bidi.enforceRtlInText = function(text) {
  return goog.i18n.bidi.Format.RLE + text + goog.i18n.bidi.Format.PDF;
};
goog.i18n.bidi.enforceLtrInHtml = function(html) {
  return "<" == html.charAt(0) ? html.replace(/<\w+/, "$& dir=ltr") : "\n<span dir=ltr>" + html + "</span>";
};
goog.i18n.bidi.enforceLtrInText = function(text) {
  return goog.i18n.bidi.Format.LRE + text + goog.i18n.bidi.Format.PDF;
};
goog.i18n.bidi.dimensionsRe_ = /:\s*([.\d][.\w]*)\s+([.\d][.\w]*)\s+([.\d][.\w]*)\s+([.\d][.\w]*)/g;
goog.i18n.bidi.leftRe_ = /left/gi;
goog.i18n.bidi.rightRe_ = /right/gi;
goog.i18n.bidi.tempRe_ = /%%%%/g;
goog.i18n.bidi.mirrorCSS = function(cssStr) {
  return cssStr.replace(goog.i18n.bidi.dimensionsRe_, ":$1 $4 $3 $2").replace(goog.i18n.bidi.leftRe_, "%%%%").replace(goog.i18n.bidi.rightRe_, goog.i18n.bidi.LEFT).replace(goog.i18n.bidi.tempRe_, goog.i18n.bidi.RIGHT);
};
goog.i18n.bidi.doubleQuoteSubstituteRe_ = /([\u0591-\u05f2])"/g;
goog.i18n.bidi.singleQuoteSubstituteRe_ = /([\u0591-\u05f2])'/g;
goog.i18n.bidi.normalizeHebrewQuote = function(str) {
  return str.replace(goog.i18n.bidi.doubleQuoteSubstituteRe_, "$1\u05f4").replace(goog.i18n.bidi.singleQuoteSubstituteRe_, "$1\u05f3");
};
goog.i18n.bidi.wordSeparatorRe_ = /\s+/;
goog.i18n.bidi.hasNumeralsRe_ = /[\d\u06f0-\u06f9]/;
goog.i18n.bidi.rtlDetectionThreshold_ = 0.40;
goog.i18n.bidi.estimateDirection = function(str, opt_isHtml) {
  for (var rtlCount = 0, totalCount = 0, hasWeaklyLtr = !1, tokens = goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml).split(goog.i18n.bidi.wordSeparatorRe_), i = 0; i < tokens.length; i++) {
    var token = tokens[i];
    goog.i18n.bidi.startsWithRtl(token) ? (rtlCount++, totalCount++) : goog.i18n.bidi.isRequiredLtrRe_.test(token) ? hasWeaklyLtr = !0 : goog.i18n.bidi.hasAnyLtr(token) ? totalCount++ : goog.i18n.bidi.hasNumeralsRe_.test(token) && (hasWeaklyLtr = !0);
  }
  return 0 == totalCount ? hasWeaklyLtr ? goog.i18n.bidi.Dir.LTR : goog.i18n.bidi.Dir.NEUTRAL : rtlCount / totalCount > goog.i18n.bidi.rtlDetectionThreshold_ ? goog.i18n.bidi.Dir.RTL : goog.i18n.bidi.Dir.LTR;
};
goog.i18n.bidi.detectRtlDirectionality = function(str, opt_isHtml) {
  return goog.i18n.bidi.estimateDirection(str, opt_isHtml) == goog.i18n.bidi.Dir.RTL;
};
goog.i18n.bidi.setElementDirAndAlign = function(element, dir) {
  element && (dir = goog.i18n.bidi.toDir(dir)) && (element.style.textAlign = dir == goog.i18n.bidi.Dir.RTL ? goog.i18n.bidi.RIGHT : goog.i18n.bidi.LEFT, element.dir = dir == goog.i18n.bidi.Dir.RTL ? "rtl" : "ltr");
};
goog.i18n.bidi.setElementDirByTextDirectionality = function(element, text) {
  switch(goog.i18n.bidi.estimateDirection(text)) {
    case goog.i18n.bidi.Dir.LTR:
      element.dir = "ltr";
      break;
    case goog.i18n.bidi.Dir.RTL:
      element.dir = "rtl";
      break;
    default:
      element.removeAttribute("dir");
  }
};
goog.i18n.bidi.DirectionalString = function() {
};
goog.html.TrustedResourceUrl = function() {
  this.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue_ = "";
  this.trustedURL_ = null;
  this.TRUSTED_RESOURCE_URL_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = goog.html.TrustedResourceUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
};
goog.html.TrustedResourceUrl.prototype.implementsGoogStringTypedString = !0;
goog.html.TrustedResourceUrl.prototype.getTypedStringValue = function() {
  return this.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue_.toString();
};
goog.html.TrustedResourceUrl.prototype.implementsGoogI18nBidiDirectionalString = !0;
goog.html.TrustedResourceUrl.prototype.getDirection = function() {
  return goog.i18n.bidi.Dir.LTR;
};
goog.html.TrustedResourceUrl.prototype.cloneWithParams = function(searchParams, opt_hashParams) {
  var url = goog.html.TrustedResourceUrl.unwrap(this), parts = goog.html.TrustedResourceUrl.URL_PARAM_PARSER_.exec(url), urlHash = parts[3] || "";
  return goog.html.TrustedResourceUrl.createTrustedResourceUrlSecurityPrivateDoNotAccessOrElse(parts[1] + goog.html.TrustedResourceUrl.stringifyParams_("?", parts[2] || "", searchParams) + goog.html.TrustedResourceUrl.stringifyParams_("#", urlHash, opt_hashParams));
};
goog.DEBUG && (goog.html.TrustedResourceUrl.prototype.toString = function() {
  return "TrustedResourceUrl{" + this.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue_ + "}";
});
goog.html.TrustedResourceUrl.unwrap = function(trustedResourceUrl) {
  return goog.html.TrustedResourceUrl.unwrapTrustedScriptURL(trustedResourceUrl).toString();
};
goog.html.TrustedResourceUrl.unwrapTrustedScriptURL = function(trustedResourceUrl) {
  if (trustedResourceUrl instanceof goog.html.TrustedResourceUrl && trustedResourceUrl.constructor === goog.html.TrustedResourceUrl && trustedResourceUrl.TRUSTED_RESOURCE_URL_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ === goog.html.TrustedResourceUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
    return trustedResourceUrl.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue_;
  }
  goog.asserts.fail("expected object of type TrustedResourceUrl, got '" + trustedResourceUrl + "' of type " + goog.typeOf(trustedResourceUrl));
  return "type_error:TrustedResourceUrl";
};
goog.html.TrustedResourceUrl.unwrapTrustedURL = function(trustedResourceUrl) {
  return trustedResourceUrl.trustedURL_ ? trustedResourceUrl.trustedURL_ : goog.html.TrustedResourceUrl.unwrap(trustedResourceUrl);
};
goog.html.TrustedResourceUrl.format = function(format, args) {
  var formatStr = goog.string.Const.unwrap(format);
  if (!goog.html.TrustedResourceUrl.BASE_URL_.test(formatStr)) {
    throw Error("Invalid TrustedResourceUrl format: " + formatStr);
  }
  var result = formatStr.replace(goog.html.TrustedResourceUrl.FORMAT_MARKER_, function(match, id) {
    if (!Object.prototype.hasOwnProperty.call(args, id)) {
      throw Error('Found marker, "' + id + '", in format string, "' + formatStr + '", but no valid label mapping found in args: ' + JSON.stringify(args));
    }
    var arg = args[id];
    return arg instanceof goog.string.Const ? goog.string.Const.unwrap(arg) : encodeURIComponent(String(arg));
  });
  return goog.html.TrustedResourceUrl.createTrustedResourceUrlSecurityPrivateDoNotAccessOrElse(result);
};
goog.html.TrustedResourceUrl.FORMAT_MARKER_ = /%{(\w+)}/g;
goog.html.TrustedResourceUrl.BASE_URL_ = /^((https:)?\/\/[0-9a-z.:[\]-]+\/|\/[^/\\]|[^:/\\%]+\/|[^:/\\%]*[?#]|about:blank#)/i;
goog.html.TrustedResourceUrl.URL_PARAM_PARSER_ = /^([^?#]*)(\?[^#]*)?(#[\s\S]*)?/;
goog.html.TrustedResourceUrl.formatWithParams = function(format, args, searchParams, opt_hashParams) {
  return goog.html.TrustedResourceUrl.format(format, args).cloneWithParams(searchParams, opt_hashParams);
};
goog.html.TrustedResourceUrl.fromConstant = function(url) {
  return goog.html.TrustedResourceUrl.createTrustedResourceUrlSecurityPrivateDoNotAccessOrElse(goog.string.Const.unwrap(url));
};
goog.html.TrustedResourceUrl.fromConstants = function(parts) {
  for (var unwrapped = "", i = 0; i < parts.length; i++) {
    unwrapped += goog.string.Const.unwrap(parts[i]);
  }
  return goog.html.TrustedResourceUrl.createTrustedResourceUrlSecurityPrivateDoNotAccessOrElse(unwrapped);
};
goog.html.TrustedResourceUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};
goog.html.TrustedResourceUrl.createTrustedResourceUrlSecurityPrivateDoNotAccessOrElse = function(url) {
  var trustedResourceUrl = new goog.html.TrustedResourceUrl;
  trustedResourceUrl.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue_ = goog.html.trustedtypes.PRIVATE_DO_NOT_ACCESS_OR_ELSE_POLICY ? goog.html.trustedtypes.PRIVATE_DO_NOT_ACCESS_OR_ELSE_POLICY.createScriptURL(url) : url;
  goog.html.trustedtypes.PRIVATE_DO_NOT_ACCESS_OR_ELSE_POLICY && (trustedResourceUrl.trustedURL_ = goog.html.trustedtypes.PRIVATE_DO_NOT_ACCESS_OR_ELSE_POLICY.createURL(url));
  return trustedResourceUrl;
};
goog.html.TrustedResourceUrl.stringifyParams_ = function(prefix, currentString, params) {
  if (null == params) {
    return currentString;
  }
  if (goog.isString(params)) {
    return params ? prefix + encodeURIComponent(params) : "";
  }
  for (var key in params) {
    for (var value = params[key], outputValues = goog.isArray(value) ? value : [value], i = 0; i < outputValues.length; i++) {
      var outputValue = outputValues[i];
      null != outputValue && (currentString || (currentString = prefix), currentString += (currentString.length > prefix.length ? "&" : "") + encodeURIComponent(key) + "=" + encodeURIComponent(String(outputValue)));
    }
  }
  return currentString;
};
goog.html.SafeUrl = function() {
  this.privateDoNotAccessOrElseSafeUrlWrappedValue_ = "";
  this.SAFE_URL_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = goog.html.SafeUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
};
goog.html.SafeUrl.INNOCUOUS_STRING = "about:invalid#zClosurez";
goog.html.SafeUrl.prototype.implementsGoogStringTypedString = !0;
goog.html.SafeUrl.prototype.getTypedStringValue = function() {
  return this.privateDoNotAccessOrElseSafeUrlWrappedValue_.toString();
};
goog.html.SafeUrl.prototype.implementsGoogI18nBidiDirectionalString = !0;
goog.html.SafeUrl.prototype.getDirection = function() {
  return goog.i18n.bidi.Dir.LTR;
};
goog.DEBUG && (goog.html.SafeUrl.prototype.toString = function() {
  return "SafeUrl{" + this.privateDoNotAccessOrElseSafeUrlWrappedValue_ + "}";
});
goog.html.SafeUrl.unwrap = function(safeUrl) {
  return goog.html.SafeUrl.unwrapTrustedURL(safeUrl).toString();
};
goog.html.SafeUrl.unwrapTrustedURL = function(safeUrl) {
  if (safeUrl instanceof goog.html.SafeUrl && safeUrl.constructor === goog.html.SafeUrl && safeUrl.SAFE_URL_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ === goog.html.SafeUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
    return safeUrl.privateDoNotAccessOrElseSafeUrlWrappedValue_;
  }
  goog.asserts.fail("expected object of type SafeUrl, got '" + safeUrl + "' of type " + goog.typeOf(safeUrl));
  return "type_error:SafeUrl";
};
goog.html.SafeUrl.fromConstant = function(url) {
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(goog.string.Const.unwrap(url));
};
goog.html.SAFE_MIME_TYPE_PATTERN_ = /^(?:audio\/(?:3gpp2|3gpp|aac|L16|midi|mp3|mp4|mpeg|oga|ogg|opus|x-m4a|x-wav|wav|webm)|image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp|x-icon)|text\/csv|video\/(?:mpeg|mp4|ogg|webm|quicktime))$/i;
goog.html.SafeUrl.isSafeMimeType = function(mimeType) {
  return goog.html.SAFE_MIME_TYPE_PATTERN_.test(mimeType);
};
goog.html.SafeUrl.fromBlob = function(blob) {
  var url = goog.html.SAFE_MIME_TYPE_PATTERN_.test(blob.type) ? goog.fs.url.createObjectUrl(blob) : goog.html.SafeUrl.INNOCUOUS_STRING;
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(url);
};
goog.html.DATA_URL_PATTERN_ = /^data:([^;,]*);base64,[a-z0-9+\/]+=*$/i;
goog.html.SafeUrl.fromDataUrl = function(dataUrl) {
  var filteredDataUrl = dataUrl.replace(/(%0A|%0D)/g, ""), match = filteredDataUrl.match(goog.html.DATA_URL_PATTERN_), valid = match && goog.html.SAFE_MIME_TYPE_PATTERN_.test(match[1]);
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(valid ? filteredDataUrl : goog.html.SafeUrl.INNOCUOUS_STRING);
};
goog.html.SafeUrl.fromTelUrl = function(telUrl) {
  goog.string.internal.caseInsensitiveStartsWith(telUrl, "tel:") || (telUrl = goog.html.SafeUrl.INNOCUOUS_STRING);
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(telUrl);
};
goog.html.SIP_URL_PATTERN_ = /^sip[s]?:[+a-z0-9_.!$%&'*\/=^`{|}~-]+@([a-z0-9-]+\.)+[a-z0-9]{2,63}$/i;
goog.html.SafeUrl.fromSipUrl = function(sipUrl) {
  goog.html.SIP_URL_PATTERN_.test(decodeURIComponent(sipUrl)) || (sipUrl = goog.html.SafeUrl.INNOCUOUS_STRING);
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(sipUrl);
};
goog.html.SafeUrl.fromFacebookMessengerUrl = function(facebookMessengerUrl) {
  goog.string.internal.caseInsensitiveStartsWith(facebookMessengerUrl, "fb-messenger://share") || (facebookMessengerUrl = goog.html.SafeUrl.INNOCUOUS_STRING);
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(facebookMessengerUrl);
};
goog.html.SafeUrl.fromSmsUrl = function(smsUrl) {
  goog.string.internal.caseInsensitiveStartsWith(smsUrl, "sms:") && goog.html.SafeUrl.isSmsUrlBodyValid_(smsUrl) || (smsUrl = goog.html.SafeUrl.INNOCUOUS_STRING);
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(smsUrl);
};
goog.html.SafeUrl.isSmsUrlBodyValid_ = function(smsUrl) {
  var hash = smsUrl.indexOf("#");
  0 < hash && (smsUrl = smsUrl.substring(0, hash));
  var bodyParams = smsUrl.match(/[?&]body=/gi);
  if (!bodyParams) {
    return !0;
  }
  if (1 < bodyParams.length) {
    return !1;
  }
  var bodyValue = smsUrl.match(/[?&]body=([^&]*)/)[1];
  if (!bodyValue) {
    return !0;
  }
  try {
    decodeURIComponent(bodyValue);
  } catch (error) {
    return !1;
  }
  return /^(?:[a-z0-9\-_.~]|%[0-9a-f]{2})+$/i.test(bodyValue);
};
goog.html.SafeUrl.fromSshUrl = function(sshUrl) {
  goog.string.internal.caseInsensitiveStartsWith(sshUrl, "ssh://") || (sshUrl = goog.html.SafeUrl.INNOCUOUS_STRING);
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(sshUrl);
};
goog.html.SafeUrl.sanitizeChromeExtensionUrl = function(url, extensionId) {
  return goog.html.SafeUrl.sanitizeExtensionUrl_(/^chrome-extension:\/\/([^\/]+)\//, url, extensionId);
};
goog.html.SafeUrl.sanitizeFirefoxExtensionUrl = function(url, extensionId) {
  return goog.html.SafeUrl.sanitizeExtensionUrl_(/^moz-extension:\/\/([^\/]+)\//, url, extensionId);
};
goog.html.SafeUrl.sanitizeEdgeExtensionUrl = function(url, extensionId) {
  return goog.html.SafeUrl.sanitizeExtensionUrl_(/^ms-browser-extension:\/\/([^\/]+)\//, url, extensionId);
};
goog.html.SafeUrl.sanitizeExtensionUrl_ = function(scheme, url, extensionId) {
  var matches = scheme.exec(url);
  if (matches) {
    var extractedExtensionId = matches[1];
    -1 == (extensionId instanceof goog.string.Const ? [goog.string.Const.unwrap(extensionId)] : extensionId.map(function(x) {
      return goog.string.Const.unwrap(x);
    })).indexOf(extractedExtensionId) && (url = goog.html.SafeUrl.INNOCUOUS_STRING);
  } else {
    url = goog.html.SafeUrl.INNOCUOUS_STRING;
  }
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(url);
};
goog.html.SafeUrl.fromTrustedResourceUrl = function(trustedResourceUrl) {
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(goog.html.TrustedResourceUrl.unwrap(trustedResourceUrl));
};
goog.html.SAFE_URL_PATTERN_ = /^(?:(?:https?|mailto|ftp):|[^:/?#]*(?:[/?#]|$))/i;
goog.html.SafeUrl.SAFE_URL_PATTERN = goog.html.SAFE_URL_PATTERN_;
goog.html.SafeUrl.sanitize = function(url) {
  if (url instanceof goog.html.SafeUrl) {
    return url;
  }
  url = "object" == typeof url && url.implementsGoogStringTypedString ? url.getTypedStringValue() : String(url);
  goog.html.SAFE_URL_PATTERN_.test(url) || (url = goog.html.SafeUrl.INNOCUOUS_STRING);
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(url);
};
goog.html.SafeUrl.sanitizeAssertUnchanged = function(url, opt_allowDataUrl) {
  if (url instanceof goog.html.SafeUrl) {
    return url;
  }
  url = "object" == typeof url && url.implementsGoogStringTypedString ? url.getTypedStringValue() : String(url);
  if (opt_allowDataUrl && /^data:/i.test(url)) {
    var safeUrl = goog.html.SafeUrl.fromDataUrl(url);
    if (safeUrl.getTypedStringValue() == url) {
      return safeUrl;
    }
  }
  goog.asserts.assert(goog.html.SAFE_URL_PATTERN_.test(url), "%s does not match the safe URL pattern", url) || (url = goog.html.SafeUrl.INNOCUOUS_STRING);
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(url);
};
goog.html.SafeUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};
goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse = function(url) {
  var safeUrl = new goog.html.SafeUrl;
  safeUrl.privateDoNotAccessOrElseSafeUrlWrappedValue_ = goog.html.trustedtypes.PRIVATE_DO_NOT_ACCESS_OR_ELSE_POLICY ? goog.html.trustedtypes.PRIVATE_DO_NOT_ACCESS_OR_ELSE_POLICY.createURL(url) : url;
  return safeUrl;
};
goog.html.SafeUrl.ABOUT_BLANK = goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse("about:blank");
goog.html.SafeStyle = function() {
  this.privateDoNotAccessOrElseSafeStyleWrappedValue_ = "";
  this.SAFE_STYLE_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = goog.html.SafeStyle.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
};
goog.html.SafeStyle.prototype.implementsGoogStringTypedString = !0;
goog.html.SafeStyle.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};
goog.html.SafeStyle.fromConstant = function(style) {
  var styleString = goog.string.Const.unwrap(style);
  if (0 === styleString.length) {
    return goog.html.SafeStyle.EMPTY;
  }
  goog.asserts.assert(goog.string.internal.endsWith(styleString, ";"), "Last character of style string is not ';': " + styleString);
  goog.asserts.assert(goog.string.internal.contains(styleString, ":"), "Style string must contain at least one ':', to specify a \"name: value\" pair: " + styleString);
  return goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse(styleString);
};
goog.html.SafeStyle.prototype.getTypedStringValue = function() {
  return this.privateDoNotAccessOrElseSafeStyleWrappedValue_;
};
goog.DEBUG && (goog.html.SafeStyle.prototype.toString = function() {
  return "SafeStyle{" + this.privateDoNotAccessOrElseSafeStyleWrappedValue_ + "}";
});
goog.html.SafeStyle.unwrap = function(safeStyle) {
  if (safeStyle instanceof goog.html.SafeStyle && safeStyle.constructor === goog.html.SafeStyle && safeStyle.SAFE_STYLE_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ === goog.html.SafeStyle.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
    return safeStyle.privateDoNotAccessOrElseSafeStyleWrappedValue_;
  }
  goog.asserts.fail("expected object of type SafeStyle, got '" + safeStyle + "' of type " + goog.typeOf(safeStyle));
  return "type_error:SafeStyle";
};
goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse = function(style) {
  return (new goog.html.SafeStyle).initSecurityPrivateDoNotAccessOrElse_(style);
};
goog.html.SafeStyle.prototype.initSecurityPrivateDoNotAccessOrElse_ = function(style) {
  this.privateDoNotAccessOrElseSafeStyleWrappedValue_ = style;
  return this;
};
goog.html.SafeStyle.EMPTY = goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse("");
goog.html.SafeStyle.INNOCUOUS_STRING = "zClosurez";
goog.html.SafeStyle.create = function(map) {
  var style = "", name;
  for (name in map) {
    if (!/^[-_a-zA-Z0-9]+$/.test(name)) {
      throw Error("Name allows only [-_a-zA-Z0-9], got: " + name);
    }
    var value = map[name];
    null != value && (value = goog.isArray(value) ? goog.array.map(value, goog.html.SafeStyle.sanitizePropertyValue_).join(" ") : goog.html.SafeStyle.sanitizePropertyValue_(value), style += name + ":" + value + ";");
  }
  return style ? goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse(style) : goog.html.SafeStyle.EMPTY;
};
goog.html.SafeStyle.sanitizePropertyValue_ = function(value) {
  if (value instanceof goog.html.SafeUrl) {
    return 'url("' + goog.html.SafeUrl.unwrap(value).replace(/</g, "%3c").replace(/[\\"]/g, "\\$&") + '")';
  }
  var result = value instanceof goog.string.Const ? goog.string.Const.unwrap(value) : goog.html.SafeStyle.sanitizePropertyValueString_(String(value));
  if (/[{;}]/.test(result)) {
    throw new goog.asserts.AssertionError("Value does not allow [{;}], got: %s.", [result]);
  }
  return result;
};
goog.html.SafeStyle.sanitizePropertyValueString_ = function(value) {
  var valueWithoutFunctions = value.replace(goog.html.SafeStyle.FUNCTIONS_RE_, "$1").replace(goog.html.SafeStyle.FUNCTIONS_RE_, "$1").replace(goog.html.SafeStyle.URL_RE_, "url");
  if (goog.html.SafeStyle.VALUE_RE_.test(valueWithoutFunctions)) {
    if (goog.html.SafeStyle.COMMENT_RE_.test(value)) {
      return goog.asserts.fail("String value disallows comments, got: " + value), goog.html.SafeStyle.INNOCUOUS_STRING;
    }
    if (!goog.html.SafeStyle.hasBalancedQuotes_(value)) {
      return goog.asserts.fail("String value requires balanced quotes, got: " + value), goog.html.SafeStyle.INNOCUOUS_STRING;
    }
    if (!goog.html.SafeStyle.hasBalancedSquareBrackets_(value)) {
      return goog.asserts.fail("String value requires balanced square brackets and one identifier per pair of brackets, got: " + value), goog.html.SafeStyle.INNOCUOUS_STRING;
    }
  } else {
    return goog.asserts.fail("String value allows only " + goog.html.SafeStyle.VALUE_ALLOWED_CHARS_ + " and simple functions, got: " + value), goog.html.SafeStyle.INNOCUOUS_STRING;
  }
  return goog.html.SafeStyle.sanitizeUrl_(value);
};
goog.html.SafeStyle.hasBalancedQuotes_ = function(value) {
  for (var outsideSingle = !0, outsideDouble = !0, i = 0; i < value.length; i++) {
    var c = value.charAt(i);
    "'" == c && outsideDouble ? outsideSingle = !outsideSingle : '"' == c && outsideSingle && (outsideDouble = !outsideDouble);
  }
  return outsideSingle && outsideDouble;
};
goog.html.SafeStyle.hasBalancedSquareBrackets_ = function(value) {
  for (var outside = !0, tokenRe = /^[-_a-zA-Z0-9]$/, i = 0; i < value.length; i++) {
    var c = value.charAt(i);
    if ("]" == c) {
      if (outside) {
        return !1;
      }
      outside = !0;
    } else {
      if ("[" == c) {
        if (!outside) {
          return !1;
        }
        outside = !1;
      } else {
        if (!outside && !tokenRe.test(c)) {
          return !1;
        }
      }
    }
  }
  return outside;
};
goog.html.SafeStyle.VALUE_ALLOWED_CHARS_ = "[-,.\"'%_!# a-zA-Z0-9\\[\\]]";
goog.html.SafeStyle.VALUE_RE_ = new RegExp("^" + goog.html.SafeStyle.VALUE_ALLOWED_CHARS_ + "+$");
goog.html.SafeStyle.URL_RE_ = /\b(url\([ \t\n]*)('[ -&(-\[\]-~]*'|"[ !#-\[\]-~]*"|[!#-&*-\[\]-~]*)([ \t\n]*\))/g;
goog.html.SafeStyle.FUNCTIONS_RE_ = /\b(hsl|hsla|rgb|rgba|matrix|calc|minmax|fit-content|repeat|(rotate|scale|translate)(X|Y|Z|3d)?)\([-+*/0-9a-z.%\[\], ]+\)/g;
goog.html.SafeStyle.COMMENT_RE_ = /\/\*/;
goog.html.SafeStyle.sanitizeUrl_ = function(value) {
  return value.replace(goog.html.SafeStyle.URL_RE_, function(match$jscomp$0, before, url, after) {
    var quote = "";
    url = url.replace(/^(['"])(.*)\1$/, function(match, start, inside) {
      quote = start;
      return inside;
    });
    var sanitized = goog.html.SafeUrl.sanitize(url).getTypedStringValue();
    return before + quote + sanitized + quote + after;
  });
};
goog.html.SafeStyle.concat = function(var_args) {
  var style = "", addArgument = function(argument) {
    goog.isArray(argument) ? goog.array.forEach(argument, addArgument) : style += goog.html.SafeStyle.unwrap(argument);
  };
  goog.array.forEach(arguments, addArgument);
  return style ? goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse(style) : goog.html.SafeStyle.EMPTY;
};
goog.html.SafeStyleSheet = function() {
  this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_ = "";
  this.SAFE_STYLE_SHEET_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = goog.html.SafeStyleSheet.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
};
goog.html.SafeStyleSheet.prototype.implementsGoogStringTypedString = !0;
goog.html.SafeStyleSheet.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};
goog.html.SafeStyleSheet.createRule = function(selector, style) {
  if (goog.string.internal.contains(selector, "<")) {
    throw Error("Selector does not allow '<', got: " + selector);
  }
  var selectorToCheck = selector.replace(/('|")((?!\1)[^\r\n\f\\]|\\[\s\S])*\1/g, "");
  if (!/^[-_a-zA-Z0-9#.:* ,>+~[\]()=^$|]+$/.test(selectorToCheck)) {
    throw Error("Selector allows only [-_a-zA-Z0-9#.:* ,>+~[\\]()=^$|] and strings, got: " + selector);
  }
  if (!goog.html.SafeStyleSheet.hasBalancedBrackets_(selectorToCheck)) {
    throw Error("() and [] in selector must be balanced, got: " + selector);
  }
  style instanceof goog.html.SafeStyle || (style = goog.html.SafeStyle.create(style));
  var styleSheet = selector + "{" + goog.html.SafeStyle.unwrap(style).replace(/</g, "\\3C ") + "}";
  return goog.html.SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(styleSheet);
};
goog.html.SafeStyleSheet.hasBalancedBrackets_ = function(s) {
  for (var brackets = {"(":")", "[":"]"}, expectedBrackets = [], i = 0; i < s.length; i++) {
    var ch = s[i];
    if (brackets[ch]) {
      expectedBrackets.push(brackets[ch]);
    } else {
      if (goog.object.contains(brackets, ch) && expectedBrackets.pop() != ch) {
        return !1;
      }
    }
  }
  return 0 == expectedBrackets.length;
};
goog.html.SafeStyleSheet.concat = function(var_args) {
  var result = "", addArgument = function(argument) {
    goog.isArray(argument) ? goog.array.forEach(argument, addArgument) : result += goog.html.SafeStyleSheet.unwrap(argument);
  };
  goog.array.forEach(arguments, addArgument);
  return goog.html.SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(result);
};
goog.html.SafeStyleSheet.fromConstant = function(styleSheet) {
  var styleSheetString = goog.string.Const.unwrap(styleSheet);
  if (0 === styleSheetString.length) {
    return goog.html.SafeStyleSheet.EMPTY;
  }
  goog.asserts.assert(!goog.string.internal.contains(styleSheetString, "<"), "Forbidden '<' character in style sheet string: " + styleSheetString);
  return goog.html.SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(styleSheetString);
};
goog.html.SafeStyleSheet.prototype.getTypedStringValue = function() {
  return this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_;
};
goog.DEBUG && (goog.html.SafeStyleSheet.prototype.toString = function() {
  return "SafeStyleSheet{" + this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_ + "}";
});
goog.html.SafeStyleSheet.unwrap = function(safeStyleSheet) {
  if (safeStyleSheet instanceof goog.html.SafeStyleSheet && safeStyleSheet.constructor === goog.html.SafeStyleSheet && safeStyleSheet.SAFE_STYLE_SHEET_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ === goog.html.SafeStyleSheet.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
    return safeStyleSheet.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_;
  }
  goog.asserts.fail("expected object of type SafeStyleSheet, got '" + safeStyleSheet + "' of type " + goog.typeOf(safeStyleSheet));
  return "type_error:SafeStyleSheet";
};
goog.html.SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse = function(styleSheet) {
  return (new goog.html.SafeStyleSheet).initSecurityPrivateDoNotAccessOrElse_(styleSheet);
};
goog.html.SafeStyleSheet.prototype.initSecurityPrivateDoNotAccessOrElse_ = function(styleSheet) {
  this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_ = styleSheet;
  return this;
};
goog.html.SafeStyleSheet.EMPTY = goog.html.SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse("");
goog.html.SafeHtml = function() {
  this.privateDoNotAccessOrElseSafeHtmlWrappedValue_ = "";
  this.SAFE_HTML_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = goog.html.SafeHtml.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
  this.dir_ = null;
};
goog.html.SafeHtml.prototype.implementsGoogI18nBidiDirectionalString = !0;
goog.html.SafeHtml.prototype.getDirection = function() {
  return this.dir_;
};
goog.html.SafeHtml.prototype.implementsGoogStringTypedString = !0;
goog.html.SafeHtml.prototype.getTypedStringValue = function() {
  return this.privateDoNotAccessOrElseSafeHtmlWrappedValue_.toString();
};
goog.DEBUG && (goog.html.SafeHtml.prototype.toString = function() {
  return "SafeHtml{" + this.privateDoNotAccessOrElseSafeHtmlWrappedValue_ + "}";
});
goog.html.SafeHtml.unwrap = function(safeHtml) {
  return goog.html.SafeHtml.unwrapTrustedHTML(safeHtml).toString();
};
goog.html.SafeHtml.unwrapTrustedHTML = function(safeHtml) {
  if (safeHtml instanceof goog.html.SafeHtml && safeHtml.constructor === goog.html.SafeHtml && safeHtml.SAFE_HTML_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ === goog.html.SafeHtml.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
    return safeHtml.privateDoNotAccessOrElseSafeHtmlWrappedValue_;
  }
  goog.asserts.fail("expected object of type SafeHtml, got '" + safeHtml + "' of type " + goog.typeOf(safeHtml));
  return "type_error:SafeHtml";
};
goog.html.SafeHtml.htmlEscape = function(textOrHtml) {
  if (textOrHtml instanceof goog.html.SafeHtml) {
    return textOrHtml;
  }
  var textIsObject = "object" == typeof textOrHtml, dir = null;
  textIsObject && textOrHtml.implementsGoogI18nBidiDirectionalString && (dir = textOrHtml.getDirection());
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(goog.string.internal.htmlEscape(textIsObject && textOrHtml.implementsGoogStringTypedString ? textOrHtml.getTypedStringValue() : String(textOrHtml)), dir);
};
goog.html.SafeHtml.htmlEscapePreservingNewlines = function(textOrHtml) {
  if (textOrHtml instanceof goog.html.SafeHtml) {
    return textOrHtml;
  }
  var html = goog.html.SafeHtml.htmlEscape(textOrHtml);
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(goog.string.internal.newLineToBr(goog.html.SafeHtml.unwrap(html)), html.getDirection());
};
goog.html.SafeHtml.htmlEscapePreservingNewlinesAndSpaces = function(textOrHtml) {
  if (textOrHtml instanceof goog.html.SafeHtml) {
    return textOrHtml;
  }
  var html = goog.html.SafeHtml.htmlEscape(textOrHtml);
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(goog.string.internal.whitespaceEscape(goog.html.SafeHtml.unwrap(html)), html.getDirection());
};
goog.html.SafeHtml.from = goog.html.SafeHtml.htmlEscape;
goog.html.SafeHtml.VALID_NAMES_IN_TAG_ = /^[a-zA-Z0-9-]+$/;
goog.html.SafeHtml.URL_ATTRIBUTES_ = {action:!0, cite:!0, data:!0, formaction:!0, href:!0, manifest:!0, poster:!0, src:!0};
goog.html.SafeHtml.NOT_ALLOWED_TAG_NAMES_ = {APPLET:!0, BASE:!0, EMBED:!0, IFRAME:!0, LINK:!0, MATH:!0, META:!0, OBJECT:!0, SCRIPT:!0, STYLE:!0, SVG:!0, TEMPLATE:!0};
goog.html.SafeHtml.create = function(tagName, opt_attributes, opt_content) {
  goog.html.SafeHtml.verifyTagName(String(tagName));
  return goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse(String(tagName), opt_attributes, opt_content);
};
goog.html.SafeHtml.verifyTagName = function(tagName) {
  if (!goog.html.SafeHtml.VALID_NAMES_IN_TAG_.test(tagName)) {
    throw Error("Invalid tag name <" + tagName + ">.");
  }
  if (tagName.toUpperCase() in goog.html.SafeHtml.NOT_ALLOWED_TAG_NAMES_) {
    throw Error("Tag name <" + tagName + "> is not allowed for SafeHtml.");
  }
};
goog.html.SafeHtml.createIframe = function(opt_src, opt_srcdoc, opt_attributes, opt_content) {
  opt_src && goog.html.TrustedResourceUrl.unwrap(opt_src);
  var fixedAttributes = {};
  fixedAttributes.src = opt_src || null;
  fixedAttributes.srcdoc = opt_srcdoc && goog.html.SafeHtml.unwrap(opt_srcdoc);
  var attributes = goog.html.SafeHtml.combineAttributes(fixedAttributes, {sandbox:""}, opt_attributes);
  return goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse("iframe", attributes, opt_content);
};
goog.html.SafeHtml.createSandboxIframe = function(opt_src, opt_srcdoc, opt_attributes, opt_content) {
  if (!goog.html.SafeHtml.canUseSandboxIframe()) {
    throw Error("The browser does not support sandboxed iframes.");
  }
  var fixedAttributes = {};
  fixedAttributes.src = opt_src ? goog.html.SafeUrl.unwrap(goog.html.SafeUrl.sanitize(opt_src)) : null;
  fixedAttributes.srcdoc = opt_srcdoc || null;
  fixedAttributes.sandbox = "";
  var attributes = goog.html.SafeHtml.combineAttributes(fixedAttributes, {}, opt_attributes);
  return goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse("iframe", attributes, opt_content);
};
goog.html.SafeHtml.canUseSandboxIframe = function() {
  return goog.global.HTMLIFrameElement && "sandbox" in goog.global.HTMLIFrameElement.prototype;
};
goog.html.SafeHtml.createScriptSrc = function(src, opt_attributes) {
  goog.html.TrustedResourceUrl.unwrap(src);
  var attributes = goog.html.SafeHtml.combineAttributes({src:src}, {}, opt_attributes);
  return goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse("script", attributes);
};
goog.html.SafeHtml.createScript = function(script, opt_attributes) {
  for (var attr in opt_attributes) {
    var attrLower = attr.toLowerCase();
    if ("language" == attrLower || "src" == attrLower || "text" == attrLower || "type" == attrLower) {
      throw Error('Cannot set "' + attrLower + '" attribute');
    }
  }
  var content = "";
  script = goog.array.concat(script);
  for (var i = 0; i < script.length; i++) {
    content += goog.html.SafeScript.unwrap(script[i]);
  }
  var htmlContent = goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(content, goog.i18n.bidi.Dir.NEUTRAL);
  return goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse("script", opt_attributes, htmlContent);
};
goog.html.SafeHtml.createStyle = function(styleSheet, opt_attributes) {
  var attributes = goog.html.SafeHtml.combineAttributes({type:"text/css"}, {}, opt_attributes), content = "";
  styleSheet = goog.array.concat(styleSheet);
  for (var i = 0; i < styleSheet.length; i++) {
    content += goog.html.SafeStyleSheet.unwrap(styleSheet[i]);
  }
  var htmlContent = goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(content, goog.i18n.bidi.Dir.NEUTRAL);
  return goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse("style", attributes, htmlContent);
};
goog.html.SafeHtml.createMetaRefresh = function(url, opt_secs) {
  var unwrappedUrl = goog.html.SafeUrl.unwrap(goog.html.SafeUrl.sanitize(url));
  (goog.labs.userAgent.browser.isIE() || goog.labs.userAgent.browser.isEdge()) && goog.string.internal.contains(unwrappedUrl, ";") && (unwrappedUrl = "'" + unwrappedUrl.replace(/'/g, "%27") + "'");
  return goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse("meta", {"http-equiv":"refresh", content:(opt_secs || 0) + "; url=" + unwrappedUrl});
};
goog.html.SafeHtml.getAttrNameAndValue_ = function(tagName, name, value) {
  if (value instanceof goog.string.Const) {
    value = goog.string.Const.unwrap(value);
  } else {
    if ("style" == name.toLowerCase()) {
      value = goog.html.SafeHtml.getStyleValue_(value);
    } else {
      if (/^on/i.test(name)) {
        throw Error('Attribute "' + name + '" requires goog.string.Const value, "' + value + '" given.');
      }
      if (name.toLowerCase() in goog.html.SafeHtml.URL_ATTRIBUTES_) {
        if (value instanceof goog.html.TrustedResourceUrl) {
          value = goog.html.TrustedResourceUrl.unwrap(value);
        } else {
          if (value instanceof goog.html.SafeUrl) {
            value = goog.html.SafeUrl.unwrap(value);
          } else {
            if (goog.isString(value)) {
              value = goog.html.SafeUrl.sanitize(value).getTypedStringValue();
            } else {
              throw Error('Attribute "' + name + '" on tag "' + tagName + '" requires goog.html.SafeUrl, goog.string.Const, or string, value "' + value + '" given.');
            }
          }
        }
      }
    }
  }
  value.implementsGoogStringTypedString && (value = value.getTypedStringValue());
  goog.asserts.assert(goog.isString(value) || goog.isNumber(value), "String or number value expected, got " + typeof value + " with value: " + value);
  return name + '="' + goog.string.internal.htmlEscape(String(value)) + '"';
};
goog.html.SafeHtml.getStyleValue_ = function(value) {
  if (!goog.isObject(value)) {
    throw Error('The "style" attribute requires goog.html.SafeStyle or map of style properties, ' + typeof value + " given: " + value);
  }
  value instanceof goog.html.SafeStyle || (value = goog.html.SafeStyle.create(value));
  return goog.html.SafeStyle.unwrap(value);
};
goog.html.SafeHtml.createWithDir = function(dir, tagName, opt_attributes, opt_content) {
  var html = goog.html.SafeHtml.create(tagName, opt_attributes, opt_content);
  html.dir_ = dir;
  return html;
};
goog.html.SafeHtml.join = function(separator, parts) {
  var separatorHtml = goog.html.SafeHtml.htmlEscape(separator), dir = separatorHtml.getDirection(), content = [], addArgument = function(argument) {
    if (goog.isArray(argument)) {
      goog.array.forEach(argument, addArgument);
    } else {
      var html = goog.html.SafeHtml.htmlEscape(argument);
      content.push(goog.html.SafeHtml.unwrap(html));
      var htmlDir = html.getDirection();
      dir == goog.i18n.bidi.Dir.NEUTRAL ? dir = htmlDir : htmlDir != goog.i18n.bidi.Dir.NEUTRAL && dir != htmlDir && (dir = null);
    }
  };
  goog.array.forEach(parts, addArgument);
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(content.join(goog.html.SafeHtml.unwrap(separatorHtml)), dir);
};
goog.html.SafeHtml.concat = function(var_args) {
  return goog.html.SafeHtml.join(goog.html.SafeHtml.EMPTY, Array.prototype.slice.call(arguments));
};
goog.html.SafeHtml.concatWithDir = function(dir, var_args) {
  var html = goog.html.SafeHtml.concat(goog.array.slice(arguments, 1));
  html.dir_ = dir;
  return html;
};
goog.html.SafeHtml.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};
goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse = function(html, dir) {
  return (new goog.html.SafeHtml).initSecurityPrivateDoNotAccessOrElse_(html, dir);
};
goog.html.SafeHtml.prototype.initSecurityPrivateDoNotAccessOrElse_ = function(html, dir) {
  this.privateDoNotAccessOrElseSafeHtmlWrappedValue_ = goog.html.trustedtypes.PRIVATE_DO_NOT_ACCESS_OR_ELSE_POLICY ? goog.html.trustedtypes.PRIVATE_DO_NOT_ACCESS_OR_ELSE_POLICY.createHTML(html) : html;
  this.dir_ = dir;
  return this;
};
goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse = function(tagName, opt_attributes, opt_content) {
  var dir = null;
  var result = "<" + tagName + goog.html.SafeHtml.stringifyAttributes(tagName, opt_attributes);
  var content = opt_content;
  goog.isDefAndNotNull(content) ? goog.isArray(content) || (content = [content]) : content = [];
  if (goog.dom.tags.isVoidTag(tagName.toLowerCase())) {
    goog.asserts.assert(!content.length, "Void tag <" + tagName + "> does not allow content."), result += ">";
  } else {
    var html = goog.html.SafeHtml.concat(content);
    result += ">" + goog.html.SafeHtml.unwrap(html) + "</" + tagName + ">";
    dir = html.getDirection();
  }
  var dirAttribute = opt_attributes && opt_attributes.dir;
  dirAttribute && (dir = /^(ltr|rtl|auto)$/i.test(dirAttribute) ? goog.i18n.bidi.Dir.NEUTRAL : null);
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(result, dir);
};
goog.html.SafeHtml.stringifyAttributes = function(tagName, opt_attributes) {
  var result = "";
  if (opt_attributes) {
    for (var name in opt_attributes) {
      if (!goog.html.SafeHtml.VALID_NAMES_IN_TAG_.test(name)) {
        throw Error('Invalid attribute name "' + name + '".');
      }
      var value = opt_attributes[name];
      goog.isDefAndNotNull(value) && (result += " " + goog.html.SafeHtml.getAttrNameAndValue_(tagName, name, value));
    }
  }
  return result;
};
goog.html.SafeHtml.combineAttributes = function(fixedAttributes, defaultAttributes, opt_attributes) {
  var combinedAttributes = {}, name;
  for (name in fixedAttributes) {
    goog.asserts.assert(name.toLowerCase() == name, "Must be lower case"), combinedAttributes[name] = fixedAttributes[name];
  }
  for (name in defaultAttributes) {
    goog.asserts.assert(name.toLowerCase() == name, "Must be lower case"), combinedAttributes[name] = defaultAttributes[name];
  }
  for (name in opt_attributes) {
    var nameLower = name.toLowerCase();
    if (nameLower in fixedAttributes) {
      throw Error('Cannot override "' + nameLower + '" attribute, got "' + name + '" with value "' + opt_attributes[name] + '"');
    }
    nameLower in defaultAttributes && delete combinedAttributes[nameLower];
    combinedAttributes[name] = opt_attributes[name];
  }
  return combinedAttributes;
};
goog.html.SafeHtml.DOCTYPE_HTML = goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse("<!DOCTYPE html>", goog.i18n.bidi.Dir.NEUTRAL);
goog.html.SafeHtml.EMPTY = goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse("", goog.i18n.bidi.Dir.NEUTRAL);
goog.html.SafeHtml.BR = goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse("<br>", goog.i18n.bidi.Dir.NEUTRAL);
goog.html.uncheckedconversions = {};
goog.html.uncheckedconversions.safeHtmlFromStringKnownToSatisfyTypeContract = function(justification, html, opt_dir) {
  goog.asserts.assertString(goog.string.Const.unwrap(justification), "must provide justification");
  goog.asserts.assert(!goog.string.internal.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)), "must provide non-empty justification");
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(html, opt_dir || null);
};
goog.html.uncheckedconversions.safeScriptFromStringKnownToSatisfyTypeContract = function(justification, script) {
  goog.asserts.assertString(goog.string.Const.unwrap(justification), "must provide justification");
  goog.asserts.assert(!goog.string.internal.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)), "must provide non-empty justification");
  return goog.html.SafeScript.createSafeScriptSecurityPrivateDoNotAccessOrElse(script);
};
goog.html.uncheckedconversions.safeStyleFromStringKnownToSatisfyTypeContract = function(justification, style) {
  goog.asserts.assertString(goog.string.Const.unwrap(justification), "must provide justification");
  goog.asserts.assert(!goog.string.internal.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)), "must provide non-empty justification");
  return goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse(style);
};
goog.html.uncheckedconversions.safeStyleSheetFromStringKnownToSatisfyTypeContract = function(justification, styleSheet) {
  goog.asserts.assertString(goog.string.Const.unwrap(justification), "must provide justification");
  goog.asserts.assert(!goog.string.internal.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)), "must provide non-empty justification");
  return goog.html.SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(styleSheet);
};
goog.html.uncheckedconversions.safeUrlFromStringKnownToSatisfyTypeContract = function(justification, url) {
  goog.asserts.assertString(goog.string.Const.unwrap(justification), "must provide justification");
  goog.asserts.assert(!goog.string.internal.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)), "must provide non-empty justification");
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(url);
};
goog.html.uncheckedconversions.trustedResourceUrlFromStringKnownToSatisfyTypeContract = function(justification, url) {
  goog.asserts.assertString(goog.string.Const.unwrap(justification), "must provide justification");
  goog.asserts.assert(!goog.string.internal.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)), "must provide non-empty justification");
  return goog.html.TrustedResourceUrl.createTrustedResourceUrlSecurityPrivateDoNotAccessOrElse(url);
};
goog.i18n.BidiFormatter = function(contextDir, opt_alwaysSpan) {
  this.contextDir_ = goog.i18n.bidi.toDir(contextDir, !0);
  this.alwaysSpan_ = !!opt_alwaysSpan;
};
goog.i18n.BidiFormatter.prototype.estimateDirection = goog.i18n.bidi.estimateDirection;
goog.i18n.BidiFormatter.prototype.areDirectionalitiesOpposite_ = function(dir1, dir2) {
  return 0 > Number(dir1) * Number(dir2);
};
goog.i18n.BidiFormatter.prototype.dirResetIfNeeded_ = function(str, dir, opt_isHtml, opt_dirReset) {
  return opt_dirReset && (this.areDirectionalitiesOpposite_(dir, this.contextDir_) || this.contextDir_ == goog.i18n.bidi.Dir.LTR && goog.i18n.bidi.endsWithRtl(str, opt_isHtml) || this.contextDir_ == goog.i18n.bidi.Dir.RTL && goog.i18n.bidi.endsWithLtr(str, opt_isHtml)) ? this.contextDir_ == goog.i18n.bidi.Dir.LTR ? goog.i18n.bidi.Format.LRM : goog.i18n.bidi.Format.RLM : "";
};
goog.i18n.BidiFormatter.prototype.knownDirAttr = function(dir) {
  return dir != this.contextDir_ ? dir == goog.i18n.bidi.Dir.RTL ? 'dir="rtl"' : dir == goog.i18n.bidi.Dir.LTR ? 'dir="ltr"' : "" : "";
};
goog.i18n.BidiFormatter.prototype.spanWrapSafeHtmlWithKnownDir = function(dir, html, opt_dirReset) {
  null == dir && (dir = this.estimateDirection(goog.html.SafeHtml.unwrap(html), !0));
  return this.spanWrapWithKnownDir_(dir, html, opt_dirReset);
};
goog.i18n.BidiFormatter.prototype.spanWrapWithKnownDir_ = function(dir, html, opt_dirReset) {
  opt_dirReset = opt_dirReset || void 0 == opt_dirReset;
  var dirCondition = dir != goog.i18n.bidi.Dir.NEUTRAL && dir != this.contextDir_;
  if (this.alwaysSpan_ || dirCondition) {
    var dirAttribute;
    dirCondition && (dirAttribute = dir == goog.i18n.bidi.Dir.RTL ? "rtl" : "ltr");
    var result = goog.html.SafeHtml.create("span", {dir:dirAttribute}, html);
  } else {
    result = html;
  }
  var str = goog.html.SafeHtml.unwrap(html);
  return result = goog.html.SafeHtml.concatWithDir(goog.i18n.bidi.Dir.NEUTRAL, result, this.dirResetIfNeeded_(str, dir, !0, opt_dirReset));
};
goog.i18n.BidiFormatter.prototype.unicodeWrapWithKnownDir = function(dir, str, opt_isHtml, opt_dirReset) {
  null == dir && (dir = this.estimateDirection(str, opt_isHtml));
  return this.unicodeWrapWithKnownDir_(dir, str, opt_isHtml, opt_dirReset);
};
goog.i18n.BidiFormatter.prototype.unicodeWrapWithKnownDir_ = function(dir, str, opt_isHtml, opt_dirReset) {
  opt_dirReset = opt_dirReset || void 0 == opt_dirReset;
  var result = [];
  dir != goog.i18n.bidi.Dir.NEUTRAL && dir != this.contextDir_ ? (result.push(dir == goog.i18n.bidi.Dir.RTL ? goog.i18n.bidi.Format.RLE : goog.i18n.bidi.Format.LRE), result.push(str), result.push(goog.i18n.bidi.Format.PDF)) : result.push(str);
  result.push(this.dirResetIfNeeded_(str, dir, opt_isHtml, opt_dirReset));
  return result.join("");
};
goog.i18n.BidiFormatter.prototype.markAfterKnownDir = function(dir, str, opt_isHtml) {
  null == dir && (dir = this.estimateDirection(str, opt_isHtml));
  return this.dirResetIfNeeded_(str, dir, opt_isHtml, !0);
};
goog.i18n.BidiFormatter.prototype.mark = function() {
  switch(this.contextDir_) {
    case goog.i18n.bidi.Dir.LTR:
      return goog.i18n.bidi.Format.LRM;
    case goog.i18n.bidi.Dir.RTL:
      return goog.i18n.bidi.Format.RLM;
    default:
      return "";
  }
};
goog.math = {};
goog.math.randomInt = function(a) {
  return Math.floor(Math.random() * a);
};
goog.math.uniformRandom = function(a, b) {
  return a + Math.random() * (b - a);
};
goog.math.clamp = function(value, min, max) {
  return Math.min(Math.max(value, min), max);
};
goog.math.modulo = function(a, b) {
  var r = a % b;
  return 0 > r * b ? r + b : r;
};
goog.math.lerp = function(a, b, x) {
  return a + x * (b - a);
};
goog.math.nearlyEquals = function(a, b, opt_tolerance) {
  return Math.abs(a - b) <= (opt_tolerance || 0.000001);
};
goog.math.standardAngle = function(angle) {
  return goog.math.modulo(angle, 360);
};
goog.math.standardAngleInRadians = function(angle) {
  return goog.math.modulo(angle, 2 * Math.PI);
};
goog.math.toRadians = function(angleDegrees) {
  return angleDegrees * Math.PI / 180;
};
goog.math.toDegrees = function(angleRadians) {
  return 180 * angleRadians / Math.PI;
};
goog.math.angleDx = function(degrees, radius) {
  return radius * Math.cos(goog.math.toRadians(degrees));
};
goog.math.angleDy = function(degrees, radius) {
  return radius * Math.sin(goog.math.toRadians(degrees));
};
goog.math.angle = function(x1, y1, x2, y2) {
  return goog.math.standardAngle(goog.math.toDegrees(Math.atan2(y2 - y1, x2 - x1)));
};
goog.math.angleDifference = function(startAngle, endAngle) {
  var d = goog.math.standardAngle(endAngle) - goog.math.standardAngle(startAngle);
  180 < d ? d -= 360 : -180 >= d && (d = 360 + d);
  return d;
};
goog.math.sign = function(x) {
  return 0 < x ? 1 : 0 > x ? -1 : x;
};
goog.math.longestCommonSubsequence = function(array1, array2, opt_compareFn, opt_collectorFn) {
  for (var compare = opt_compareFn || function(a, b) {
    return a == b;
  }, collect = opt_collectorFn || function(i1) {
    return array1[i1];
  }, length1 = array1.length, length2 = array2.length, arr = [], i = 0; i < length1 + 1; i++) {
    arr[i] = [], arr[i][0] = 0;
  }
  for (var j = 0; j < length2 + 1; j++) {
    arr[0][j] = 0;
  }
  for (i = 1; i <= length1; i++) {
    for (j = 1; j <= length2; j++) {
      compare(array1[i - 1], array2[j - 1]) ? arr[i][j] = arr[i - 1][j - 1] + 1 : arr[i][j] = Math.max(arr[i - 1][j], arr[i][j - 1]);
    }
  }
  var result = [];
  i = length1;
  for (j = length2; 0 < i && 0 < j;) {
    compare(array1[i - 1], array2[j - 1]) ? (result.unshift(collect(i - 1, j - 1)), i--, j--) : arr[i - 1][j] > arr[i][j - 1] ? i-- : j--;
  }
  return result;
};
goog.math.sum = function(var_args) {
  return goog.array.reduce(arguments, function(sum, value) {
    return sum + value;
  }, 0);
};
goog.math.average = function(var_args) {
  return goog.math.sum.apply(null, arguments) / arguments.length;
};
goog.math.sampleVariance = function(var_args) {
  var sampleSize = arguments.length;
  if (2 > sampleSize) {
    return 0;
  }
  var mean = goog.math.average.apply(null, arguments);
  return goog.math.sum.apply(null, goog.array.map(arguments, function(val) {
    return Math.pow(val - mean, 2);
  })) / (sampleSize - 1);
};
goog.math.standardDeviation = function(var_args) {
  return Math.sqrt(goog.math.sampleVariance.apply(null, arguments));
};
goog.math.isInt = function(num) {
  return isFinite(num) && 0 == num % 1;
};
goog.math.isFiniteNumber = function(num) {
  return isFinite(num);
};
goog.math.isNegativeZero = function(num) {
  return 0 == num && 0 > 1 / num;
};
goog.math.log10Floor = function(num) {
  if (0 < num) {
    var x = Math.round(Math.log(num) * Math.LOG10E);
    return x - (parseFloat("1e" + x) > num ? 1 : 0);
  }
  return 0 == num ? -Infinity : NaN;
};
goog.math.safeFloor = function(num, opt_epsilon) {
  goog.asserts.assert(!goog.isDef(opt_epsilon) || 0 < opt_epsilon);
  return Math.floor(num + (opt_epsilon || 2e-15));
};
goog.math.safeCeil = function(num, opt_epsilon) {
  goog.asserts.assert(!goog.isDef(opt_epsilon) || 0 < opt_epsilon);
  return Math.ceil(num - (opt_epsilon || 2e-15));
};
goog.iter = {};
goog.iter.StopIteration = "StopIteration" in goog.global ? goog.global.StopIteration : {message:"StopIteration", stack:""};
goog.iter.Iterator = function() {
};
goog.iter.Iterator.prototype.next = function() {
  throw goog.iter.StopIteration;
};
goog.iter.Iterator.prototype.__iterator__ = function() {
  return this;
};
goog.iter.toIterator = function(iterable) {
  if (iterable instanceof goog.iter.Iterator) {
    return iterable;
  }
  if ("function" == typeof iterable.__iterator__) {
    return iterable.__iterator__(!1);
  }
  if (goog.isArrayLike(iterable)) {
    var i = 0, newIter = new goog.iter.Iterator;
    newIter.next = function() {
      for (;;) {
        if (i >= iterable.length) {
          throw goog.iter.StopIteration;
        }
        if (i in iterable) {
          return iterable[i++];
        }
        i++;
      }
    };
    return newIter;
  }
  throw Error("Not implemented");
};
goog.iter.forEach = function(iterable, f, opt_obj) {
  if (goog.isArrayLike(iterable)) {
    try {
      goog.array.forEach(iterable, f, opt_obj);
    } catch (ex) {
      if (ex !== goog.iter.StopIteration) {
        throw ex;
      }
    }
  } else {
    iterable = goog.iter.toIterator(iterable);
    try {
      for (;;) {
        f.call(opt_obj, iterable.next(), void 0, iterable);
      }
    } catch (ex$5) {
      if (ex$5 !== goog.iter.StopIteration) {
        throw ex$5;
      }
    }
  }
};
goog.iter.filter = function(iterable, f, opt_obj) {
  var iterator = goog.iter.toIterator(iterable), newIter = new goog.iter.Iterator;
  newIter.next = function() {
    for (;;) {
      var val = iterator.next();
      if (f.call(opt_obj, val, void 0, iterator)) {
        return val;
      }
    }
  };
  return newIter;
};
goog.iter.filterFalse = function(iterable, f, opt_obj) {
  return goog.iter.filter(iterable, goog.functions.not(f), opt_obj);
};
goog.iter.range = function(startOrStop, opt_stop, opt_step) {
  var start = 0, stop = startOrStop, step = opt_step || 1;
  1 < arguments.length && (start = startOrStop, stop = +opt_stop);
  if (0 == step) {
    throw Error("Range step argument must not be zero");
  }
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    if (0 < step && start >= stop || 0 > step && start <= stop) {
      throw goog.iter.StopIteration;
    }
    var rv = start;
    start += step;
    return rv;
  };
  return newIter;
};
goog.iter.join = function(iterable, deliminator) {
  return goog.iter.toArray(iterable).join(deliminator);
};
goog.iter.map = function(iterable, f, opt_obj) {
  var iterator = goog.iter.toIterator(iterable), newIter = new goog.iter.Iterator;
  newIter.next = function() {
    var val = iterator.next();
    return f.call(opt_obj, val, void 0, iterator);
  };
  return newIter;
};
goog.iter.reduce = function(iterable, f, val$jscomp$0, opt_obj) {
  var rval = val$jscomp$0;
  goog.iter.forEach(iterable, function(val) {
    rval = f.call(opt_obj, rval, val);
  });
  return rval;
};
goog.iter.some = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  try {
    for (;;) {
      if (f.call(opt_obj, iterable.next(), void 0, iterable)) {
        return !0;
      }
    }
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) {
      throw ex;
    }
  }
  return !1;
};
goog.iter.every = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  try {
    for (;;) {
      if (!f.call(opt_obj, iterable.next(), void 0, iterable)) {
        return !1;
      }
    }
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) {
      throw ex;
    }
  }
  return !0;
};
goog.iter.chain = function(var_args) {
  return goog.iter.chainFromIterable(arguments);
};
goog.iter.chainFromIterable = function(iterable) {
  var iterator = goog.iter.toIterator(iterable), iter = new goog.iter.Iterator, current = null;
  iter.next = function() {
    for (;;) {
      if (null == current) {
        var it = iterator.next();
        current = goog.iter.toIterator(it);
      }
      try {
        return current.next();
      } catch (ex) {
        if (ex !== goog.iter.StopIteration) {
          throw ex;
        }
        current = null;
      }
    }
  };
  return iter;
};
goog.iter.dropWhile = function(iterable, f, opt_obj) {
  var iterator = goog.iter.toIterator(iterable), newIter = new goog.iter.Iterator, dropping = !0;
  newIter.next = function() {
    for (;;) {
      var val = iterator.next();
      if (!dropping || !f.call(opt_obj, val, void 0, iterator)) {
        return dropping = !1, val;
      }
    }
  };
  return newIter;
};
goog.iter.takeWhile = function(iterable, f, opt_obj) {
  var iterator = goog.iter.toIterator(iterable), iter = new goog.iter.Iterator;
  iter.next = function() {
    var val = iterator.next();
    if (f.call(opt_obj, val, void 0, iterator)) {
      return val;
    }
    throw goog.iter.StopIteration;
  };
  return iter;
};
goog.iter.toArray = function(iterable) {
  if (goog.isArrayLike(iterable)) {
    return goog.array.toArray(iterable);
  }
  iterable = goog.iter.toIterator(iterable);
  var array = [];
  goog.iter.forEach(iterable, function(val) {
    array.push(val);
  });
  return array;
};
goog.iter.equals = function(iterable1, iterable2, opt_equalsFn) {
  var pairs = goog.iter.zipLongest({}, iterable1, iterable2), equalsFn = opt_equalsFn || goog.array.defaultCompareEquality;
  return goog.iter.every(pairs, function(pair) {
    return equalsFn(pair[0], pair[1]);
  });
};
goog.iter.nextOrValue = function(iterable, defaultValue) {
  try {
    return goog.iter.toIterator(iterable).next();
  } catch (e) {
    if (e != goog.iter.StopIteration) {
      throw e;
    }
    return defaultValue;
  }
};
goog.iter.product = function(var_args) {
  if (goog.array.some(arguments, function(arr) {
    return !arr.length;
  }) || !arguments.length) {
    return new goog.iter.Iterator;
  }
  var iter = new goog.iter.Iterator, arrays = arguments, indicies = goog.array.repeat(0, arrays.length);
  iter.next = function() {
    if (indicies) {
      for (var retVal = goog.array.map(indicies, function(valueIndex, arrayIndex) {
        return arrays[arrayIndex][valueIndex];
      }), i = indicies.length - 1; 0 <= i; i--) {
        goog.asserts.assert(indicies);
        if (indicies[i] < arrays[i].length - 1) {
          indicies[i]++;
          break;
        }
        if (0 == i) {
          indicies = null;
          break;
        }
        indicies[i] = 0;
      }
      return retVal;
    }
    throw goog.iter.StopIteration;
  };
  return iter;
};
goog.iter.cycle = function(iterable) {
  var baseIterator = goog.iter.toIterator(iterable), cache = [], cacheIndex = 0, iter = new goog.iter.Iterator, useCache = !1;
  iter.next = function() {
    var returnElement = null;
    if (!useCache) {
      try {
        return returnElement = baseIterator.next(), cache.push(returnElement), returnElement;
      } catch (e) {
        if (e != goog.iter.StopIteration || goog.array.isEmpty(cache)) {
          throw e;
        }
        useCache = !0;
      }
    }
    returnElement = cache[cacheIndex];
    cacheIndex = (cacheIndex + 1) % cache.length;
    return returnElement;
  };
  return iter;
};
goog.iter.count = function(opt_start, opt_step) {
  var counter = opt_start || 0, step = goog.isDef(opt_step) ? opt_step : 1, iter = new goog.iter.Iterator;
  iter.next = function() {
    var returnValue = counter;
    counter += step;
    return returnValue;
  };
  return iter;
};
goog.iter.repeat = function(value) {
  var iter = new goog.iter.Iterator;
  iter.next = goog.functions.constant(value);
  return iter;
};
goog.iter.accumulate = function(iterable) {
  var iterator = goog.iter.toIterator(iterable), total = 0, iter = new goog.iter.Iterator;
  iter.next = function() {
    return total += iterator.next();
  };
  return iter;
};
goog.iter.zip = function(var_args) {
  var args = arguments, iter = new goog.iter.Iterator;
  if (0 < args.length) {
    var iterators = goog.array.map(args, goog.iter.toIterator);
    iter.next = function() {
      return goog.array.map(iterators, function(it) {
        return it.next();
      });
    };
  }
  return iter;
};
goog.iter.zipLongest = function(fillValue, var_args) {
  var args = goog.array.slice(arguments, 1), iter = new goog.iter.Iterator;
  if (0 < args.length) {
    var iterators = goog.array.map(args, goog.iter.toIterator);
    iter.next = function() {
      var iteratorsHaveValues = !1, arr = goog.array.map(iterators, function(it) {
        try {
          var returnValue = it.next();
          iteratorsHaveValues = !0;
        } catch (ex) {
          if (ex !== goog.iter.StopIteration) {
            throw ex;
          }
          returnValue = fillValue;
        }
        return returnValue;
      });
      if (!iteratorsHaveValues) {
        throw goog.iter.StopIteration;
      }
      return arr;
    };
  }
  return iter;
};
goog.iter.compress = function(iterable, selectors) {
  var selectorIterator = goog.iter.toIterator(selectors);
  return goog.iter.filter(iterable, function() {
    return !!selectorIterator.next();
  });
};
goog.iter.GroupByIterator_ = function(iterable, opt_keyFunc) {
  this.iterator = goog.iter.toIterator(iterable);
  this.keyFunc = opt_keyFunc || goog.functions.identity;
};
goog.inherits(goog.iter.GroupByIterator_, goog.iter.Iterator);
goog.iter.GroupByIterator_.prototype.next = function() {
  for (; this.currentKey == this.targetKey;) {
    this.currentValue = this.iterator.next(), this.currentKey = this.keyFunc(this.currentValue);
  }
  this.targetKey = this.currentKey;
  return [this.currentKey, this.groupItems_(this.targetKey)];
};
goog.iter.GroupByIterator_.prototype.groupItems_ = function(targetKey) {
  for (var arr = []; this.currentKey == targetKey;) {
    arr.push(this.currentValue);
    try {
      this.currentValue = this.iterator.next();
    } catch (ex) {
      if (ex !== goog.iter.StopIteration) {
        throw ex;
      }
      break;
    }
    this.currentKey = this.keyFunc(this.currentValue);
  }
  return arr;
};
goog.iter.groupBy = function(iterable, opt_keyFunc) {
  return new goog.iter.GroupByIterator_(iterable, opt_keyFunc);
};
goog.iter.starMap = function(iterable, f, opt_obj) {
  var iterator = goog.iter.toIterator(iterable), iter = new goog.iter.Iterator;
  iter.next = function() {
    var args = goog.iter.toArray(iterator.next());
    return f.apply(opt_obj, goog.array.concat(args, void 0, iterator));
  };
  return iter;
};
goog.iter.tee = function(iterable, opt_num) {
  var iterator = goog.iter.toIterator(iterable), buffers = goog.array.map(goog.array.range(goog.isNumber(opt_num) ? opt_num : 2), function() {
    return [];
  }), addNextIteratorValueToBuffers = function() {
    var val = iterator.next();
    goog.array.forEach(buffers, function(buffer) {
      buffer.push(val);
    });
  };
  return goog.array.map(buffers, function(buffer) {
    var iter = new goog.iter.Iterator;
    iter.next = function() {
      goog.array.isEmpty(buffer) && addNextIteratorValueToBuffers();
      goog.asserts.assert(!goog.array.isEmpty(buffer));
      return buffer.shift();
    };
    return iter;
  });
};
goog.iter.enumerate = function(iterable, opt_start) {
  return goog.iter.zip(goog.iter.count(opt_start), iterable);
};
goog.iter.limit = function(iterable, limitSize) {
  goog.asserts.assert(goog.math.isInt(limitSize) && 0 <= limitSize);
  var iterator = goog.iter.toIterator(iterable), iter = new goog.iter.Iterator, remaining = limitSize;
  iter.next = function() {
    if (0 < remaining--) {
      return iterator.next();
    }
    throw goog.iter.StopIteration;
  };
  return iter;
};
goog.iter.consume = function(iterable, count) {
  goog.asserts.assert(goog.math.isInt(count) && 0 <= count);
  for (var iterator = goog.iter.toIterator(iterable); 0 < count--;) {
    goog.iter.nextOrValue(iterator, null);
  }
  return iterator;
};
goog.iter.slice = function(iterable, start, opt_end) {
  goog.asserts.assert(goog.math.isInt(start) && 0 <= start);
  var iterator = goog.iter.consume(iterable, start);
  goog.isNumber(opt_end) && (goog.asserts.assert(goog.math.isInt(opt_end) && opt_end >= start), iterator = goog.iter.limit(iterator, opt_end - start));
  return iterator;
};
goog.iter.hasDuplicates_ = function(arr) {
  var deduped = [];
  goog.array.removeDuplicates(arr, deduped);
  return arr.length != deduped.length;
};
goog.iter.permutations = function(iterable, opt_length) {
  var elements = goog.iter.toArray(iterable), sets = goog.array.repeat(elements, goog.isNumber(opt_length) ? opt_length : elements.length), product = goog.iter.product.apply(void 0, sets);
  return goog.iter.filter(product, function(arr) {
    return !goog.iter.hasDuplicates_(arr);
  });
};
goog.iter.combinations = function(iterable, length) {
  function getIndexFromElements(index) {
    return elements[index];
  }
  var elements = goog.iter.toArray(iterable), indexes = goog.iter.range(elements.length), indexIterator = goog.iter.permutations(indexes, length), sortedIndexIterator = goog.iter.filter(indexIterator, function(arr) {
    return goog.array.isSorted(arr);
  }), iter = new goog.iter.Iterator;
  iter.next = function() {
    return goog.array.map(sortedIndexIterator.next(), getIndexFromElements);
  };
  return iter;
};
goog.iter.combinationsWithReplacement = function(iterable, length) {
  function getIndexFromElements(index) {
    return elements[index];
  }
  var elements = goog.iter.toArray(iterable), indexes = goog.array.range(elements.length), sets = goog.array.repeat(indexes, length), indexIterator = goog.iter.product.apply(void 0, sets), sortedIndexIterator = goog.iter.filter(indexIterator, function(arr) {
    return goog.array.isSorted(arr);
  }), iter = new goog.iter.Iterator;
  iter.next = function() {
    return goog.array.map(sortedIndexIterator.next(), getIndexFromElements);
  };
  return iter;
};
goog.structs.Map = function(opt_map, var_args) {
  this.map_ = {};
  this.keys_ = [];
  this.version_ = this.count_ = 0;
  var argLength = arguments.length;
  if (1 < argLength) {
    if (argLength % 2) {
      throw Error("Uneven number of arguments");
    }
    for (var i = 0; i < argLength; i += 2) {
      this.set(arguments[i], arguments[i + 1]);
    }
  } else {
    opt_map && this.addAll(opt_map);
  }
};
goog.structs.Map.prototype.getCount = function() {
  return this.count_;
};
goog.structs.Map.prototype.getValues = function() {
  this.cleanupKeysArray_();
  for (var rv = [], i = 0; i < this.keys_.length; i++) {
    rv.push(this.map_[this.keys_[i]]);
  }
  return rv;
};
goog.structs.Map.prototype.getKeys = function() {
  this.cleanupKeysArray_();
  return this.keys_.concat();
};
goog.structs.Map.prototype.containsKey = function(key) {
  return goog.structs.Map.hasKey_(this.map_, key);
};
goog.structs.Map.prototype.containsValue = function(val) {
  for (var i = 0; i < this.keys_.length; i++) {
    var key = this.keys_[i];
    if (goog.structs.Map.hasKey_(this.map_, key) && this.map_[key] == val) {
      return !0;
    }
  }
  return !1;
};
goog.structs.Map.prototype.equals = function(otherMap, opt_equalityFn) {
  if (this === otherMap) {
    return !0;
  }
  if (this.count_ != otherMap.getCount()) {
    return !1;
  }
  var equalityFn = opt_equalityFn || goog.structs.Map.defaultEquals;
  this.cleanupKeysArray_();
  for (var key, i = 0; key = this.keys_[i]; i++) {
    if (!equalityFn(this.get(key), otherMap.get(key))) {
      return !1;
    }
  }
  return !0;
};
goog.structs.Map.defaultEquals = function(a, b) {
  return a === b;
};
goog.structs.Map.prototype.isEmpty = function() {
  return 0 == this.count_;
};
goog.structs.Map.prototype.clear = function() {
  this.map_ = {};
  this.version_ = this.count_ = this.keys_.length = 0;
};
goog.structs.Map.prototype.remove = function(key) {
  return goog.structs.Map.hasKey_(this.map_, key) ? (delete this.map_[key], this.count_--, this.version_++, this.keys_.length > 2 * this.count_ && this.cleanupKeysArray_(), !0) : !1;
};
goog.structs.Map.prototype.cleanupKeysArray_ = function() {
  if (this.count_ != this.keys_.length) {
    for (var srcIndex = 0, destIndex = 0; srcIndex < this.keys_.length;) {
      var key = this.keys_[srcIndex];
      goog.structs.Map.hasKey_(this.map_, key) && (this.keys_[destIndex++] = key);
      srcIndex++;
    }
    this.keys_.length = destIndex;
  }
  if (this.count_ != this.keys_.length) {
    var seen = {};
    for (destIndex = srcIndex = 0; srcIndex < this.keys_.length;) {
      key = this.keys_[srcIndex], goog.structs.Map.hasKey_(seen, key) || (this.keys_[destIndex++] = key, seen[key] = 1), srcIndex++;
    }
    this.keys_.length = destIndex;
  }
};
goog.structs.Map.prototype.get = function(key, opt_val) {
  return goog.structs.Map.hasKey_(this.map_, key) ? this.map_[key] : opt_val;
};
goog.structs.Map.prototype.set = function(key, value) {
  goog.structs.Map.hasKey_(this.map_, key) || (this.count_++, this.keys_.push(key), this.version_++);
  this.map_[key] = value;
};
goog.structs.Map.prototype.addAll = function(map) {
  if (map instanceof goog.structs.Map) {
    for (var keys = map.getKeys(), i = 0; i < keys.length; i++) {
      this.set(keys[i], map.get(keys[i]));
    }
  } else {
    for (var key in map) {
      this.set(key, map[key]);
    }
  }
};
goog.structs.Map.prototype.forEach = function(f, opt_obj) {
  for (var keys = this.getKeys(), i = 0; i < keys.length; i++) {
    var key = keys[i], value = this.get(key);
    f.call(opt_obj, value, key, this);
  }
};
goog.structs.Map.prototype.clone = function() {
  return new goog.structs.Map(this);
};
goog.structs.Map.prototype.transpose = function() {
  for (var transposed = new goog.structs.Map, i = 0; i < this.keys_.length; i++) {
    var key = this.keys_[i];
    transposed.set(this.map_[key], key);
  }
  return transposed;
};
goog.structs.Map.prototype.toObject = function() {
  this.cleanupKeysArray_();
  for (var obj = {}, i = 0; i < this.keys_.length; i++) {
    var key = this.keys_[i];
    obj[key] = this.map_[key];
  }
  return obj;
};
goog.structs.Map.prototype.__iterator__ = function(opt_keys) {
  this.cleanupKeysArray_();
  var i = 0, version = this.version_, selfObj = this, newIter = new goog.iter.Iterator;
  newIter.next = function() {
    if (version != selfObj.version_) {
      throw Error("The map has changed since the iterator was created");
    }
    if (i >= selfObj.keys_.length) {
      throw goog.iter.StopIteration;
    }
    var key = selfObj.keys_[i++];
    return opt_keys ? key : selfObj.map_[key];
  };
  return newIter;
};
goog.structs.Map.hasKey_ = function(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
};
goog.structs.getCount = function(col) {
  return col.getCount && "function" == typeof col.getCount ? col.getCount() : goog.isArrayLike(col) || goog.isString(col) ? col.length : goog.object.getCount(col);
};
goog.structs.getValues = function(col) {
  if (col.getValues && "function" == typeof col.getValues) {
    return col.getValues();
  }
  if (goog.isString(col)) {
    return col.split("");
  }
  if (goog.isArrayLike(col)) {
    for (var rv = [], l = col.length, i = 0; i < l; i++) {
      rv.push(col[i]);
    }
    return rv;
  }
  return goog.object.getValues(col);
};
goog.structs.getKeys = function(col) {
  if (col.getKeys && "function" == typeof col.getKeys) {
    return col.getKeys();
  }
  if (!col.getValues || "function" != typeof col.getValues) {
    if (goog.isArrayLike(col) || goog.isString(col)) {
      for (var rv = [], l = col.length, i = 0; i < l; i++) {
        rv.push(i);
      }
      return rv;
    }
    return goog.object.getKeys(col);
  }
};
goog.structs.contains = function(col, val) {
  return col.contains && "function" == typeof col.contains ? col.contains(val) : col.containsValue && "function" == typeof col.containsValue ? col.containsValue(val) : goog.isArrayLike(col) || goog.isString(col) ? goog.array.contains(col, val) : goog.object.containsValue(col, val);
};
goog.structs.isEmpty = function(col) {
  return col.isEmpty && "function" == typeof col.isEmpty ? col.isEmpty() : goog.isArrayLike(col) || goog.isString(col) ? goog.array.isEmpty(col) : goog.object.isEmpty(col);
};
goog.structs.clear = function(col) {
  col.clear && "function" == typeof col.clear ? col.clear() : goog.isArrayLike(col) ? goog.array.clear(col) : goog.object.clear(col);
};
goog.structs.forEach = function(col, f, opt_obj) {
  if (col.forEach && "function" == typeof col.forEach) {
    col.forEach(f, opt_obj);
  } else {
    if (goog.isArrayLike(col) || goog.isString(col)) {
      goog.array.forEach(col, f, opt_obj);
    } else {
      for (var keys = goog.structs.getKeys(col), values = goog.structs.getValues(col), l = values.length, i = 0; i < l; i++) {
        f.call(opt_obj, values[i], keys && keys[i], col);
      }
    }
  }
};
goog.structs.filter = function(col, f, opt_obj) {
  if ("function" == typeof col.filter) {
    return col.filter(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.filter(col, f, opt_obj);
  }
  var keys = goog.structs.getKeys(col), values = goog.structs.getValues(col), l = values.length;
  if (keys) {
    var rv = {};
    for (var i = 0; i < l; i++) {
      f.call(opt_obj, values[i], keys[i], col) && (rv[keys[i]] = values[i]);
    }
  } else {
    for (rv = [], i = 0; i < l; i++) {
      f.call(opt_obj, values[i], void 0, col) && rv.push(values[i]);
    }
  }
  return rv;
};
goog.structs.map = function(col, f, opt_obj) {
  if ("function" == typeof col.map) {
    return col.map(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.map(col, f, opt_obj);
  }
  var keys = goog.structs.getKeys(col), values = goog.structs.getValues(col), l = values.length;
  if (keys) {
    var rv = {};
    for (var i = 0; i < l; i++) {
      rv[keys[i]] = f.call(opt_obj, values[i], keys[i], col);
    }
  } else {
    for (rv = [], i = 0; i < l; i++) {
      rv[i] = f.call(opt_obj, values[i], void 0, col);
    }
  }
  return rv;
};
goog.structs.some = function(col, f, opt_obj) {
  if ("function" == typeof col.some) {
    return col.some(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.some(col, f, opt_obj);
  }
  for (var keys = goog.structs.getKeys(col), values = goog.structs.getValues(col), l = values.length, i = 0; i < l; i++) {
    if (f.call(opt_obj, values[i], keys && keys[i], col)) {
      return !0;
    }
  }
  return !1;
};
goog.structs.every = function(col, f, opt_obj) {
  if ("function" == typeof col.every) {
    return col.every(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.every(col, f, opt_obj);
  }
  for (var keys = goog.structs.getKeys(col), values = goog.structs.getValues(col), l = values.length, i = 0; i < l; i++) {
    if (!f.call(opt_obj, values[i], keys && keys[i], col)) {
      return !1;
    }
  }
  return !0;
};
goog.uri = {};
goog.uri.utils = {};
goog.uri.utils.CharCode_ = {AMPERSAND:38, EQUAL:61, HASH:35, QUESTION:63};
goog.uri.utils.buildFromEncodedParts = function(opt_scheme, opt_userInfo, opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) {
  var out = "";
  opt_scheme && (out += opt_scheme + ":");
  opt_domain && (out += "//", opt_userInfo && (out += opt_userInfo + "@"), out += opt_domain, opt_port && (out += ":" + opt_port));
  opt_path && (out += opt_path);
  opt_queryData && (out += "?" + opt_queryData);
  opt_fragment && (out += "#" + opt_fragment);
  return out;
};
goog.uri.utils.splitRe_ = /^(?:([^:/?#.]+):)?(?:\/\/(?:([^/?#]*)@)?([^/#?]*?)(?::([0-9]+))?(?=[/#?]|$))?([^?#]+)?(?:\?([^#]*))?(?:#([\s\S]*))?$/;
goog.uri.utils.ComponentIndex = {SCHEME:1, USER_INFO:2, DOMAIN:3, PORT:4, PATH:5, QUERY_DATA:6, FRAGMENT:7};
goog.uri.utils.split = function(uri) {
  return uri.match(goog.uri.utils.splitRe_);
};
goog.uri.utils.decodeIfPossible_ = function(uri, opt_preserveReserved) {
  return uri ? opt_preserveReserved ? decodeURI(uri) : decodeURIComponent(uri) : uri;
};
goog.uri.utils.getComponentByIndex_ = function(componentIndex, uri) {
  return goog.uri.utils.split(uri)[componentIndex] || null;
};
goog.uri.utils.getScheme = function(uri) {
  return goog.uri.utils.getComponentByIndex_(goog.uri.utils.ComponentIndex.SCHEME, uri);
};
goog.uri.utils.getEffectiveScheme = function(uri) {
  var scheme = goog.uri.utils.getScheme(uri);
  if (!scheme && goog.global.self && goog.global.self.location) {
    var protocol = goog.global.self.location.protocol;
    scheme = protocol.substr(0, protocol.length - 1);
  }
  return scheme ? scheme.toLowerCase() : "";
};
goog.uri.utils.getUserInfoEncoded = function(uri) {
  return goog.uri.utils.getComponentByIndex_(goog.uri.utils.ComponentIndex.USER_INFO, uri);
};
goog.uri.utils.getUserInfo = function(uri) {
  return goog.uri.utils.decodeIfPossible_(goog.uri.utils.getUserInfoEncoded(uri));
};
goog.uri.utils.getDomainEncoded = function(uri) {
  return goog.uri.utils.getComponentByIndex_(goog.uri.utils.ComponentIndex.DOMAIN, uri);
};
goog.uri.utils.getDomain = function(uri) {
  return goog.uri.utils.decodeIfPossible_(goog.uri.utils.getDomainEncoded(uri), !0);
};
goog.uri.utils.getPort = function(uri) {
  return Number(goog.uri.utils.getComponentByIndex_(goog.uri.utils.ComponentIndex.PORT, uri)) || null;
};
goog.uri.utils.getPathEncoded = function(uri) {
  return goog.uri.utils.getComponentByIndex_(goog.uri.utils.ComponentIndex.PATH, uri);
};
goog.uri.utils.getPath = function(uri) {
  return goog.uri.utils.decodeIfPossible_(goog.uri.utils.getPathEncoded(uri), !0);
};
goog.uri.utils.getQueryData = function(uri) {
  return goog.uri.utils.getComponentByIndex_(goog.uri.utils.ComponentIndex.QUERY_DATA, uri);
};
goog.uri.utils.getFragmentEncoded = function(uri) {
  var hashIndex = uri.indexOf("#");
  return 0 > hashIndex ? null : uri.substr(hashIndex + 1);
};
goog.uri.utils.setFragmentEncoded = function(uri, fragment) {
  return goog.uri.utils.removeFragment(uri) + (fragment ? "#" + fragment : "");
};
goog.uri.utils.getFragment = function(uri) {
  return goog.uri.utils.decodeIfPossible_(goog.uri.utils.getFragmentEncoded(uri));
};
goog.uri.utils.getHost = function(uri) {
  var pieces = goog.uri.utils.split(uri);
  return goog.uri.utils.buildFromEncodedParts(pieces[goog.uri.utils.ComponentIndex.SCHEME], pieces[goog.uri.utils.ComponentIndex.USER_INFO], pieces[goog.uri.utils.ComponentIndex.DOMAIN], pieces[goog.uri.utils.ComponentIndex.PORT]);
};
goog.uri.utils.getOrigin = function(uri) {
  var pieces = goog.uri.utils.split(uri);
  return goog.uri.utils.buildFromEncodedParts(pieces[goog.uri.utils.ComponentIndex.SCHEME], null, pieces[goog.uri.utils.ComponentIndex.DOMAIN], pieces[goog.uri.utils.ComponentIndex.PORT]);
};
goog.uri.utils.getPathAndAfter = function(uri) {
  var pieces = goog.uri.utils.split(uri);
  return goog.uri.utils.buildFromEncodedParts(null, null, null, null, pieces[goog.uri.utils.ComponentIndex.PATH], pieces[goog.uri.utils.ComponentIndex.QUERY_DATA], pieces[goog.uri.utils.ComponentIndex.FRAGMENT]);
};
goog.uri.utils.removeFragment = function(uri) {
  var hashIndex = uri.indexOf("#");
  return 0 > hashIndex ? uri : uri.substr(0, hashIndex);
};
goog.uri.utils.haveSameDomain = function(uri1, uri2) {
  var pieces1 = goog.uri.utils.split(uri1), pieces2 = goog.uri.utils.split(uri2);
  return pieces1[goog.uri.utils.ComponentIndex.DOMAIN] == pieces2[goog.uri.utils.ComponentIndex.DOMAIN] && pieces1[goog.uri.utils.ComponentIndex.SCHEME] == pieces2[goog.uri.utils.ComponentIndex.SCHEME] && pieces1[goog.uri.utils.ComponentIndex.PORT] == pieces2[goog.uri.utils.ComponentIndex.PORT];
};
goog.uri.utils.assertNoFragmentsOrQueries_ = function(uri) {
  goog.asserts.assert(0 > uri.indexOf("#") && 0 > uri.indexOf("?"), "goog.uri.utils: Fragment or query identifiers are not supported: [%s]", uri);
};
goog.uri.utils.parseQueryData = function(encodedQuery, callback) {
  if (encodedQuery) {
    for (var pairs = encodedQuery.split("&"), i = 0; i < pairs.length; i++) {
      var indexOfEquals = pairs[i].indexOf("="), value = null;
      if (0 <= indexOfEquals) {
        var name = pairs[i].substring(0, indexOfEquals);
        value = pairs[i].substring(indexOfEquals + 1);
      } else {
        name = pairs[i];
      }
      callback(name, value ? goog.string.urlDecode(value) : "");
    }
  }
};
goog.uri.utils.splitQueryData_ = function(uri) {
  var hashIndex = uri.indexOf("#");
  0 > hashIndex && (hashIndex = uri.length);
  var questionIndex = uri.indexOf("?");
  if (0 > questionIndex || questionIndex > hashIndex) {
    questionIndex = hashIndex;
    var queryData = "";
  } else {
    queryData = uri.substring(questionIndex + 1, hashIndex);
  }
  return [uri.substr(0, questionIndex), queryData, uri.substr(hashIndex)];
};
goog.uri.utils.joinQueryData_ = function(parts) {
  return parts[0] + (parts[1] ? "?" + parts[1] : "") + parts[2];
};
goog.uri.utils.appendQueryData_ = function(queryData, newData) {
  return newData ? queryData ? queryData + "&" + newData : newData : queryData;
};
goog.uri.utils.appendQueryDataToUri_ = function(uri, queryData) {
  if (!queryData) {
    return uri;
  }
  var parts = goog.uri.utils.splitQueryData_(uri);
  parts[1] = goog.uri.utils.appendQueryData_(parts[1], queryData);
  return goog.uri.utils.joinQueryData_(parts);
};
goog.uri.utils.appendKeyValuePairs_ = function(key, value, pairs) {
  goog.asserts.assertString(key);
  if (goog.isArray(value)) {
    goog.asserts.assertArray(value);
    for (var j = 0; j < value.length; j++) {
      goog.uri.utils.appendKeyValuePairs_(key, String(value[j]), pairs);
    }
  } else {
    null != value && pairs.push(key + ("" === value ? "" : "=" + goog.string.urlEncode(value)));
  }
};
goog.uri.utils.buildQueryData = function(keysAndValues, opt_startIndex) {
  goog.asserts.assert(0 == Math.max(keysAndValues.length - (opt_startIndex || 0), 0) % 2, "goog.uri.utils: Key/value lists must be even in length.");
  for (var params = [], i = opt_startIndex || 0; i < keysAndValues.length; i += 2) {
    goog.uri.utils.appendKeyValuePairs_(keysAndValues[i], keysAndValues[i + 1], params);
  }
  return params.join("&");
};
goog.uri.utils.buildQueryDataFromMap = function(map) {
  var params = [], key;
  for (key in map) {
    goog.uri.utils.appendKeyValuePairs_(key, map[key], params);
  }
  return params.join("&");
};
goog.uri.utils.appendParams = function(uri, var_args) {
  var queryData = 2 == arguments.length ? goog.uri.utils.buildQueryData(arguments[1], 0) : goog.uri.utils.buildQueryData(arguments, 1);
  return goog.uri.utils.appendQueryDataToUri_(uri, queryData);
};
goog.uri.utils.appendParamsFromMap = function(uri, map) {
  var queryData = goog.uri.utils.buildQueryDataFromMap(map);
  return goog.uri.utils.appendQueryDataToUri_(uri, queryData);
};
goog.uri.utils.appendParam = function(uri, key, opt_value) {
  var value = goog.isDefAndNotNull(opt_value) ? "=" + goog.string.urlEncode(opt_value) : "";
  return goog.uri.utils.appendQueryDataToUri_(uri, key + value);
};
goog.uri.utils.findParam_ = function(uri, startIndex, keyEncoded, hashOrEndIndex) {
  for (var index = startIndex, keyLength = keyEncoded.length; 0 <= (index = uri.indexOf(keyEncoded, index)) && index < hashOrEndIndex;) {
    var precedingChar = uri.charCodeAt(index - 1);
    if (precedingChar == goog.uri.utils.CharCode_.AMPERSAND || precedingChar == goog.uri.utils.CharCode_.QUESTION) {
      var followingChar = uri.charCodeAt(index + keyLength);
      if (!followingChar || followingChar == goog.uri.utils.CharCode_.EQUAL || followingChar == goog.uri.utils.CharCode_.AMPERSAND || followingChar == goog.uri.utils.CharCode_.HASH) {
        return index;
      }
    }
    index += keyLength + 1;
  }
  return -1;
};
goog.uri.utils.hashOrEndRe_ = /#|$/;
goog.uri.utils.hasParam = function(uri, keyEncoded) {
  return 0 <= goog.uri.utils.findParam_(uri, 0, keyEncoded, uri.search(goog.uri.utils.hashOrEndRe_));
};
goog.uri.utils.getParamValue = function(uri, keyEncoded) {
  var hashOrEndIndex = uri.search(goog.uri.utils.hashOrEndRe_), foundIndex = goog.uri.utils.findParam_(uri, 0, keyEncoded, hashOrEndIndex);
  if (0 > foundIndex) {
    return null;
  }
  var endPosition = uri.indexOf("&", foundIndex);
  if (0 > endPosition || endPosition > hashOrEndIndex) {
    endPosition = hashOrEndIndex;
  }
  foundIndex += keyEncoded.length + 1;
  return goog.string.urlDecode(uri.substr(foundIndex, endPosition - foundIndex));
};
goog.uri.utils.getParamValues = function(uri, keyEncoded) {
  for (var hashOrEndIndex = uri.search(goog.uri.utils.hashOrEndRe_), position = 0, foundIndex, result = []; 0 <= (foundIndex = goog.uri.utils.findParam_(uri, position, keyEncoded, hashOrEndIndex));) {
    position = uri.indexOf("&", foundIndex);
    if (0 > position || position > hashOrEndIndex) {
      position = hashOrEndIndex;
    }
    foundIndex += keyEncoded.length + 1;
    result.push(goog.string.urlDecode(uri.substr(foundIndex, position - foundIndex)));
  }
  return result;
};
goog.uri.utils.trailingQueryPunctuationRe_ = /[?&]($|#)/;
goog.uri.utils.removeParam = function(uri, keyEncoded) {
  for (var hashOrEndIndex = uri.search(goog.uri.utils.hashOrEndRe_), position = 0, foundIndex, buffer = []; 0 <= (foundIndex = goog.uri.utils.findParam_(uri, position, keyEncoded, hashOrEndIndex));) {
    buffer.push(uri.substring(position, foundIndex)), position = Math.min(uri.indexOf("&", foundIndex) + 1 || hashOrEndIndex, hashOrEndIndex);
  }
  buffer.push(uri.substr(position));
  return buffer.join("").replace(goog.uri.utils.trailingQueryPunctuationRe_, "$1");
};
goog.uri.utils.setParam = function(uri, keyEncoded, value) {
  return goog.uri.utils.appendParam(goog.uri.utils.removeParam(uri, keyEncoded), keyEncoded, value);
};
goog.uri.utils.setParamsFromMap = function(uri, params) {
  var parts = goog.uri.utils.splitQueryData_(uri), queryData = parts[1], buffer = [];
  queryData && goog.array.forEach(queryData.split("&"), function(pair) {
    var indexOfEquals = pair.indexOf("=");
    params.hasOwnProperty(0 <= indexOfEquals ? pair.substr(0, indexOfEquals) : pair) || buffer.push(pair);
  });
  parts[1] = goog.uri.utils.appendQueryData_(buffer.join("&"), goog.uri.utils.buildQueryDataFromMap(params));
  return goog.uri.utils.joinQueryData_(parts);
};
goog.uri.utils.appendPath = function(baseUri, path) {
  goog.uri.utils.assertNoFragmentsOrQueries_(baseUri);
  goog.string.endsWith(baseUri, "/") && (baseUri = baseUri.substr(0, baseUri.length - 1));
  goog.string.startsWith(path, "/") && (path = path.substr(1));
  return goog.string.buildString(baseUri, "/", path);
};
goog.uri.utils.setPath = function(uri, path) {
  goog.string.startsWith(path, "/") || (path = "/" + path);
  var parts = goog.uri.utils.split(uri);
  return goog.uri.utils.buildFromEncodedParts(parts[goog.uri.utils.ComponentIndex.SCHEME], parts[goog.uri.utils.ComponentIndex.USER_INFO], parts[goog.uri.utils.ComponentIndex.DOMAIN], parts[goog.uri.utils.ComponentIndex.PORT], path, parts[goog.uri.utils.ComponentIndex.QUERY_DATA], parts[goog.uri.utils.ComponentIndex.FRAGMENT]);
};
goog.uri.utils.StandardQueryParam = {RANDOM:"zx"};
goog.uri.utils.makeUnique = function(uri) {
  return goog.uri.utils.setParam(uri, goog.uri.utils.StandardQueryParam.RANDOM, goog.string.getRandomString());
};
goog.Uri = function(opt_uri, opt_ignoreCase) {
  this.domain_ = this.userInfo_ = this.scheme_ = "";
  this.port_ = null;
  this.fragment_ = this.path_ = "";
  this.ignoreCase_ = this.isReadOnly_ = !1;
  var m;
  opt_uri instanceof goog.Uri ? (this.ignoreCase_ = goog.isDef(opt_ignoreCase) ? opt_ignoreCase : opt_uri.ignoreCase_, this.setScheme(opt_uri.getScheme()), this.setUserInfo(opt_uri.getUserInfo()), this.setDomain(opt_uri.getDomain()), this.setPort(opt_uri.getPort()), this.setPath(opt_uri.getPath()), this.setQueryData(opt_uri.getQueryData().clone()), this.setFragment(opt_uri.getFragment())) : opt_uri && (m = goog.uri.utils.split(String(opt_uri))) ? (this.ignoreCase_ = !!opt_ignoreCase, this.setScheme(m[goog.uri.utils.ComponentIndex.SCHEME] || 
  "", !0), this.setUserInfo(m[goog.uri.utils.ComponentIndex.USER_INFO] || "", !0), this.setDomain(m[goog.uri.utils.ComponentIndex.DOMAIN] || "", !0), this.setPort(m[goog.uri.utils.ComponentIndex.PORT]), this.setPath(m[goog.uri.utils.ComponentIndex.PATH] || "", !0), this.setQueryData(m[goog.uri.utils.ComponentIndex.QUERY_DATA] || "", !0), this.setFragment(m[goog.uri.utils.ComponentIndex.FRAGMENT] || "", !0)) : (this.ignoreCase_ = !!opt_ignoreCase, this.queryData_ = new goog.Uri.QueryData(null, null, 
  this.ignoreCase_));
};
goog.Uri.RANDOM_PARAM = goog.uri.utils.StandardQueryParam.RANDOM;
goog.Uri.prototype.toString = function() {
  var out = [], scheme = this.getScheme();
  scheme && out.push(goog.Uri.encodeSpecialChars_(scheme, goog.Uri.reDisallowedInSchemeOrUserInfo_, !0), ":");
  var domain = this.getDomain();
  if (domain || "file" == scheme) {
    out.push("//");
    var userInfo = this.getUserInfo();
    userInfo && out.push(goog.Uri.encodeSpecialChars_(userInfo, goog.Uri.reDisallowedInSchemeOrUserInfo_, !0), "@");
    out.push(goog.Uri.removeDoubleEncoding_(goog.string.urlEncode(domain)));
    var port = this.getPort();
    null != port && out.push(":", String(port));
  }
  var path = this.getPath();
  path && (this.hasDomain() && "/" != path.charAt(0) && out.push("/"), out.push(goog.Uri.encodeSpecialChars_(path, "/" == path.charAt(0) ? goog.Uri.reDisallowedInAbsolutePath_ : goog.Uri.reDisallowedInRelativePath_, !0)));
  var query = this.getEncodedQuery();
  query && out.push("?", query);
  var fragment = this.getFragment();
  fragment && out.push("#", goog.Uri.encodeSpecialChars_(fragment, goog.Uri.reDisallowedInFragment_));
  return out.join("");
};
goog.Uri.prototype.resolve = function(relativeUri) {
  var absoluteUri = this.clone(), overridden = relativeUri.hasScheme();
  overridden ? absoluteUri.setScheme(relativeUri.getScheme()) : overridden = relativeUri.hasUserInfo();
  overridden ? absoluteUri.setUserInfo(relativeUri.getUserInfo()) : overridden = relativeUri.hasDomain();
  overridden ? absoluteUri.setDomain(relativeUri.getDomain()) : overridden = relativeUri.hasPort();
  var path = relativeUri.getPath();
  if (overridden) {
    absoluteUri.setPort(relativeUri.getPort());
  } else {
    if (overridden = relativeUri.hasPath()) {
      if ("/" != path.charAt(0)) {
        if (this.hasDomain() && !this.hasPath()) {
          path = "/" + path;
        } else {
          var lastSlashIndex = absoluteUri.getPath().lastIndexOf("/");
          -1 != lastSlashIndex && (path = absoluteUri.getPath().substr(0, lastSlashIndex + 1) + path);
        }
      }
      path = goog.Uri.removeDotSegments(path);
    }
  }
  overridden ? absoluteUri.setPath(path) : overridden = relativeUri.hasQuery();
  overridden ? absoluteUri.setQueryData(relativeUri.getQueryData().clone()) : overridden = relativeUri.hasFragment();
  overridden && absoluteUri.setFragment(relativeUri.getFragment());
  return absoluteUri;
};
goog.Uri.prototype.clone = function() {
  return new goog.Uri(this);
};
goog.Uri.prototype.getScheme = function() {
  return this.scheme_;
};
goog.Uri.prototype.setScheme = function(newScheme, opt_decode) {
  this.enforceReadOnly();
  if (this.scheme_ = opt_decode ? goog.Uri.decodeOrEmpty_(newScheme, !0) : newScheme) {
    this.scheme_ = this.scheme_.replace(/:$/, "");
  }
  return this;
};
goog.Uri.prototype.hasScheme = function() {
  return !!this.scheme_;
};
goog.Uri.prototype.getUserInfo = function() {
  return this.userInfo_;
};
goog.Uri.prototype.setUserInfo = function(newUserInfo, opt_decode) {
  this.enforceReadOnly();
  this.userInfo_ = opt_decode ? goog.Uri.decodeOrEmpty_(newUserInfo) : newUserInfo;
  return this;
};
goog.Uri.prototype.hasUserInfo = function() {
  return !!this.userInfo_;
};
goog.Uri.prototype.getDomain = function() {
  return this.domain_;
};
goog.Uri.prototype.setDomain = function(newDomain, opt_decode) {
  this.enforceReadOnly();
  this.domain_ = opt_decode ? goog.Uri.decodeOrEmpty_(newDomain, !0) : newDomain;
  return this;
};
goog.Uri.prototype.hasDomain = function() {
  return !!this.domain_;
};
goog.Uri.prototype.getPort = function() {
  return this.port_;
};
goog.Uri.prototype.setPort = function(newPort) {
  this.enforceReadOnly();
  if (newPort) {
    newPort = Number(newPort);
    if (isNaN(newPort) || 0 > newPort) {
      throw Error("Bad port number " + newPort);
    }
    this.port_ = newPort;
  } else {
    this.port_ = null;
  }
  return this;
};
goog.Uri.prototype.hasPort = function() {
  return null != this.port_;
};
goog.Uri.prototype.getPath = function() {
  return this.path_;
};
goog.Uri.prototype.setPath = function(newPath, opt_decode) {
  this.enforceReadOnly();
  this.path_ = opt_decode ? goog.Uri.decodeOrEmpty_(newPath, !0) : newPath;
  return this;
};
goog.Uri.prototype.hasPath = function() {
  return !!this.path_;
};
goog.Uri.prototype.hasQuery = function() {
  return "" !== this.queryData_.toString();
};
goog.Uri.prototype.setQueryData = function(queryData, opt_decode) {
  this.enforceReadOnly();
  queryData instanceof goog.Uri.QueryData ? (this.queryData_ = queryData, this.queryData_.setIgnoreCase(this.ignoreCase_)) : (opt_decode || (queryData = goog.Uri.encodeSpecialChars_(queryData, goog.Uri.reDisallowedInQuery_)), this.queryData_ = new goog.Uri.QueryData(queryData, null, this.ignoreCase_));
  return this;
};
goog.Uri.prototype.getEncodedQuery = function() {
  return this.queryData_.toString();
};
goog.Uri.prototype.getQueryData = function() {
  return this.queryData_;
};
goog.Uri.prototype.getQuery = function() {
  return this.getEncodedQuery();
};
goog.Uri.prototype.setParameterValue = function(key, value) {
  this.enforceReadOnly();
  this.queryData_.set(key, value);
  return this;
};
goog.Uri.prototype.getFragment = function() {
  return this.fragment_;
};
goog.Uri.prototype.setFragment = function(newFragment, opt_decode) {
  this.enforceReadOnly();
  this.fragment_ = opt_decode ? goog.Uri.decodeOrEmpty_(newFragment) : newFragment;
  return this;
};
goog.Uri.prototype.hasFragment = function() {
  return !!this.fragment_;
};
goog.Uri.prototype.makeUnique = function() {
  this.enforceReadOnly();
  this.setParameterValue(goog.Uri.RANDOM_PARAM, goog.string.getRandomString());
  return this;
};
goog.Uri.prototype.removeParameter = function(key) {
  this.enforceReadOnly();
  this.queryData_.remove(key);
  return this;
};
goog.Uri.prototype.enforceReadOnly = function() {
  if (this.isReadOnly_) {
    throw Error("Tried to modify a read-only Uri");
  }
};
goog.Uri.prototype.setIgnoreCase = function(ignoreCase) {
  this.ignoreCase_ = ignoreCase;
  this.queryData_ && this.queryData_.setIgnoreCase(ignoreCase);
  return this;
};
goog.Uri.parse = function(uri, opt_ignoreCase) {
  return uri instanceof goog.Uri ? uri.clone() : new goog.Uri(uri, opt_ignoreCase);
};
goog.Uri.create = function(opt_scheme, opt_userInfo, opt_domain, opt_port, opt_path, opt_query, opt_fragment, opt_ignoreCase) {
  var uri = new goog.Uri(null, opt_ignoreCase);
  opt_scheme && uri.setScheme(opt_scheme);
  opt_userInfo && uri.setUserInfo(opt_userInfo);
  opt_domain && uri.setDomain(opt_domain);
  opt_port && uri.setPort(opt_port);
  opt_path && uri.setPath(opt_path);
  opt_query && uri.setQueryData(opt_query);
  opt_fragment && uri.setFragment(opt_fragment);
  return uri;
};
goog.Uri.resolve = function(base, rel) {
  base instanceof goog.Uri || (base = goog.Uri.parse(base));
  rel instanceof goog.Uri || (rel = goog.Uri.parse(rel));
  return base.resolve(rel);
};
goog.Uri.removeDotSegments = function(path) {
  if (".." == path || "." == path) {
    return "";
  }
  if (goog.string.contains(path, "./") || goog.string.contains(path, "/.")) {
    for (var leadingSlash = goog.string.startsWith(path, "/"), segments = path.split("/"), out = [], pos = 0; pos < segments.length;) {
      var segment = segments[pos++];
      "." == segment ? leadingSlash && pos == segments.length && out.push("") : ".." == segment ? ((1 < out.length || 1 == out.length && "" != out[0]) && out.pop(), leadingSlash && pos == segments.length && out.push("")) : (out.push(segment), leadingSlash = !0);
    }
    return out.join("/");
  }
  return path;
};
goog.Uri.decodeOrEmpty_ = function(val, opt_preserveReserved) {
  return val ? opt_preserveReserved ? decodeURI(val.replace(/%25/g, "%2525")) : decodeURIComponent(val) : "";
};
goog.Uri.encodeSpecialChars_ = function(unescapedPart, extra, opt_removeDoubleEncoding) {
  if (goog.isString(unescapedPart)) {
    var encoded = encodeURI(unescapedPart).replace(extra, goog.Uri.encodeChar_);
    opt_removeDoubleEncoding && (encoded = goog.Uri.removeDoubleEncoding_(encoded));
    return encoded;
  }
  return null;
};
goog.Uri.encodeChar_ = function(ch) {
  var n = ch.charCodeAt(0);
  return "%" + (n >> 4 & 15).toString(16) + (n & 15).toString(16);
};
goog.Uri.removeDoubleEncoding_ = function(doubleEncodedString) {
  return doubleEncodedString.replace(/%25([0-9a-fA-F]{2})/g, "%$1");
};
goog.Uri.reDisallowedInSchemeOrUserInfo_ = /[#\/\?@]/g;
goog.Uri.reDisallowedInRelativePath_ = /[#\?:]/g;
goog.Uri.reDisallowedInAbsolutePath_ = /[#\?]/g;
goog.Uri.reDisallowedInQuery_ = /[#\?@]/g;
goog.Uri.reDisallowedInFragment_ = /#/g;
goog.Uri.haveSameDomain = function(uri1String, uri2String) {
  var pieces1 = goog.uri.utils.split(uri1String), pieces2 = goog.uri.utils.split(uri2String);
  return pieces1[goog.uri.utils.ComponentIndex.DOMAIN] == pieces2[goog.uri.utils.ComponentIndex.DOMAIN] && pieces1[goog.uri.utils.ComponentIndex.PORT] == pieces2[goog.uri.utils.ComponentIndex.PORT];
};
goog.Uri.QueryData = function(opt_query, opt_uri, opt_ignoreCase) {
  this.count_ = this.keyMap_ = null;
  this.encodedQuery_ = opt_query || null;
  this.ignoreCase_ = !!opt_ignoreCase;
};
goog.Uri.QueryData.prototype.ensureKeyMapInitialized_ = function() {
  if (!this.keyMap_ && (this.keyMap_ = new goog.structs.Map, this.count_ = 0, this.encodedQuery_)) {
    var self = this;
    goog.uri.utils.parseQueryData(this.encodedQuery_, function(name, value) {
      self.add(goog.string.urlDecode(name), value);
    });
  }
};
goog.Uri.QueryData.createFromMap = function(map, opt_uri, opt_ignoreCase) {
  var keys = goog.structs.getKeys(map);
  if ("undefined" == typeof keys) {
    throw Error("Keys are undefined");
  }
  for (var queryData = new goog.Uri.QueryData(null, null, opt_ignoreCase), values = goog.structs.getValues(map), i = 0; i < keys.length; i++) {
    var key = keys[i], value = values[i];
    goog.isArray(value) ? queryData.setValues(key, value) : queryData.add(key, value);
  }
  return queryData;
};
goog.Uri.QueryData.createFromKeysValues = function(keys, values, opt_uri, opt_ignoreCase) {
  if (keys.length != values.length) {
    throw Error("Mismatched lengths for keys/values");
  }
  for (var queryData = new goog.Uri.QueryData(null, null, opt_ignoreCase), i = 0; i < keys.length; i++) {
    queryData.add(keys[i], values[i]);
  }
  return queryData;
};
goog.Uri.QueryData.prototype.getCount = function() {
  this.ensureKeyMapInitialized_();
  return this.count_;
};
goog.Uri.QueryData.prototype.add = function(key, value) {
  this.ensureKeyMapInitialized_();
  this.invalidateCache_();
  key = this.getKeyName_(key);
  var values = this.keyMap_.get(key);
  values || this.keyMap_.set(key, values = []);
  values.push(value);
  this.count_ = goog.asserts.assertNumber(this.count_) + 1;
  return this;
};
goog.Uri.QueryData.prototype.remove = function(key) {
  this.ensureKeyMapInitialized_();
  key = this.getKeyName_(key);
  return this.keyMap_.containsKey(key) ? (this.invalidateCache_(), this.count_ = goog.asserts.assertNumber(this.count_) - this.keyMap_.get(key).length, this.keyMap_.remove(key)) : !1;
};
goog.Uri.QueryData.prototype.clear = function() {
  this.invalidateCache_();
  this.keyMap_ = null;
  this.count_ = 0;
};
goog.Uri.QueryData.prototype.isEmpty = function() {
  this.ensureKeyMapInitialized_();
  return 0 == this.count_;
};
goog.Uri.QueryData.prototype.containsKey = function(key) {
  this.ensureKeyMapInitialized_();
  key = this.getKeyName_(key);
  return this.keyMap_.containsKey(key);
};
goog.Uri.QueryData.prototype.containsValue = function(value) {
  var vals = this.getValues();
  return goog.array.contains(vals, value);
};
goog.Uri.QueryData.prototype.forEach = function(f, opt_scope) {
  this.ensureKeyMapInitialized_();
  this.keyMap_.forEach(function(values, key) {
    goog.array.forEach(values, function(value) {
      f.call(opt_scope, value, key, this);
    }, this);
  }, this);
};
goog.Uri.QueryData.prototype.getKeys = function() {
  this.ensureKeyMapInitialized_();
  for (var vals = this.keyMap_.getValues(), keys = this.keyMap_.getKeys(), rv = [], i = 0; i < keys.length; i++) {
    for (var val = vals[i], j = 0; j < val.length; j++) {
      rv.push(keys[i]);
    }
  }
  return rv;
};
goog.Uri.QueryData.prototype.getValues = function(opt_key) {
  this.ensureKeyMapInitialized_();
  var rv = [];
  if (goog.isString(opt_key)) {
    this.containsKey(opt_key) && (rv = goog.array.concat(rv, this.keyMap_.get(this.getKeyName_(opt_key))));
  } else {
    for (var values = this.keyMap_.getValues(), i = 0; i < values.length; i++) {
      rv = goog.array.concat(rv, values[i]);
    }
  }
  return rv;
};
goog.Uri.QueryData.prototype.set = function(key, value) {
  this.ensureKeyMapInitialized_();
  this.invalidateCache_();
  key = this.getKeyName_(key);
  this.containsKey(key) && (this.count_ = goog.asserts.assertNumber(this.count_) - this.keyMap_.get(key).length);
  this.keyMap_.set(key, [value]);
  this.count_ = goog.asserts.assertNumber(this.count_) + 1;
  return this;
};
goog.Uri.QueryData.prototype.get = function(key, opt_default) {
  if (!key) {
    return opt_default;
  }
  var values = this.getValues(key);
  return 0 < values.length ? String(values[0]) : opt_default;
};
goog.Uri.QueryData.prototype.setValues = function(key, values) {
  this.remove(key);
  0 < values.length && (this.invalidateCache_(), this.keyMap_.set(this.getKeyName_(key), goog.array.clone(values)), this.count_ = goog.asserts.assertNumber(this.count_) + values.length);
};
goog.Uri.QueryData.prototype.toString = function() {
  if (this.encodedQuery_) {
    return this.encodedQuery_;
  }
  if (!this.keyMap_) {
    return "";
  }
  for (var sb = [], keys = this.keyMap_.getKeys(), i = 0; i < keys.length; i++) {
    for (var key = keys[i], encodedKey = goog.string.urlEncode(key), val = this.getValues(key), j = 0; j < val.length; j++) {
      var param = encodedKey;
      "" !== val[j] && (param += "=" + goog.string.urlEncode(val[j]));
      sb.push(param);
    }
  }
  return this.encodedQuery_ = sb.join("&");
};
goog.Uri.QueryData.prototype.invalidateCache_ = function() {
  this.encodedQuery_ = null;
};
goog.Uri.QueryData.prototype.clone = function() {
  var rv = new goog.Uri.QueryData;
  rv.encodedQuery_ = this.encodedQuery_;
  this.keyMap_ && (rv.keyMap_ = this.keyMap_.clone(), rv.count_ = this.count_);
  return rv;
};
goog.Uri.QueryData.prototype.getKeyName_ = function(arg) {
  var keyName = String(arg);
  this.ignoreCase_ && (keyName = keyName.toLowerCase());
  return keyName;
};
goog.Uri.QueryData.prototype.setIgnoreCase = function(ignoreCase) {
  ignoreCase && !this.ignoreCase_ && (this.ensureKeyMapInitialized_(), this.invalidateCache_(), this.keyMap_.forEach(function(value, key) {
    var lowerCase = key.toLowerCase();
    key != lowerCase && (this.remove(key), this.setValues(lowerCase, value));
  }, this));
  this.ignoreCase_ = ignoreCase;
};
goog.Uri.QueryData.prototype.extend = function(var_args) {
  for (var i = 0; i < arguments.length; i++) {
    goog.structs.forEach(arguments[i], function(value, key) {
      this.add(key, value);
    }, this);
  }
};
goog.soy = {};
goog.soy.data = {};
goog.soy.data.SanitizedContentKind = {HTML:goog.DEBUG ? {sanitizedContentKindHtml:!0} : {}, JS:goog.DEBUG ? {sanitizedContentJsChars:!0} : {}, URI:goog.DEBUG ? {sanitizedContentUri:!0} : {}, TRUSTED_RESOURCE_URI:goog.DEBUG ? {sanitizedContentTrustedResourceUri:!0} : {}, ATTRIBUTES:goog.DEBUG ? {sanitizedContentHtmlAttribute:!0} : {}, STYLE:goog.DEBUG ? {sanitizedContentStyle:!0} : {}, CSS:goog.DEBUG ? {sanitizedContentCss:!0} : {}, TEXT:goog.DEBUG ? {sanitizedContentKindText:!0} : {}};
goog.soy.data.SanitizedContent = function() {
  throw Error("Do not instantiate directly");
};
goog.soy.data.SanitizedContent.prototype.contentDir = null;
goog.soy.data.SanitizedContent.prototype.toString = function() {
  return this.content;
};
goog.soy.data.UnsanitizedText = function(content) {
  this.content = String(content);
  this.contentDir = null;
};
goog.inherits(goog.soy.data.UnsanitizedText, goog.soy.data.SanitizedContent);
goog.soy.data.UnsanitizedText.prototype.contentKind = goog.soy.data.SanitizedContentKind.TEXT;
goog.soy.data.SanitizedHtml = function() {
  goog.soy.data.SanitizedContent.call(this);
};
goog.inherits(goog.soy.data.SanitizedHtml, goog.soy.data.SanitizedContent);
goog.soy.data.SanitizedHtml.prototype.contentKind = goog.soy.data.SanitizedContentKind.HTML;
goog.soy.data.SanitizedHtml.isCompatibleWith = function(value) {
  return goog.isString(value) || value instanceof goog.soy.data.SanitizedHtml || value instanceof goog.soy.data.UnsanitizedText || value instanceof goog.html.SafeHtml;
};
goog.soy.data.SanitizedHtml.isCompatibleWithStrict = function(value) {
  return value instanceof goog.soy.data.SanitizedHtml || value instanceof goog.html.SafeHtml;
};
goog.soy.data.SanitizedJs = function() {
  goog.soy.data.SanitizedContent.call(this);
};
goog.inherits(goog.soy.data.SanitizedJs, goog.soy.data.SanitizedContent);
goog.soy.data.SanitizedJs.prototype.contentKind = goog.soy.data.SanitizedContentKind.JS;
goog.soy.data.SanitizedJs.prototype.contentDir = goog.i18n.bidi.Dir.LTR;
goog.soy.data.SanitizedJs.isCompatibleWith = function(value) {
  return goog.isString(value) || value instanceof goog.soy.data.SanitizedJs || value instanceof goog.soy.data.UnsanitizedText || value instanceof goog.html.SafeScript;
};
goog.soy.data.SanitizedJs.isCompatibleWithStrict = function(value) {
  return value instanceof goog.soy.data.SanitizedJs || value instanceof goog.html.SafeHtml;
};
goog.soy.data.SanitizedUri = function() {
  goog.soy.data.SanitizedContent.call(this);
};
goog.inherits(goog.soy.data.SanitizedUri, goog.soy.data.SanitizedContent);
goog.soy.data.SanitizedUri.prototype.contentKind = goog.soy.data.SanitizedContentKind.URI;
goog.soy.data.SanitizedUri.prototype.contentDir = goog.i18n.bidi.Dir.LTR;
goog.soy.data.SanitizedUri.isCompatibleWith = function(value) {
  return goog.isString(value) || value instanceof goog.soy.data.SanitizedUri || value instanceof goog.soy.data.UnsanitizedText || value instanceof goog.html.SafeUrl || value instanceof goog.html.TrustedResourceUrl || value instanceof goog.Uri;
};
goog.soy.data.SanitizedUri.isCompatibleWithStrict = function(value) {
  return value instanceof goog.soy.data.SanitizedUri || value instanceof goog.html.SafeUrl || value instanceof goog.html.TrustedResourceUrl || value instanceof goog.Uri;
};
goog.soy.data.SanitizedTrustedResourceUri = function() {
  goog.soy.data.SanitizedContent.call(this);
};
goog.inherits(goog.soy.data.SanitizedTrustedResourceUri, goog.soy.data.SanitizedContent);
goog.soy.data.SanitizedTrustedResourceUri.prototype.contentKind = goog.soy.data.SanitizedContentKind.TRUSTED_RESOURCE_URI;
goog.soy.data.SanitizedTrustedResourceUri.prototype.contentDir = goog.i18n.bidi.Dir.LTR;
goog.soy.data.SanitizedTrustedResourceUri.isCompatibleWith = function(value) {
  return goog.isString(value) || value instanceof goog.soy.data.SanitizedTrustedResourceUri || value instanceof goog.soy.data.UnsanitizedText || value instanceof goog.html.TrustedResourceUrl;
};
goog.soy.data.SanitizedTrustedResourceUri.isCompatibleWithStrict = function(value) {
  return value instanceof goog.soy.data.SanitizedTrustedResourceUri || value instanceof goog.html.TrustedResourceUrl;
};
goog.soy.data.SanitizedHtmlAttribute = function() {
  goog.soy.data.SanitizedContent.call(this);
};
goog.inherits(goog.soy.data.SanitizedHtmlAttribute, goog.soy.data.SanitizedContent);
goog.soy.data.SanitizedHtmlAttribute.prototype.contentKind = goog.soy.data.SanitizedContentKind.ATTRIBUTES;
goog.soy.data.SanitizedHtmlAttribute.prototype.contentDir = goog.i18n.bidi.Dir.LTR;
goog.soy.data.SanitizedHtmlAttribute.isCompatibleWith = function(value) {
  return goog.isString(value) || value instanceof goog.soy.data.SanitizedHtmlAttribute || value instanceof goog.soy.data.UnsanitizedText;
};
goog.soy.data.SanitizedHtmlAttribute.isCompatibleWithStrict = function(value) {
  return value instanceof goog.soy.data.SanitizedHtmlAttribute;
};
goog.soy.data.SanitizedCss = function() {
  goog.soy.data.SanitizedContent.call(this);
};
goog.inherits(goog.soy.data.SanitizedCss, goog.soy.data.SanitizedContent);
goog.soy.data.SanitizedCss.prototype.contentKind = goog.soy.data.SanitizedContentKind.CSS;
goog.soy.data.SanitizedCss.prototype.contentDir = goog.i18n.bidi.Dir.LTR;
goog.soy.data.SanitizedCss.isCompatibleWith = function(value) {
  return goog.isString(value) || value instanceof goog.soy.data.SanitizedCss || value instanceof goog.soy.data.UnsanitizedText || value instanceof goog.html.SafeStyle || value instanceof goog.html.SafeStyleSheet;
};
goog.soy.data.SanitizedCss.isCompatibleWithStrict = function(value) {
  return value instanceof goog.soy.data.SanitizedCss || value instanceof goog.html.SafeStyle || value instanceof goog.html.SafeStyleSheet;
};
var soy = {checks:{}};
soy.checks.isContentKind_ = function(value, contentKind, constructor) {
  var ret = null != value && value.contentKind === contentKind;
  ret && goog.asserts.assert(value.constructor === constructor);
  return ret;
};
soy.checks.isHtml = function(value) {
  return soy.checks.isContentKind_(value, goog.soy.data.SanitizedContentKind.HTML, goog.soy.data.SanitizedHtml);
};
soy.checks.isCss = function(value) {
  return soy.checks.isContentKind_(value, goog.soy.data.SanitizedContentKind.CSS, goog.soy.data.SanitizedCss);
};
soy.checks.isAttribute = function(value) {
  return soy.checks.isContentKind_(value, goog.soy.data.SanitizedContentKind.ATTRIBUTES, goog.soy.data.SanitizedHtmlAttribute);
};
soy.checks.isJS = function(value) {
  return soy.checks.isContentKind_(value, goog.soy.data.SanitizedContentKind.JS, goog.soy.data.SanitizedJs);
};
soy.checks.isTrustedResourceURI = function(value) {
  return soy.checks.isContentKind_(value, goog.soy.data.SanitizedContentKind.TRUSTED_RESOURCE_URI, goog.soy.data.SanitizedTrustedResourceUri);
};
soy.checks.isURI = function(value) {
  return soy.checks.isContentKind_(value, goog.soy.data.SanitizedContentKind.URI, goog.soy.data.SanitizedUri);
};
soy.checks.isText = function(value) {
  return soy.checks.isContentKind_(value, goog.soy.data.SanitizedContentKind.TEXT, goog.soy.data.UnsanitizedText);
};
soy.map = {};
var module$contents$soy$map_SoyMap = function() {
};
module$contents$soy$map_SoyMap.prototype.get = function() {
};
module$contents$soy$map_SoyMap.prototype.set = function() {
};
module$contents$soy$map_SoyMap.prototype.keys = function() {
};
module$contents$soy$map_SoyMap.prototype.entries = function() {
};
soy.map.$$mapToLegacyObjectMap = function(map) {
  for (var obj = {}, $jscomp$iter$0 = $jscomp.makeIterator(map.entries()), $jscomp$key$ = $jscomp$iter$0.next(); !$jscomp$key$.done; $jscomp$key$ = $jscomp$iter$0.next()) {
    var $jscomp$destructuring$var1 = $jscomp.makeIterator($jscomp$key$.value), k = $jscomp$destructuring$var1.next().value, v = $jscomp$destructuring$var1.next().value;
    obj[(0,goog.asserts.assertString)(k)] = v;
  }
  return obj;
};
soy.map.$$maybeCoerceKeyToString = function(key) {
  return key instanceof goog.soy.data.UnsanitizedText ? key.content : key;
};
soy.map.$$populateMap = function(jspbMap, map) {
  for (var $jscomp$iter$1 = $jscomp.makeIterator(map.entries()), $jscomp$key$ = $jscomp$iter$1.next(); !$jscomp$key$.done; $jscomp$key$ = $jscomp$iter$1.next()) {
    var $jscomp$destructuring$var3 = $jscomp.makeIterator($jscomp$key$.value), k = $jscomp$destructuring$var3.next().value, v = $jscomp$destructuring$var3.next().value;
    jspbMap.set(k, v);
  }
};
soy.map.$$getMapKeys = function(map) {
  var keys = Array.from(map.keys());
  goog.DEBUG && (0,goog.array.shuffle)(keys);
  return keys;
};
soy.map.$$isSoyMap = function(map) {
  return goog.isObject(map) && goog.isFunction(map.get) && goog.isFunction(map.set) && goog.isFunction(map.keys) && goog.isFunction(map.entries);
};
soy.map.Map = module$contents$soy$map_SoyMap;
soy.newmaps = {};
soy.newmaps.$$legacyObjectMapToMap = function(obj) {
  var map = new Map, key;
  for (key in obj) {
    obj.hasOwnProperty(key) && map.set(key, obj[key]);
  }
  return map;
};
soy.newmaps.$$transformValues = function(map, f) {
  for (var m = new Map, $jscomp$iter$2 = $jscomp.makeIterator(map.entries()), $jscomp$key$ = $jscomp$iter$2.next(); !$jscomp$key$.done; $jscomp$key$ = $jscomp$iter$2.next()) {
    var $jscomp$destructuring$var5 = $jscomp.makeIterator($jscomp$key$.value), k = $jscomp$destructuring$var5.next().value, v = $jscomp$destructuring$var5.next().value;
    m.set(k, f(v));
  }
  return m;
};
soy.asserts = {};
soy.esc = {};
var soydata = {VERY_UNSAFE:{}};
soy.IjData = function() {
};
soydata.isContentKind_ = function(value, contentKind) {
  return null != value && value.contentKind === contentKind;
};
soydata.getContentDir = function(value) {
  if (null != value) {
    switch(value.contentDir) {
      case goog.i18n.bidi.Dir.LTR:
        return goog.i18n.bidi.Dir.LTR;
      case goog.i18n.bidi.Dir.RTL:
        return goog.i18n.bidi.Dir.RTL;
      case goog.i18n.bidi.Dir.NEUTRAL:
        return goog.i18n.bidi.Dir.NEUTRAL;
    }
  }
  return null;
};
soydata.SanitizedHtml = function() {
  goog.soy.data.SanitizedHtml.call(this);
};
goog.inherits(soydata.SanitizedHtml, goog.soy.data.SanitizedHtml);
soydata.SanitizedHtml.from = function(value) {
  return soy.checks.isHtml(value) ? value : value instanceof goog.html.SafeHtml ? soydata.VERY_UNSAFE.ordainSanitizedHtml(goog.html.SafeHtml.unwrap(value), value.getDirection()) : soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.esc.$$escapeHtmlHelper(String(value)), soydata.getContentDir(value));
};
soydata.$$EMPTY_STRING_ = {VALUE:""};
soydata.$$makeSanitizedContentFactory_ = function(ctor) {
  function InstantiableCtor(content) {
    this.content = content;
  }
  InstantiableCtor.prototype = ctor.prototype;
  return function(content, opt_contentDir) {
    var result = new InstantiableCtor(String(content));
    void 0 !== opt_contentDir && (result.contentDir = opt_contentDir);
    return result;
  };
};
soydata.$$makeSanitizedContentFactoryWithDefaultDirOnly_ = function(ctor) {
  function InstantiableCtor(content) {
    this.content = content;
  }
  InstantiableCtor.prototype = ctor.prototype;
  return function(content) {
    return new InstantiableCtor(String(content));
  };
};
soydata.markUnsanitizedText = function(content) {
  return new goog.soy.data.UnsanitizedText(content);
};
soydata.VERY_UNSAFE.ordainSanitizedHtml = soydata.$$makeSanitizedContentFactory_(goog.soy.data.SanitizedHtml);
soydata.VERY_UNSAFE.ordainSanitizedJs = soydata.$$makeSanitizedContentFactoryWithDefaultDirOnly_(goog.soy.data.SanitizedJs);
soydata.VERY_UNSAFE.ordainSanitizedUri = soydata.$$makeSanitizedContentFactoryWithDefaultDirOnly_(goog.soy.data.SanitizedUri);
soydata.VERY_UNSAFE.ordainSanitizedTrustedResourceUri = soydata.$$makeSanitizedContentFactoryWithDefaultDirOnly_(goog.soy.data.SanitizedTrustedResourceUri);
soydata.VERY_UNSAFE.ordainSanitizedHtmlAttribute = soydata.$$makeSanitizedContentFactoryWithDefaultDirOnly_(goog.soy.data.SanitizedHtmlAttribute);
soydata.VERY_UNSAFE.ordainSanitizedCss = soydata.$$makeSanitizedContentFactoryWithDefaultDirOnly_(goog.soy.data.SanitizedCss);
soy.$$IS_LOCALE_RTL = goog.i18n.bidi.IS_RTL;
soy.$$augmentMap = function(baseMap, additionalMap) {
  return soy.$$assignDefaults(soy.$$assignDefaults({}, additionalMap), baseMap);
};
soy.$$assignDefaults = function(obj, defaults) {
  for (var key in defaults) {
    key in obj || (obj[key] = defaults[key]);
  }
  return obj;
};
soy.$$getMapKeys = function(map) {
  var mapKeys = [], key;
  for (key in map) {
    mapKeys.push(key);
  }
  return mapKeys;
};
soy.$$checkNotNull = function(val) {
  if (null == val) {
    throw Error("unexpected null value");
  }
  return val;
};
soy.$$parseInt = function(str) {
  var parsed = parseInt(String(str), 10);
  return isNaN(parsed) ? null : parsed;
};
soy.$$equals = function(obj1, obj2) {
  var valueOne = obj1 instanceof goog.soy.data.UnsanitizedText ? obj1.toString() : obj1;
  var valueTwo = obj2 instanceof goog.soy.data.UnsanitizedText ? obj2.toString() : obj2;
  return goog.isFunction(valueOne) && goog.isFunction(valueTwo) ? valueOne.contentKind !== valueTwo.contentKind ? !1 : valueOne.toString() === valueTwo.toString() : valueOne instanceof goog.soy.data.SanitizedContent && valueTwo instanceof goog.soy.data.SanitizedContent ? valueOne.contentKind != valueTwo.contentKind ? !1 : valueOne.toString() == valueTwo.toString() : valueOne == valueTwo;
};
soy.$$parseFloat = function(str) {
  var parsed = parseFloat(str);
  return isNaN(parsed) ? null : parsed;
};
soy.$$randomInt = function(num) {
  return Math.floor(Math.random() * num);
};
soy.$$round = function(num, numDigitsAfterPt) {
  var shift = Math.pow(10, numDigitsAfterPt);
  return Math.round(num * shift) / shift;
};
soy.$$strContains = function(haystack, needle) {
  return -1 != haystack.indexOf(needle);
};
soy.$$coerceToBoolean = function(arg) {
  return arg instanceof goog.soy.data.SanitizedContent ? !!arg.content : !!arg;
};
soy.$$getDelTemplateId = function(delTemplateName) {
  return delTemplateName;
};
soy.$$DELEGATE_REGISTRY_PRIORITIES_ = {};
soy.$$DELEGATE_REGISTRY_FUNCTIONS_ = {};
soy.$$registerDelegateFn = function(delTemplateId, delTemplateVariant, delPriority, delFn) {
  var mapKey = "key_" + delTemplateId + ":" + delTemplateVariant, currPriority = soy.$$DELEGATE_REGISTRY_PRIORITIES_[mapKey];
  if (void 0 === currPriority || delPriority > currPriority) {
    soy.$$DELEGATE_REGISTRY_PRIORITIES_[mapKey] = delPriority, soy.$$DELEGATE_REGISTRY_FUNCTIONS_[mapKey] = delFn;
  } else {
    if (delPriority == currPriority) {
      throw Error('Encountered two active delegates with the same priority ("' + delTemplateId + ":" + delTemplateVariant + '").');
    }
  }
};
soy.$$getDelegateFn = function(delTemplateId, delTemplateVariant, allowsEmptyDefault) {
  var delFn = soy.$$DELEGATE_REGISTRY_FUNCTIONS_["key_" + delTemplateId + ":" + delTemplateVariant];
  delFn || "" == delTemplateVariant || (delFn = soy.$$DELEGATE_REGISTRY_FUNCTIONS_["key_" + delTemplateId + ":"]);
  if (delFn) {
    return delFn;
  }
  if (allowsEmptyDefault) {
    return soy.$$EMPTY_TEMPLATE_FN_;
  }
  throw Error('Found no active impl for delegate call to "' + delTemplateId + (delTemplateVariant ? ":" + delTemplateVariant : "") + '" (and delcall does not set allowemptydefault="true").');
};
soy.$$EMPTY_TEMPLATE_FN_ = function() {
  return "";
};
soydata.$$makeSanitizedContentFactoryForInternalBlocks_ = function(ctor) {
  function InstantiableCtor(content) {
    this.content = content;
  }
  InstantiableCtor.prototype = ctor.prototype;
  return function(content, opt_contentDir) {
    var contentString = String(content);
    if (!contentString) {
      return soydata.$$EMPTY_STRING_.VALUE;
    }
    var result = new InstantiableCtor(contentString);
    void 0 !== opt_contentDir && (result.contentDir = opt_contentDir);
    return result;
  };
};
soydata.$$makeSanitizedContentFactoryWithDefaultDirOnlyForInternalBlocks_ = function(ctor) {
  function InstantiableCtor(content) {
    this.content = content;
  }
  InstantiableCtor.prototype = ctor.prototype;
  return function(content) {
    var contentString = String(content);
    return contentString ? new InstantiableCtor(contentString) : soydata.$$EMPTY_STRING_.VALUE;
  };
};
soydata.$$markUnsanitizedTextForInternalBlocks = function(content) {
  var contentString = String(content);
  return contentString ? new goog.soy.data.UnsanitizedText(contentString) : soydata.$$EMPTY_STRING_.VALUE;
};
soydata.VERY_UNSAFE.$$ordainSanitizedHtmlForInternalBlocks = soydata.$$makeSanitizedContentFactoryForInternalBlocks_(goog.soy.data.SanitizedHtml);
soydata.VERY_UNSAFE.$$ordainSanitizedJsForInternalBlocks = soydata.$$makeSanitizedContentFactoryWithDefaultDirOnlyForInternalBlocks_(goog.soy.data.SanitizedJs);
soydata.VERY_UNSAFE.$$ordainSanitizedTrustedResourceUriForInternalBlocks = soydata.$$makeSanitizedContentFactoryWithDefaultDirOnlyForInternalBlocks_(goog.soy.data.SanitizedTrustedResourceUri);
soydata.VERY_UNSAFE.$$ordainSanitizedUriForInternalBlocks = soydata.$$makeSanitizedContentFactoryWithDefaultDirOnlyForInternalBlocks_(goog.soy.data.SanitizedUri);
soydata.VERY_UNSAFE.$$ordainSanitizedAttributesForInternalBlocks = soydata.$$makeSanitizedContentFactoryWithDefaultDirOnlyForInternalBlocks_(goog.soy.data.SanitizedHtmlAttribute);
soydata.VERY_UNSAFE.$$ordainSanitizedCssForInternalBlocks = soydata.$$makeSanitizedContentFactoryWithDefaultDirOnlyForInternalBlocks_(goog.soy.data.SanitizedCss);
soy.$$escapeHtml = function(value) {
  return soydata.SanitizedHtml.from(value);
};
soy.$$cleanHtml = function(value, opt_safeTags) {
  if (soy.checks.isHtml(value)) {
    return value;
  }
  if (opt_safeTags) {
    var tagWhitelist = goog.object.createSet(opt_safeTags);
    goog.object.extend(tagWhitelist, soy.esc.$$SAFE_TAG_WHITELIST_);
  } else {
    tagWhitelist = soy.esc.$$SAFE_TAG_WHITELIST_;
  }
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$stripHtmlTags(value, tagWhitelist), soydata.getContentDir(value));
};
soy.$$htmlToText = function(value) {
  if (null == value) {
    return "";
  }
  if (soydata.isContentKind_(value, goog.soy.data.SanitizedContentKind.TEXT)) {
    return value.toString();
  }
  if (!soydata.isContentKind_(value, goog.soy.data.SanitizedContentKind.HTML)) {
    return goog.asserts.assertString(value);
  }
  for (var html = value.toString(), text = "", start = 0, removingUntil = "", wsPreservingUntil = "", tagRe = /<(?:!--.*?--|(?:!|(\/?[a-z][\w:-]*))(?:[^>'"]|"[^"]*"|'[^']*')*)>|$/gi, match; match = tagRe.exec(html);) {
    var tag = match[1], offset = match.index;
    if (removingUntil) {
      removingUntil == tag.toLowerCase() && (removingUntil = "");
    } else {
      var chunk = html.substring(start, offset);
      chunk = goog.string.unescapeEntities(chunk);
      wsPreservingUntil || (chunk = chunk.replace(/\s+/g, " "), /\S$/.test(text) || (chunk = chunk.replace(/^ /, "")));
      text += chunk;
      /^(script|style|textarea|title)$/i.test(tag) ? removingUntil = "/" + tag.toLowerCase() : /^br$/i.test(tag) ? text += "\n" : soy.BLOCK_TAGS_RE_.test(tag) ? (/[^\n]$/.test(text) && (text += "\n"), /^pre$/i.test(tag) ? wsPreservingUntil = "/" + tag.toLowerCase() : tag.toLowerCase() == wsPreservingUntil && (wsPreservingUntil = "")) : /^(td|th)$/i.test(tag) && (text += "\t");
    }
    if (!match[0]) {
      break;
    }
    start = offset + match[0].length;
  }
  return text;
};
soy.BLOCK_TAGS_RE_ = /^\/?(address|blockquote|dd|div|dl|dt|h[1-6]|hr|li|ol|p|pre|table|tr|ul)$/i;
soy.$$normalizeHtml = function(value) {
  return soy.esc.$$normalizeHtmlHelper(value);
};
soy.$$escapeHtmlRcdata = function(value) {
  return soy.checks.isHtml(value) ? soy.esc.$$normalizeHtmlHelper(value.content) : soy.esc.$$escapeHtmlHelper(value);
};
soy.$$HTML5_VOID_ELEMENTS_ = /^<(?:area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)\b/;
soy.$$stripHtmlTags = function(value, opt_tagWhitelist) {
  if (!opt_tagWhitelist) {
    return String(value).replace(soy.esc.$$HTML_TAG_REGEX_, "").replace(soy.esc.$$LT_REGEX_, "&lt;");
  }
  var html = String(value).replace(/\[/g, "&#91;"), tags = [], attrs = [];
  html = html.replace(soy.esc.$$HTML_TAG_REGEX_, function(tok, tagName) {
    if (tagName && (tagName = tagName.toLowerCase(), opt_tagWhitelist.hasOwnProperty(tagName) && opt_tagWhitelist[tagName])) {
      var index = tags.length, start = "</", attributes = "";
      if ("/" != tok.charAt(1)) {
        start = "<";
        for (var match; match = soy.esc.$$HTML_ATTRIBUTE_REGEX_.exec(tok);) {
          if (match[1] && "dir" == match[1].toLowerCase()) {
            var dir = match[2];
            if (dir) {
              if ("'" == dir.charAt(0) || '"' == dir.charAt(0)) {
                dir = dir.substr(1, dir.length - 2);
              }
              dir = dir.toLowerCase();
              if ("ltr" == dir || "rtl" == dir || "auto" == dir) {
                attributes = ' dir="' + dir + '"';
              }
            }
            break;
          }
        }
        soy.esc.$$HTML_ATTRIBUTE_REGEX_.lastIndex = 0;
      }
      tags[index] = start + tagName + ">";
      attrs[index] = attributes;
      return "[" + index + "]";
    }
    return "";
  });
  html = soy.esc.$$normalizeHtmlHelper(html);
  var finalCloseTags = soy.$$balanceTags_(tags);
  html = html.replace(/\[(\d+)\]/g, function(_, index) {
    return attrs[index] && tags[index] ? tags[index].substr(0, tags[index].length - 1) + attrs[index] + ">" : tags[index];
  });
  return html + finalCloseTags;
};
soy.$$embedCssIntoHtml_ = function(css) {
  return css.replace(/<\//g, "<\\/").replace(/\]\]>/g, "]]\\>");
};
soy.$$balanceTags_ = function(tags) {
  for (var open = [], i = 0, n = tags.length; i < n; ++i) {
    var tag = tags[i];
    if ("/" == tag.charAt(1)) {
      var openTagIndex = goog.array.lastIndexOf(open, tag);
      0 > openTagIndex ? tags[i] = "" : (tags[i] = open.slice(openTagIndex).reverse().join(""), open.length = openTagIndex);
    } else {
      "<li>" == tag && 0 > goog.array.lastIndexOf(open, "</ol>") && 0 > goog.array.lastIndexOf(open, "</ul>") ? tags[i] = "" : soy.$$HTML5_VOID_ELEMENTS_.test(tag) || open.push("</" + tag.substring(1));
    }
  }
  return open.reverse().join("");
};
soy.$$escapeHtmlAttribute = function(value) {
  return soy.checks.isHtml(value) ? soy.esc.$$normalizeHtmlHelper(soy.$$stripHtmlTags(value.content)) : soy.esc.$$escapeHtmlHelper(value);
};
soy.$$escapeHtmlHtmlAttribute = function(value) {
  return String(soy.$$escapeHtml(value));
};
soy.$$escapeHtmlAttributeNospace = function(value) {
  return soy.checks.isHtml(value) ? soy.esc.$$normalizeHtmlNospaceHelper(soy.$$stripHtmlTags(value.content)) : soy.esc.$$escapeHtmlNospaceHelper(value);
};
soy.$$filterHtmlAttributes = function(value) {
  return soy.checks.isAttribute(value) ? value.content.replace(/([^"'\s])$/, "$1 ") : soy.esc.$$filterHtmlAttributesHelper(value);
};
soy.$$filterNumber = function(value) {
  return /^\d*\.?\d+$/.test(value) ? value : "zSoyz";
};
soy.$$filterHtmlElementName = function(value) {
  return soy.esc.$$filterHtmlElementNameHelper(value);
};
soy.$$escapeJsString = function(value) {
  return soy.esc.$$escapeJsStringHelper(value);
};
soy.$$escapeJsValue = function(value) {
  if (null == value) {
    return " null ";
  }
  if (soy.checks.isJS(value)) {
    return value.content;
  }
  if (value instanceof goog.html.SafeScript) {
    return goog.html.SafeScript.unwrap(value);
  }
  switch(typeof value) {
    case "boolean":
    case "number":
      return " " + value + " ";
    default:
      return "'" + soy.esc.$$escapeJsStringHelper(String(value)) + "'";
  }
};
soy.$$escapeJsRegex = function(value) {
  return soy.esc.$$escapeJsRegexHelper(value);
};
soy.$$problematicUriMarks_ = /['()]/g;
soy.$$pctEncode_ = function(ch) {
  return "%" + ch.charCodeAt(0).toString(16);
};
soy.$$escapeUri = function(value) {
  var encoded = soy.esc.$$escapeUriHelper(value);
  soy.$$problematicUriMarks_.lastIndex = 0;
  return soy.$$problematicUriMarks_.test(encoded) ? encoded.replace(soy.$$problematicUriMarks_, soy.$$pctEncode_) : encoded;
};
soy.$$normalizeUri = function(value) {
  return soy.esc.$$normalizeUriHelper(value);
};
soy.$$filterNormalizeUri = function(value) {
  return soy.checks.isURI(value) || soy.checks.isTrustedResourceURI(value) ? soy.$$normalizeUri(value) : value instanceof goog.html.SafeUrl ? soy.$$normalizeUri(goog.html.SafeUrl.unwrap(value)) : value instanceof goog.html.TrustedResourceUrl ? soy.$$normalizeUri(goog.html.TrustedResourceUrl.unwrap(value)) : soy.esc.$$filterNormalizeUriHelper(value);
};
soy.$$filterNormalizeMediaUri = function(value) {
  return soy.checks.isURI(value) || soy.checks.isTrustedResourceURI(value) ? soy.$$normalizeUri(value) : value instanceof goog.html.SafeUrl ? soy.$$normalizeUri(goog.html.SafeUrl.unwrap(value)) : value instanceof goog.html.TrustedResourceUrl ? soy.$$normalizeUri(goog.html.TrustedResourceUrl.unwrap(value)) : soy.esc.$$filterNormalizeMediaUriHelper(value);
};
soy.$$filterNormalizeRefreshUri = function(value) {
  return soy.$$filterNormalizeUri(value).replace(/;/g, "%3B");
};
soy.$$filterTrustedResourceUri = function(value) {
  if (soy.checks.isTrustedResourceURI(value)) {
    return value.content;
  }
  if (value instanceof goog.html.TrustedResourceUrl) {
    return goog.html.TrustedResourceUrl.unwrap(value);
  }
  goog.asserts.fail("Bad value `%s` for |filterTrustedResourceUri", [String(value)]);
  return "about:invalid#zSoyz";
};
soy.$$blessStringAsTrustedResourceUrlForLegacy = function(value) {
  return value;
};
soy.$$filterImageDataUri = function(value) {
  return soydata.VERY_UNSAFE.ordainSanitizedUri(soy.esc.$$filterImageDataUriHelper(value));
};
soy.$$filterSipUri = function(value) {
  return soydata.VERY_UNSAFE.ordainSanitizedUri(soy.esc.$$filterSipUriHelper(value));
};
soy.$$strSmsUriToUri = function(value) {
  return soydata.VERY_UNSAFE.ordainSanitizedUri(soy.esc.$$filterSmsUriHelper(value));
};
soy.$$filterTelUri = function(value) {
  return soydata.VERY_UNSAFE.ordainSanitizedUri(soy.esc.$$filterTelUriHelper(value));
};
soy.$$escapeCssString = function(value) {
  return soy.esc.$$escapeCssStringHelper(value);
};
soy.$$filterCssValue = function(value) {
  return soy.checks.isCss(value) ? soy.$$embedCssIntoHtml_(value.content) : null == value ? "" : value instanceof goog.html.SafeStyle ? soy.$$embedCssIntoHtml_(goog.html.SafeStyle.unwrap(value)) : value instanceof goog.html.SafeStyleSheet ? soy.$$embedCssIntoHtml_(goog.html.SafeStyleSheet.unwrap(value)) : soy.esc.$$filterCssValueHelper(value);
};
soy.$$changeNewlineToBr = function(value) {
  var result = goog.string.newLineToBr(String(value), !1);
  return soydata.isContentKind_(value, goog.soy.data.SanitizedContentKind.HTML) ? soydata.VERY_UNSAFE.ordainSanitizedHtml(result, soydata.getContentDir(value)) : result;
};
soy.$$insertWordBreaks = function(value, maxCharsBetweenWordBreaks) {
  var result = goog.format.insertWordBreaks(String(value), maxCharsBetweenWordBreaks);
  return soydata.isContentKind_(value, goog.soy.data.SanitizedContentKind.HTML) ? soydata.VERY_UNSAFE.ordainSanitizedHtml(result, soydata.getContentDir(value)) : result;
};
soy.$$truncate = function(str, maxLen, doAddEllipsis) {
  str = String(str);
  if (str.length <= maxLen) {
    return str;
  }
  doAddEllipsis && (3 < maxLen ? maxLen -= 3 : doAddEllipsis = !1);
  soy.$$isHighSurrogate_(str.charCodeAt(maxLen - 1)) && soy.$$isLowSurrogate_(str.charCodeAt(maxLen)) && --maxLen;
  str = str.substring(0, maxLen);
  doAddEllipsis && (str += "...");
  return str;
};
soy.$$isHighSurrogate_ = function(cc) {
  return 55296 <= cc && 56319 >= cc;
};
soy.$$isLowSurrogate_ = function(cc) {
  return 56320 <= cc && 57343 >= cc;
};
soy.$$listContains = function(list, val) {
  return 0 <= goog.array.findIndex(list, function(el) {
    return soy.$$equals(val, el);
  });
};
soy.$$strToAsciiLowerCase = function(s) {
  return goog.array.map(s, function(c) {
    return "A" <= c && "Z" >= c ? c.toLowerCase() : c;
  }).join("");
};
soy.$$strToAsciiUpperCase = function(s) {
  return goog.array.map(s, function(c) {
    return "a" <= c && "z" >= c ? c.toUpperCase() : c;
  }).join("");
};
soy.$$bidiFormatterCache_ = {};
soy.$$getBidiFormatterInstance_ = function(bidiGlobalDir) {
  return soy.$$bidiFormatterCache_[bidiGlobalDir] || (soy.$$bidiFormatterCache_[bidiGlobalDir] = new goog.i18n.BidiFormatter(bidiGlobalDir));
};
soy.$$bidiTextDir = function(text, opt_isHtml) {
  var contentDir = soydata.getContentDir(text);
  if (null != contentDir) {
    return contentDir;
  }
  var isHtml = opt_isHtml || soydata.isContentKind_(text, goog.soy.data.SanitizedContentKind.HTML);
  return goog.i18n.bidi.estimateDirection(text + "", isHtml);
};
soy.$$bidiDirAttr = function(bidiGlobalDir, text, opt_isHtml) {
  var formatter = soy.$$getBidiFormatterInstance_(bidiGlobalDir), contentDir = soydata.getContentDir(text);
  if (null == contentDir) {
    var isHtml = opt_isHtml || soydata.isContentKind_(text, goog.soy.data.SanitizedContentKind.HTML);
    contentDir = goog.i18n.bidi.estimateDirection(text + "", isHtml);
  }
  return soydata.VERY_UNSAFE.ordainSanitizedHtmlAttribute(formatter.knownDirAttr(contentDir));
};
soy.$$bidiStartEdge = function(dir) {
  return 0 > dir ? "right" : "left";
};
soy.$$bidiEndEdge = function(dir) {
  return 0 > dir ? "left" : "right";
};
soy.$$bidiMark = function(dir) {
  return 0 > dir ? "\u200f" : "\u200e";
};
soy.$$bidiMarkAfter = function(bidiGlobalDir, text, opt_isHtml) {
  var formatter = soy.$$getBidiFormatterInstance_(bidiGlobalDir), isHtml = opt_isHtml || soydata.isContentKind_(text, goog.soy.data.SanitizedContentKind.HTML);
  return formatter.markAfterKnownDir(soydata.getContentDir(text), text + "", isHtml);
};
soy.$$bidiSpanWrap = function(bidiGlobalDir, text) {
  var formatter = soy.$$getBidiFormatterInstance_(bidiGlobalDir), html = goog.html.uncheckedconversions.safeHtmlFromStringKnownToSatisfyTypeContract(goog.string.Const.from("Soy |bidiSpanWrap is applied on an autoescaped text."), String(text)), wrappedHtml = formatter.spanWrapSafeHtmlWithKnownDir(soydata.getContentDir(text), html);
  return goog.html.SafeHtml.unwrap(wrappedHtml);
};
soy.$$bidiUnicodeWrap = function(bidiGlobalDir, text) {
  var formatter = soy.$$getBidiFormatterInstance_(bidiGlobalDir), isHtml = soydata.isContentKind_(text, goog.soy.data.SanitizedContentKind.HTML), wrappedText = formatter.unicodeWrapWithKnownDir(soydata.getContentDir(text), text + "", isHtml), wrappedTextDir = formatter.contextDir_;
  return soydata.isContentKind_(text, goog.soy.data.SanitizedContentKind.TEXT) ? soydata.markUnsanitizedText(wrappedText) : isHtml ? soydata.VERY_UNSAFE.ordainSanitizedHtml(wrappedText, wrappedTextDir) : wrappedText;
};
soy.asserts.assertType = function(condition, paramName, param, jsDocTypeStr) {
  if (goog.asserts.ENABLE_ASSERTS && !condition) {
    var msg = "expected param " + paramName + " of type " + jsDocTypeStr + (goog.DEBUG ? ", but got " + goog.debug.runtimeType(param) : "") + ".";
    goog.asserts.fail(msg);
  }
  return param;
};
soy.$$debugSoyTemplateInfo = !1;
goog.DEBUG && (soy.setDebugSoyTemplateInfo = function(debugSoyTemplateInfo) {
  soy.$$debugSoyTemplateInfo = debugSoyTemplateInfo;
});
soy.esc.$$escapeHtmlHelper = function(v) {
  return goog.string.htmlEscape(String(v));
};
soy.esc.$$escapeUriHelper = function(v) {
  return goog.string.urlEncode(String(v));
};
soy.esc.$$ESCAPE_MAP_FOR_NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_ = {"\x00":"&#0;", "\t":"&#9;", "\n":"&#10;", "\x0B":"&#11;", "\f":"&#12;", "\r":"&#13;", " ":"&#32;", '"':"&quot;", "&":"&amp;", "'":"&#39;", "-":"&#45;", "/":"&#47;", "<":"&lt;", "=":"&#61;", ">":"&gt;", "`":"&#96;", "\u0085":"&#133;", "\u00a0":"&#160;", "\u2028":"&#8232;", "\u2029":"&#8233;"};
soy.esc.$$REPLACER_FOR_NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_ = function(ch) {
  return soy.esc.$$ESCAPE_MAP_FOR_NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_[ch];
};
soy.esc.$$ESCAPE_MAP_FOR_ESCAPE_JS_STRING__AND__ESCAPE_JS_REGEX_ = {"\x00":"\\x00", "\b":"\\x08", "\t":"\\t", "\n":"\\n", "\x0B":"\\x0b", "\f":"\\f", "\r":"\\r", '"':"\\x22", $:"\\x24", "&":"\\x26", "'":"\\x27", "(":"\\x28", ")":"\\x29", "*":"\\x2a", "+":"\\x2b", ",":"\\x2c", "-":"\\x2d", ".":"\\x2e", "/":"\\/", ":":"\\x3a", "<":"\\x3c", "=":"\\x3d", ">":"\\x3e", "?":"\\x3f", "[":"\\x5b", "\\":"\\\\", "]":"\\x5d", "^":"\\x5e", "{":"\\x7b", "|":"\\x7c", "}":"\\x7d", "\u0085":"\\x85", "\u2028":"\\u2028", 
"\u2029":"\\u2029"};
soy.esc.$$REPLACER_FOR_ESCAPE_JS_STRING__AND__ESCAPE_JS_REGEX_ = function(ch) {
  return soy.esc.$$ESCAPE_MAP_FOR_ESCAPE_JS_STRING__AND__ESCAPE_JS_REGEX_[ch];
};
soy.esc.$$ESCAPE_MAP_FOR_ESCAPE_CSS_STRING_ = {"\x00":"\\0 ", "\b":"\\8 ", "\t":"\\9 ", "\n":"\\a ", "\x0B":"\\b ", "\f":"\\c ", "\r":"\\d ", '"':"\\22 ", "&":"\\26 ", "'":"\\27 ", "(":"\\28 ", ")":"\\29 ", "*":"\\2a ", "/":"\\2f ", ":":"\\3a ", ";":"\\3b ", "<":"\\3c ", "=":"\\3d ", ">":"\\3e ", "@":"\\40 ", "\\":"\\5c ", "{":"\\7b ", "}":"\\7d ", "\u0085":"\\85 ", "\u00a0":"\\a0 ", "\u2028":"\\2028 ", "\u2029":"\\2029 "};
soy.esc.$$REPLACER_FOR_ESCAPE_CSS_STRING_ = function(ch) {
  return soy.esc.$$ESCAPE_MAP_FOR_ESCAPE_CSS_STRING_[ch];
};
soy.esc.$$ESCAPE_MAP_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI__AND__FILTER_NORMALIZE_MEDIA_URI_ = {"\x00":"%00", "\u0001":"%01", "\u0002":"%02", "\u0003":"%03", "\u0004":"%04", "\u0005":"%05", "\u0006":"%06", "\u0007":"%07", "\b":"%08", "\t":"%09", "\n":"%0A", "\x0B":"%0B", "\f":"%0C", "\r":"%0D", "\u000e":"%0E", "\u000f":"%0F", "\u0010":"%10", "\u0011":"%11", "\u0012":"%12", "\u0013":"%13", "\u0014":"%14", "\u0015":"%15", "\u0016":"%16", "\u0017":"%17", "\u0018":"%18", "\u0019":"%19", "\u001a":"%1A", 
"\u001b":"%1B", "\u001c":"%1C", "\u001d":"%1D", "\u001e":"%1E", "\u001f":"%1F", " ":"%20", '"':"%22", "'":"%27", "(":"%28", ")":"%29", "<":"%3C", ">":"%3E", "\\":"%5C", "{":"%7B", "}":"%7D", "\u007f":"%7F", "\u0085":"%C2%85", "\u00a0":"%C2%A0", "\u2028":"%E2%80%A8", "\u2029":"%E2%80%A9", "\uff01":"%EF%BC%81", "\uff03":"%EF%BC%83", "\uff04":"%EF%BC%84", "\uff06":"%EF%BC%86", "\uff07":"%EF%BC%87", "\uff08":"%EF%BC%88", "\uff09":"%EF%BC%89", "\uff0a":"%EF%BC%8A", "\uff0b":"%EF%BC%8B", "\uff0c":"%EF%BC%8C", 
"\uff0f":"%EF%BC%8F", "\uff1a":"%EF%BC%9A", "\uff1b":"%EF%BC%9B", "\uff1d":"%EF%BC%9D", "\uff1f":"%EF%BC%9F", "\uff20":"%EF%BC%A0", "\uff3b":"%EF%BC%BB", "\uff3d":"%EF%BC%BD"};
soy.esc.$$REPLACER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI__AND__FILTER_NORMALIZE_MEDIA_URI_ = function(ch) {
  return soy.esc.$$ESCAPE_MAP_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI__AND__FILTER_NORMALIZE_MEDIA_URI_[ch];
};
soy.esc.$$MATCHER_FOR_NORMALIZE_HTML_ = /[\x00\x22\x27\x3c\x3e]/g;
soy.esc.$$MATCHER_FOR_ESCAPE_HTML_NOSPACE_ = /[\x00\x09-\x0d \x22\x26\x27\x2d\/\x3c-\x3e`\x85\xa0\u2028\u2029]/g;
soy.esc.$$MATCHER_FOR_NORMALIZE_HTML_NOSPACE_ = /[\x00\x09-\x0d \x22\x27\x2d\/\x3c-\x3e`\x85\xa0\u2028\u2029]/g;
soy.esc.$$MATCHER_FOR_ESCAPE_JS_STRING_ = /[\x00\x08-\x0d\x22\x26\x27\/\x3c-\x3e\x5b-\x5d\x7b\x7d\x85\u2028\u2029]/g;
soy.esc.$$MATCHER_FOR_ESCAPE_JS_REGEX_ = /[\x00\x08-\x0d\x22\x24\x26-\/\x3a\x3c-\x3f\x5b-\x5e\x7b-\x7d\x85\u2028\u2029]/g;
soy.esc.$$MATCHER_FOR_ESCAPE_CSS_STRING_ = /[\x00\x08-\x0d\x22\x26-\x2a\/\x3a-\x3e@\\\x7b\x7d\x85\xa0\u2028\u2029]/g;
soy.esc.$$MATCHER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI__AND__FILTER_NORMALIZE_MEDIA_URI_ = /[\x00- \x22\x27-\x29\x3c\x3e\\\x7b\x7d\x7f\x85\xa0\u2028\u2029\uff01\uff03\uff04\uff06-\uff0c\uff0f\uff1a\uff1b\uff1d\uff1f\uff20\uff3b\uff3d]/g;
soy.esc.$$FILTER_FOR_FILTER_CSS_VALUE_ = /^(?!-*(?:expression|(?:moz-)?binding))(?:(?:[.#]?-?(?:[_a-z0-9-]+)(?:-[_a-z0-9-]+)*-?|(?:rgb|hsl)a?\([0-9.%,\u0020]+\)|-?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[a-z]{1,4}|%)?|!important)(?:\s+|$))*$/i;
soy.esc.$$FILTER_FOR_FILTER_NORMALIZE_URI_ = /^(?![^#?]*\/(?:\.|%2E){2}(?:[\/?#]|$))(?:(?:https?|mailto):|[^&:\/?#]*(?:[\/?#]|$))/i;
soy.esc.$$FILTER_FOR_FILTER_NORMALIZE_MEDIA_URI_ = /^[^&:\/?#]*(?:[\/?#]|$)|^https?:|^data:image\/[a-z0-9+]+;base64,[a-z0-9+\/]+=*$|^blob:/i;
soy.esc.$$FILTER_FOR_FILTER_IMAGE_DATA_URI_ = /^data:image\/(?:bmp|gif|jpe?g|png|tiff|webp);base64,[a-z0-9+\/]+=*$/i;
soy.esc.$$FILTER_FOR_FILTER_SIP_URI_ = /^sip:[0-9a-z;=\-+._!~*'\u0020\/():&$#?@,]+$/i;
soy.esc.$$FILTER_FOR_FILTER_SMS_URI_ = /^sms:[0-9a-z;=\-+._!~*'\u0020\/():&$#?@,]+$/i;
soy.esc.$$FILTER_FOR_FILTER_TEL_URI_ = /^tel:[0-9a-z;=\-+._!~*'\u0020\/():&$#?@,]+$/i;
soy.esc.$$FILTER_FOR_FILTER_HTML_ATTRIBUTES_ = /^(?!on|src|(?:action|archive|background|cite|classid|codebase|content|data|dsync|href|http-equiv|longdesc|style|usemap)\s*$)(?:[a-z0-9_$:-]*)$/i;
soy.esc.$$FILTER_FOR_FILTER_HTML_ELEMENT_NAME_ = /^(?!base|iframe|link|no|script|style|textarea|title|xmp)[a-z0-9_$:-]*$/i;
soy.esc.$$normalizeHtmlHelper = function(value) {
  return String(value).replace(soy.esc.$$MATCHER_FOR_NORMALIZE_HTML_, soy.esc.$$REPLACER_FOR_NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_);
};
soy.esc.$$escapeHtmlNospaceHelper = function(value) {
  return String(value).replace(soy.esc.$$MATCHER_FOR_ESCAPE_HTML_NOSPACE_, soy.esc.$$REPLACER_FOR_NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_);
};
soy.esc.$$normalizeHtmlNospaceHelper = function(value) {
  return String(value).replace(soy.esc.$$MATCHER_FOR_NORMALIZE_HTML_NOSPACE_, soy.esc.$$REPLACER_FOR_NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_);
};
soy.esc.$$escapeJsStringHelper = function(value) {
  return String(value).replace(soy.esc.$$MATCHER_FOR_ESCAPE_JS_STRING_, soy.esc.$$REPLACER_FOR_ESCAPE_JS_STRING__AND__ESCAPE_JS_REGEX_);
};
soy.esc.$$escapeJsRegexHelper = function(value) {
  return String(value).replace(soy.esc.$$MATCHER_FOR_ESCAPE_JS_REGEX_, soy.esc.$$REPLACER_FOR_ESCAPE_JS_STRING__AND__ESCAPE_JS_REGEX_);
};
soy.esc.$$escapeCssStringHelper = function(value) {
  return String(value).replace(soy.esc.$$MATCHER_FOR_ESCAPE_CSS_STRING_, soy.esc.$$REPLACER_FOR_ESCAPE_CSS_STRING_);
};
soy.esc.$$filterCssValueHelper = function(value) {
  var str = String(value);
  return soy.esc.$$FILTER_FOR_FILTER_CSS_VALUE_.test(str) ? str : (goog.asserts.fail("Bad value `%s` for |filterCssValue", [str]), "zSoyz");
};
soy.esc.$$normalizeUriHelper = function(value) {
  return String(value).replace(soy.esc.$$MATCHER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI__AND__FILTER_NORMALIZE_MEDIA_URI_, soy.esc.$$REPLACER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI__AND__FILTER_NORMALIZE_MEDIA_URI_);
};
soy.esc.$$filterNormalizeUriHelper = function(value) {
  var str = String(value);
  return soy.esc.$$FILTER_FOR_FILTER_NORMALIZE_URI_.test(str) ? str.replace(soy.esc.$$MATCHER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI__AND__FILTER_NORMALIZE_MEDIA_URI_, soy.esc.$$REPLACER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI__AND__FILTER_NORMALIZE_MEDIA_URI_) : (goog.asserts.fail("Bad value `%s` for |filterNormalizeUri", [str]), "about:invalid#zSoyz");
};
soy.esc.$$filterNormalizeMediaUriHelper = function(value) {
  var str = String(value);
  return soy.esc.$$FILTER_FOR_FILTER_NORMALIZE_MEDIA_URI_.test(str) ? str.replace(soy.esc.$$MATCHER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI__AND__FILTER_NORMALIZE_MEDIA_URI_, soy.esc.$$REPLACER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI__AND__FILTER_NORMALIZE_MEDIA_URI_) : (goog.asserts.fail("Bad value `%s` for |filterNormalizeMediaUri", [str]), "about:invalid#zSoyz");
};
soy.esc.$$filterImageDataUriHelper = function(value) {
  var str = String(value);
  return soy.esc.$$FILTER_FOR_FILTER_IMAGE_DATA_URI_.test(str) ? str : (goog.asserts.fail("Bad value `%s` for |filterImageDataUri", [str]), "data:image/gif;base64,zSoyz");
};
soy.esc.$$filterSipUriHelper = function(value) {
  var str = String(value);
  return soy.esc.$$FILTER_FOR_FILTER_SIP_URI_.test(str) ? str : (goog.asserts.fail("Bad value `%s` for |filterSipUri", [str]), "about:invalid#zSoyz");
};
soy.esc.$$filterSmsUriHelper = function(value) {
  var str = String(value);
  return soy.esc.$$FILTER_FOR_FILTER_SMS_URI_.test(str) ? str : (goog.asserts.fail("Bad value `%s` for |filterSmsUri", [str]), "about:invalid#zSoyz");
};
soy.esc.$$filterTelUriHelper = function(value) {
  var str = String(value);
  return soy.esc.$$FILTER_FOR_FILTER_TEL_URI_.test(str) ? str : (goog.asserts.fail("Bad value `%s` for |filterTelUri", [str]), "about:invalid#zSoyz");
};
soy.esc.$$filterHtmlAttributesHelper = function(value) {
  var str = String(value);
  return soy.esc.$$FILTER_FOR_FILTER_HTML_ATTRIBUTES_.test(str) ? str : (goog.asserts.fail("Bad value `%s` for |filterHtmlAttributes", [str]), "zSoyz");
};
soy.esc.$$filterHtmlElementNameHelper = function(value) {
  var str = String(value);
  return soy.esc.$$FILTER_FOR_FILTER_HTML_ELEMENT_NAME_.test(str) ? str : (goog.asserts.fail("Bad value `%s` for |filterHtmlElementName", [str]), "zSoyz");
};
soy.esc.$$HTML_TAG_REGEX_ = /<(?:!|\/?([a-zA-Z][a-zA-Z0-9:\-]*))(?:[^>'"]|"[^"]*"|'[^']*')*>/g;
soy.esc.$$LT_REGEX_ = /</g;
soy.esc.$$SAFE_TAG_WHITELIST_ = {b:!0, br:!0, em:!0, i:!0, s:!0, strong:!0, sub:!0, sup:!0, u:!0};
soy.esc.$$HTML_ATTRIBUTE_REGEX_ = /([a-zA-Z][a-zA-Z0-9:\-]*)[\t\n\r\u0020]*=[\t\n\r\u0020]*("[^"]*"|'[^']*')/g;

