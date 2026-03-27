#!/usr/bin/env python3
"""
unpack_webpack.py — Extract webpack bundle modules to individual files,
                    then replace each extracted block in the original JS
                    with a comment pointing to the written file.

Usage:
    python unpack_webpack.py <input_js_file> <output_dir> [options]

Each webpack module block (opened by a ``  !*** path ***!`` line and
closed by ``/***/ })`` or ``/******/ }()``) is extracted and written
to a file whose path mirrors the module key.
The original JS is then rewritten in-place: every extracted block is
replaced by a single comment line, e.g.:

    /* [extracted] output/node_modules/foo/bar.js */
"""

import re
import sys
import os
import argparse
from pathlib import Path


# ---------------------------------------------------------------------------
# Patterns
# ---------------------------------------------------------------------------
# A module block opens with a line like:
#     !*** ./node_modules/foo/bar.js ***!
# (two leading spaces, then !*** ... ***!)
MODULE_START_RE = re.compile(r'^  !\*\*\*')

# Extract the module path from the opening line.
# The path sits between the leading  "!*+ " and the trailing " *+!" markers.
MODULE_PATH_RE = re.compile(r'!\*+ (.+?) \*+!')

# A module block closes with one of:
#   /******/ }()     ← IIFE-style, no extra )   (6 stars)
#   /******/ })()    ← IIFE-style, with extra )  (6 stars)
#   /***/ })         ← standard closure          (3 stars)
#
# The 6-star variants are unified via \)? (optional closing paren before the
# IIFE call parens), so a single branch covers both /******/ }() and })().
MODULE_END_RE = re.compile(r'^/\*{6}/ \}\)?\(\)|^/\*{3}/ \}\)')

# When the !*** line is matched, look back two lines to check for the full
# module header block:
#
#   /***/ "./src/libs/Driver/OffsetsTable.js":   ← PRE1: /***/ " prefix
#   /*!*****************************************!*\
#                                                ← PRE2: /*!** prefix
#     !*** ./src/libs/Driver/OffsetsTable.js ***!  ← MODULE_START_RE matches here
#     \*****************************************/
#   /***/ ((...) => {
#
# If both PRE lines are present they belong to the same block and must be
# included in raw_block so that the rewrite step can replace them too.
BLOCK_PRE1_RE = re.compile(r'^/\*\*\*/ "')   # /***/ "path":
BLOCK_PRE2_RE = re.compile(r'^/\*!\*+')       # /*!****...

# Matches the harmony-default-export inline string pattern:
#   /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("...");
#
# Capture group 1 holds the raw JS-escaped string content between ("  and  ").
# The inner pattern  (?:[^"\\]|\\.)*  handles escaped characters correctly:
#   [^"\\]  — any char that is neither a quote nor a backslash
#   \\.     — a backslash followed by any char (escape sequence)
HARMONY_EXPORT_RE = re.compile(
    r'/\* harmony default export \*/ const __WEBPACK_DEFAULT_EXPORT__ = \('
    r'"((?:[^"\\]|\\.)*)"'
    r'\);'
)


# ---------------------------------------------------------------------------
# Path helpers
# ---------------------------------------------------------------------------

def sanitize_path(module_key: str) -> str:
    """
    Convert a webpack module key into a safe relative filesystem path.

    Rules
    -----
    * Strip a leading "./" or "/"
    * On Windows, colons are replaced with "_" (illegal in filenames).
    * The "!" loader separator is kept as-is so the full loader chain is
      visible in the filename (e.g. raw-loader!./src/file.js).
    """
    path = module_key
    path = re.sub(r'^\./', '', path)
    path = re.sub(r'^/', '', path)
    if os.name == 'nt':
        path = path.replace(':', '_')
    return path


# ---------------------------------------------------------------------------
# JS string decoding
# ---------------------------------------------------------------------------

# Maps single-character JS escape letters to their actual characters.
_JS_SIMPLE_ESCAPES = {
    'n':  '\n',
    't':  '\t',
    'r':  '\r',
    '\\': '\\',
    '"':  '"',
    "'":  "'",
    '0':  '\x00',
    'b':  '\b',
    'f':  '\f',
    'v':  '\v',
}

# Matches any JS escape sequence inside a string.
_JS_ESCAPE_RE = re.compile(
    r'\\(?:'
    r'u\{([0-9a-fA-F]+)\}'      # \u{HHHH…}  — variable-length Unicode
    r'|u([0-9a-fA-F]{4})'       # \uHHHH     — 4-digit Unicode
    r'|x([0-9a-fA-F]{2})'       # \xHH       — 2-digit hex
    r'|(.))'                     # \<any>     — simple escape
)


