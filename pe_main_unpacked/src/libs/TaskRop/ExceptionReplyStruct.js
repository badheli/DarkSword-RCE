/***/ "./src/libs/TaskRop/ExceptionReplyStruct.js":
/*!**************************************************!*\
  !*** ./src/libs/TaskRop/ExceptionReplyStruct.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ExceptionReplyStruct)
/* harmony export */ });
/* harmony import */ var _MachMsgHeaderStruct__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./MachMsgHeaderStruct */ "./src/libs/TaskRop/MachMsgHeaderStruct.js");
/* harmony import */ var _ThreadState__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ThreadState */ "./src/libs/TaskRop/ThreadState.js");



class ExceptionReplyStruct 
{
	#buffer;
	#dataView;

	constructor(buffer) {
		this.#buffer = buffer;
		this.#dataView = new DataView(this.#buffer);
		this.Head = new _MachMsgHeaderStruct__WEBPACK_IMPORTED_MODULE_0__["default"](this.#buffer);
		this.threadState = new _ThreadState__WEBPACK_IMPORTED_MODULE_1__["default"](this.#buffer,44);
	}

	get NDR() { return this.#dataView.getBigUint64(24,true); }
	set NDR(value) { this.#dataView.setBigUint64(24,value,true); }

	get RetCode() { return this.#dataView.getUint32(32,true); }
	set RetCode(value) { this.#dataView.setUint32(32,value,true); }

	get flavor() { return this.#dataView.getUint32(36,true); }
	set flavor(value) { this.#dataView.setUint32(36,value,true); }
	
	get new_stateCnt() { return this.#dataView.getUint32(40,true); }
	set new_stateCnt(value) { this.#dataView.setUint32(40,value,true); }
}

/***/ }),
