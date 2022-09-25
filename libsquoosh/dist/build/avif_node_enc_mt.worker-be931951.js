"use strict";var require$$0=require("worker_threads"),require$$1=require("fs");function _interopDefaultLegacy(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}function _interopNamespace(e){if(e&&e.__esModule)return e;var r=Object.create(null);return e&&Object.keys(e).forEach((function(t){if("default"!==t){var a=Object.getOwnPropertyDescriptor(e,t);Object.defineProperty(r,t,a.get?a:{enumerable:!0,get:function(){return e[t]}})}})),r.default=e,Object.freeze(r)}var require$$0__default=_interopDefaultLegacy(require$$0),require$$1__default=_interopDefaultLegacy(require$$1),commonjsGlobal="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};function commonjsRequire(e){throw new Error('Could not dynamically require "'+e+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var Module={};if("object"==typeof process&&"object"==typeof process.versions&&"string"==typeof process.versions.node){var nodeWorkerThreads=require$$0__default.default,parentPort=nodeWorkerThreads.parentPort;parentPort&&parentPort.on("message",(function(e){onmessage({data:e})}));var nodeFS=require$$1__default.default;Object.assign(commonjsGlobal,{self:commonjsGlobal,require:commonjsRequire,Module:Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:function(e){(0,eval)(nodeFS.readFileSync(e,"utf8"))},postMessage:function(e){parentPort.postMessage(e)},performance:commonjsGlobal.performance||{now:function(){return Date.now()}}})}var initializedJS=!1;function threadPrintErr(){var e=Array.prototype.slice.call(arguments).join(" ");console.error(e)}function threadAlert(){var e=Array.prototype.slice.call(arguments).join(" ");postMessage({cmd:"alert",text:e,threadId:Module._pthread_self()})}var err=threadPrintErr;function moduleLoaded(){}self.alert=threadAlert,Module.instantiateWasm=function(e,r){var t=new WebAssembly.Instance(Module.wasmModule,e);return r(t),Module.wasmModule=null,t.exports},self.onmessage=function(e){try{if("load"===e.data.cmd)Module.wasmModule=e.data.wasmModule,Module.wasmMemory=e.data.wasmMemory,Module.buffer=Module.wasmMemory.buffer,Module.ENVIRONMENT_IS_PTHREAD=!0,(e.data.urlOrBlob?Promise.resolve().then((function(){return _interopNamespace(require(e.data.urlOrBlob))})):Promise.resolve().then((function(){return require("./avif_node_enc_mt-143090b9.js")}))).then((function(e){return e.default(Module)})).then((function(e){Module=e,moduleLoaded()}));else if("objectTransfer"===e.data.cmd)Module.PThread.receiveObjectTransfer(e.data);else if("run"===e.data.cmd){Module.__performance_now_clock_drift=performance.now()-e.data.time,Module.__emscripten_thread_init(e.data.threadInfoStruct,0,0);var r=e.data.stackBase,t=e.data.stackBase+e.data.stackSize;Module.establishStackSpace(t,r),Module.PThread.receiveObjectTransfer(e.data),Module.PThread.threadInit(),initializedJS||(Module.___embind_register_native_and_builtin_types(),initializedJS=!0);try{var a=Module.invokeEntryPoint(e.data.start_routine,e.data.arg);Module.keepRuntimeAlive()?Module.PThread.setExitStatus(a):Module.PThread.threadExit(a)}catch(e){if("Canceled!"===e)Module.PThread.threadCancel();else if("unwind"!=e){if(!(e instanceof Module.ExitStatus))throw Module.PThread.threadExit(-2),e;Module.keepRuntimeAlive()||Module.PThread.threadExit(e.status)}}}else"cancel"===e.data.cmd?Module._pthread_self()&&Module.PThread.threadCancel():"setimmediate"===e.data.target||("processThreadQueue"===e.data.cmd?Module._pthread_self()&&Module._emscripten_current_thread_process_queued_calls():(err("worker.js received unknown command "+e.data.cmd),err(e.data)))}catch(e){throw err("worker.js onmessage() captured an uncaught exception: "+e),e&&e.stack&&err(e.stack),e}};var avif_node_enc_mt_worker={};module.exports=avif_node_enc_mt_worker;