def decode_js_string(raw: str) -> str:
    """
    Decode a JS-escaped string (as it appears inside JS string literal quotes)
    into its actual character content.

    Handles: \\n \\t \\r \\\\ \\" \\' \\0 \\b \\f \\v
             \\xHH  \\uHHHH  \\u{HHHH…}
    Any unrecognised escape  \\X  is passed through as-is.
    """
    def replace(m: re.Match) -> str:
        uni_var, uni4, hex2, simple = m.groups()
        if uni_var is not None:
            return chr(int(uni_var, 16))
        if uni4 is not None:
            return chr(int(uni4, 16))
        if hex2 is not None:
            return chr(int(hex2, 16))
        # simple single-char escape
        return _JS_SIMPLE_ESCAPES.get(simple, simple)

    return _JS_ESCAPE_RE.sub(replace, raw)


def expand_harmony_exports(content: str) -> tuple[str, int]:
    """
    Scan *content* for harmony-default-export inline string lines, decode
    each captured JS string, and replace the entire original expression with
    the decoded source text.

    Returns (new_content, replacement_count).

    Example transformation
    ----------------------
    Input line:
        /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("function foo(){\n  return 1;\n}");

    Output (replaces the whole line):
        function foo(){
          return 1;
        }
    """
    count = 0

    def replacer(m: re.Match) -> str:
        nonlocal count
        decoded = decode_js_string(m.group(1))
        count += 1
        return decoded

    new_content = HARMONY_EXPORT_RE.sub(replacer, content)
    return new_content, count


# ---------------------------------------------------------------------------
# Extraction
# ---------------------------------------------------------------------------

def extract_modules(js_text: str):
    """
    Yield (module_key, raw_block) tuples from a webpack bundle.

    raw_block is the *exact* text of the module block as it appears in
    js_text so it can be used for an exact string replacement later.

    Module header structure (all four lines are included in raw_block)
    ------------------------------------------------------------------
    /***/ "./src/libs/Driver/OffsetsTable.js":       ← PRE1
    /*!*****************************************!*\\  ← PRE2
      !*** ./src/libs/Driver/OffsetsTable.js ***!    ← MODULE_START_RE (path here)
      \\*****************************************/
    /***/ ((__unused_webpack_module, ...) => {
    ...
    /***/ })                                         ← MODULE_END_RE

    Algorithm
    ---------
    1. While not collecting, maintain a 2-line sliding window (prev_lines).
    2. When MODULE_START_RE matches:
         a. Extract the module path via MODULE_PATH_RE.
         b. Check whether prev_lines[-2] matches BLOCK_PRE1_RE and
            prev_lines[-1] matches BLOCK_PRE2_RE.
            If so, prepend both lines to the buffer so raw_block covers
            the complete header.
         c. Start collecting.
    3. While collecting, accumulate lines.
       When MODULE_END_RE matches, flush and reset.
    """
    from collections import deque

    lines = js_text.splitlines(keepends=True)

    current_key = None
    collecting = False
    buffer = []
    # Sliding window of the last 2 lines seen *before* a block starts.
    prev_lines: deque = deque(maxlen=2)

    for line in lines:
        stripped = line.rstrip('\n').rstrip('\r')

        if not collecting:
            if MODULE_START_RE.match(stripped):
                # Extract module path from the !*** line.
                path_match = MODULE_PATH_RE.search(stripped)
                current_key = path_match.group(1).strip() if path_match else stripped.strip()
                collecting = True

                # Check whether the two preceding lines form the standard
                # webpack module header (PRE1 + PRE2).  If so, include them
                # in raw_block so the rewrite step can replace the full header.
                if (
                    len(prev_lines) == 2
                    and BLOCK_PRE1_RE.match(prev_lines[0].rstrip('\n').rstrip('\r'))
                    and BLOCK_PRE2_RE.match(prev_lines[1].rstrip('\n').rstrip('\r'))
                ):
                    buffer = [prev_lines[0], prev_lines[1], line]
                else:
                    buffer = [line]

                # Reset the window; its contents are now owned by this block.
                prev_lines.clear()
            else:
                prev_lines.append(line)
        else:
            buffer.append(line)
            if MODULE_END_RE.match(stripped):
                yield current_key, ''.join(buffer)
                current_key = None
                collecting = False
                buffer = []

    # Flush any unclosed block at EOF
    if collecting and current_key and buffer:
        yield current_key, ''.join(buffer)


