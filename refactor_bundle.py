import re
import os
import shutil
import argparse
import textwrap
from pathlib import Path

def unescape_js_string(s: str) -> str:
 s = s.replace('\\\\', '\\')
 s = s.replace('\\"', '"')
 s = s.replace("\\'", "'")
 s = s.replace('\\n', '\n')
 s = s.replace('\\r', '\r')
 s = s.replace('\\t', '\t')
 return s

def process_bundle_content(content: str, output_dir: Path, input_file_path: Path, top_level_replacements: list = None, recursion_level: int = 0):
 prefix = f"[L{recursion_level}]"
 print(f"{prefix} Searching for modules...")

 module_finder_regex = re.compile(
     r'/\*\*\*/\s*"(?P<path>.+?)":\s*/\*!.*?\*/\s*/\*\*\*/\s*\((?:.*?)\)\s*=>\s*\{(?P<code>.*?)'
     r'/\*\*\*/\s*\}\)',
     re.DOTALL
 )

 # This regex just finds raw-loaded strings, it no longer tries to guess if it's a bundle.
 raw_string_regex = re.compile(
     r'const __WEBPACK_DEFAULT_EXPORT__ = \("((?:.|\s)*?)"\);?',
     re.DOTALL
 )

 modules_found = 0
 for match in module_finder_regex.finditer(content):
     modules_found += 1
     module_path_str = match.group('path')
     raw_code = match.group('code').strip()

     clean_path_str = module_path_str[2:] if module_path_str.startswith('./') else module_path_str
     clean_path_str = clean_path_str.replace('!', '_')
     output_file_path = output_dir / clean_path_str
     
     # Check if the module's code is a raw-loaded string export
     raw_content_match = raw_string_regex.search(raw_code)
     
     is_processed = False
     if raw_content_match:
         # It's a raw-loaded module. Now decide if it's a nested bundle or just a plain string.
         string_content_escaped = raw_content_match.group(1)
         string_content_unescaped = unescape_js_string(string_content_escaped)

         # --- FIX: Use a much more robust heuristic to detect a nested bundle ---
         if string_content_unescaped.strip().startswith('/******/ (() => { // webpackBootstrap'):
             print(f"{prefix} Found nested bundle in module: {module_path_str}")
             is_processed = True
             process_bundle_content(string_content_unescaped, output_dir, input_file_path, None, recursion_level + 1)
         else:
             # It's just a raw string file. Save the unescaped content.
             final_code = string_content_unescaped
             print(f"{prefix} -> Extracted raw string module to: {output_file_path}")
             is_processed = True
             output_file_path.parent.mkdir(parents=True, exist_ok=True)
             try:
                 with open(output_file_path, 'w', encoding='utf-8') as out_f:
                     out_f.write(final_code)
             except Exception as e:
                 print(f"{prefix} [!] Could not write file '{output_file_path}'. Reason: {e}")

     if not is_processed:
         # It's a normal code module
         dedented_code = textwrap.dedent(raw_code)
         export_pattern = r'/\* harmony default export \*/\s*const __WEBPACK_DEFAULT_EXPORT__ = \((.+)\);?'
         processed_code = re.sub(r'(?s)' + export_pattern, r'export default \1;', dedented_code)
         final_code = processed_code.strip()
         print(f"{prefix} -> Extracted regular module to: {output_file_path}")

         output_file_path.parent.mkdir(parents=True, exist_ok=True)
         try:
             with open(output_file_path, 'w', encoding='utf-8') as out_f:
                 out_f.write(final_code)
         except Exception as e:
             print(f"{prefix} [!] Could not write file '{output_file_path}'. Reason: {e}")

     if recursion_level == 0 and top_level_replacements is not None:
         start = match.start('code')
         end = match.end('code')
         
         try:
             relative_path = os.path.relpath(output_file_path, start=input_file_path.parent)
             relative_path = str(Path(relative_path)).replace(os.path.sep, '/')
             if not relative_path.startswith('.'):
                 relative_path = './' + relative_path

             replacement_code = f" module.exports = require('{relative_path}'); "
             top_level_replacements.append((start, end, replacement_code))
         except ValueError as e:
              print(f"[!] Could not calculate relative path for replacement. Error: {e}")

 if modules_found == 0:
     print(f"{prefix} No modules found at this level.")

def main():
 parser = argparse.ArgumentParser(
     description="A recursive tool to unpack and refactor webpack modules.",
     epilog="Example: python refactor_bundle.py rce_module.js ./unpacked --refactor"
 )
 parser.add_argument("input_file", type=str, help="Path to the input webpack bundle .js file.")
 parser.add_argument("output_dir", type=str, help="Path to the directory where source files will be saved.")
 parser.add_argument("--refactor", action="store_true", help="Refactor the input file by replacing inline modules with requires.")
 
 args = parser.parse_args()
 
 input_path = Path(args.input_file)
 output_path = Path(args.output_dir)

 if args.refactor:
     backup_path = input_path.with_suffix(input_path.suffix + '.bak')
     print(f"[*] --refactor enabled. Creating backup: {backup_path}")
     try:
         shutil.copyfile(input_path, backup_path)
     except Exception as e:
         print(f"[!] Critical: Could not create backup file. Aborting. Reason: {e}")
         return

 print(f"[*] Starting unpack process for: {input_path}")
 try:
     with open(input_path, 'r', encoding='utf-8') as f:
         initial_content = f.read()
     
     replacements = [] if args.refactor else None
     
     process_bundle_content(initial_content, output_path, input_path, replacements)
     
     if args.refactor:
         print(f"[*] Refactoring input file with external references...")
         if not replacements:
             print("[!] No modules found to refactor in the top-level bundle.")
         else:
             replacements.sort(key=lambda r: r[0], reverse=True)
             
             content_list = list(initial_content)
             for start, end, code in replacements:
                 content_list[start:end] = list(code)
             
             final_content = "".join(content_list)
             
             with open(input_path, 'w', encoding='utf-8') as f:
                 f.write(final_content)
             print(f"[*] Successfully refactored {len(replacements)} modules in {input_path}.")

     print(f"\n[*] Unpack process finished.")
 except FileNotFoundError:
     print(f"[!] Error: Input file not found at '{input_path}'")
 except Exception as e:
     print(f"[!] An error occurred: {e}")


if __name__ == '__main__':
 main()