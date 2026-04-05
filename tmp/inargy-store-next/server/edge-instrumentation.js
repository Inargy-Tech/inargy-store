// runtime can't be in strict mode because a global variable is assign and maybe created.
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunk_N_E"] = self["webpackChunk_N_E"] || []).push([["instrumentation"],{

/***/ "(instrument)/./src/instrumentation.js":
/*!********************************!*\
  !*** ./src/instrumentation.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   register: () => (/* binding */ register)\n/* harmony export */ });\nfunction register() {\n    // Node.js v25+ exposes a global `localStorage` when --localstorage-file is\n    // set, but Next.js's dev server sets it without a valid path, making\n    // localStorage.getItem throw. Remove the broken global so libraries that\n    // check `typeof localStorage !== 'undefined'` fall through to safe defaults.\n    if ( true && typeof localStorage !== 'undefined') {\n        try {\n            localStorage.getItem('__probe__');\n        } catch  {\n            delete globalThis.localStorage;\n        }\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGluc3RydW1lbnQpLy4vc3JjL2luc3RydW1lbnRhdGlvbi5qcyIsIm1hcHBpbmdzIjoiOzs7O0FBQU8sU0FBU0E7SUFDZCwyRUFBMkU7SUFDM0UscUVBQXFFO0lBQ3JFLHlFQUF5RTtJQUN6RSw2RUFBNkU7SUFDN0UsSUFBSSxLQUE2QixJQUFJLE9BQU9DLGlCQUFpQixhQUFhO1FBQ3hFLElBQUk7WUFDRkEsYUFBYUMsT0FBTyxDQUFDO1FBQ3ZCLEVBQUUsT0FBTTtZQUNOLE9BQU9DLFdBQVdGLFlBQVk7UUFDaEM7SUFDRjtBQUNGIiwic291cmNlcyI6WyIvVXNlcnMvb2FvL0RvY3VtZW50cy9HaXRIdWIvY2xhdWRlLXRlc3QvaW5hcmd5LXN0b3JlL3NyYy9pbnN0cnVtZW50YXRpb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyKCkge1xuICAvLyBOb2RlLmpzIHYyNSsgZXhwb3NlcyBhIGdsb2JhbCBgbG9jYWxTdG9yYWdlYCB3aGVuIC0tbG9jYWxzdG9yYWdlLWZpbGUgaXNcbiAgLy8gc2V0LCBidXQgTmV4dC5qcydzIGRldiBzZXJ2ZXIgc2V0cyBpdCB3aXRob3V0IGEgdmFsaWQgcGF0aCwgbWFraW5nXG4gIC8vIGxvY2FsU3RvcmFnZS5nZXRJdGVtIHRocm93LiBSZW1vdmUgdGhlIGJyb2tlbiBnbG9iYWwgc28gbGlicmFyaWVzIHRoYXRcbiAgLy8gY2hlY2sgYHR5cGVvZiBsb2NhbFN0b3JhZ2UgIT09ICd1bmRlZmluZWQnYCBmYWxsIHRocm91Z2ggdG8gc2FmZSBkZWZhdWx0cy5cbiAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBsb2NhbFN0b3JhZ2UgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdfX3Byb2JlX18nKVxuICAgIH0gY2F0Y2gge1xuICAgICAgZGVsZXRlIGdsb2JhbFRoaXMubG9jYWxTdG9yYWdlXG4gICAgfVxuICB9XG59XG4iXSwibmFtZXMiOlsicmVnaXN0ZXIiLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwiZ2xvYmFsVGhpcyJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(instrument)/./src/instrumentation.js\n");

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__("(instrument)/./src/instrumentation.js"));
/******/ (_ENTRIES = typeof _ENTRIES === "undefined" ? {} : _ENTRIES).middleware_instrumentation = __webpack_exports__;
/******/ }
]);