# ---------------------------------------------------------------------------
# File writing
# ---------------------------------------------------------------------------

def write_module(output_dir: Path, module_key: str, content: str) -> Path:
    """Write *content* to <output_dir>/<sanitized_module_key>.

    Directory creation
    ------------------
    dest_file.parent.mkdir(parents=True, exist_ok=True) is called
    unconditionally right before writing so the full directory chain
    always exists, even when file_part contains embedded sub-path
    components (e.g. "cjs.js!./src/app.js").
    """
    rel = sanitize_path(module_key)

    # The "!" loader separator keeps everything after it as part of the
    # *filename*, not as subdirectories.
    if '!' in rel:
        # e.g. "node_modules/raw-loader/dist/cjs.js!./src/app.js"
        #   dir_part  → "node_modules/raw-loader/dist"
        #   file_part → "cjs.js!./src/app.js"
        last_slash = rel.rfind('/', 0, rel.index('!'))
        if last_slash != -1:
            dir_part = rel[:last_slash]
            file_part = rel[last_slash + 1:]
        else:
            dir_part = ''
            file_part = rel
    else:
        dir_part = os.path.dirname(rel)
        file_part = os.path.basename(rel)

    if not file_part:
        file_part = '_index'

    dest_dir = output_dir / dir_part if dir_part else output_dir
    dest_file = dest_dir / file_part

    # Ensure the parent directory (and all ancestors) exist before writing.
    dest_file.parent.mkdir(parents=True, exist_ok=True)

    # Expand any harmony-default-export inline strings before saving.
    content, n_harmony = expand_harmony_exports(content)
    _ = n_harmony  # count available for callers who want it; ignored here

    dest_file.write_text(content, encoding='utf-8')
    return dest_file


# ---------------------------------------------------------------------------
# JS rewriting
# ---------------------------------------------------------------------------

def rewrite_js(js_text: str, replacements: list) -> str:
    """
    Return a new version of *js_text* where every extracted module block
    has been replaced by a single comment line.

    Parameters
    ----------
    replacements : list of (raw_block: str, dest_file: Path)
        Each tuple describes one block and the file it was written to.
    """
    for raw_block, dest_file in replacements:
        comment = f'/* [extracted] {dest_file} */\n'
        js_text = js_text.replace(raw_block, comment, 1)
    return js_text


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description=(
            'Extract webpack bundle modules to individual files and '
            'replace each block in the original JS with a comment.'
        )
    )
    parser.add_argument('input_js', help='Path to the webpack bundle JS file.')
    parser.add_argument('output_dir', help='Directory to write extracted modules into.')
    parser.add_argument(
        '--encoding', default='utf-8',
        help='Encoding of the input file (default: utf-8).',
    )
    parser.add_argument(
        '--no-rewrite', action='store_true',
        help='Skip rewriting the original JS file (extract only).',
    )
    parser.add_argument(
        '--verbose', '-v', action='store_true',
        help='Print each extracted file path.',
    )
    args = parser.parse_args()

    input_path = Path(args.input_js)
    if not input_path.is_file():
        print(f'[ERROR] Input file not found: {input_path}', file=sys.stderr)
        sys.exit(1)

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f'[*] Reading {input_path} …')
    js_text = input_path.read_text(encoding=args.encoding, errors='replace')

    # ── Phase 1: extract all modules ────────────────────────────────────────
    replacements = []   # [(raw_block, dest_file), ...]
    count = 0

    for key, raw_block in extract_modules(js_text):
        dest = write_module(output_dir, key, raw_block)
        replacements.append((raw_block, dest))
        count += 1
        if args.verbose:
            # Re-check harmony count just for the log line (cheap on already-written content)
            _, n_h = expand_harmony_exports(raw_block)
            harmony_tag = f'  [harmony×{n_h}]' if n_h else ''
            print(f'    [{count:4d}] {dest}{harmony_tag}')

    print(f'[+] Extracted {count} module(s) to: {output_dir}')

    # ── Phase 2: rewrite the original JS ────────────────────────────────────
    if not args.no_rewrite and replacements:
        print(f'[*] Rewriting {input_path} — replacing {count} block(s) with comments …')
        new_js = rewrite_js(js_text, replacements)
        input_path.write_text(new_js, encoding=args.encoding)
        print(f'[+] Done — original JS updated.')
    elif args.no_rewrite:
        print('[*] --no-rewrite flag set, original JS left unchanged.')
    else:
        print('[*] No modules found, original JS left unchanged.')


if __name__ == '__main__':
    main()
