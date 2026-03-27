/* harmony export */

/* harmony import */
var libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__ = require(/*! libs/Chain/Chain */"../Chain/Chain.js");
/* harmony import */
var libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_1__ = require(/*! libs/JSUtils/Utils */"../JSUtils/Utils.js");
/* harmony import */
var _Task__WEBPACK_IMPORTED_MODULE_2__ = require(/*! ./Task */"./Task.js");
const TAG = "TASKROP";
export default class TaskRop {
  static init() {
    let selfTaskAddr = libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__.default.getSelfTaskAddr();
    if (!selfTaskAddr) {
      console.log(TAG, `Unable to find self task address`);
      return;
    }
    console.log(TAG, `selfTaskAddr:${libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_1__.default.hex(selfTaskAddr)}`);
    _Task__WEBPACK_IMPORTED_MODULE_2__.default.init(selfTaskAddr);
  }
}
/***/