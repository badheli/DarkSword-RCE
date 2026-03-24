import re
import os
import argparse
import textwrap
from pathlib import Path

def unescape_js_string(s: str) -> str:
 """
 A safe way to unescape a JavaScript string literal.
 Replaces common escape sequences.
 This version avoids any complex string literal generation to prevent SyntaxError.
 """
 # Replace common JavaScript escapes with their actual character.
 # Order is crucial: '\\' must be replaced before any other escape sequence
 # that contains a single backslash.
 s = s.replace('\\\\', '\\')
 s = s.replace('\\"', '"')
 s = s.replace("\\'", "'")
 s = s.replace('\\n', '\n')
 s = s.replace('\\r', '\r')
 s = s.replace('\\t', '\t')
 # Add other common JS escapes if necessary (e.g., \b, \f, \uXXXX)
 # For simplicity, we stick to the most common ones that cause UnicodeDecodeError

 return s

def process_bundle_content(content: str, output_dir: Path, recursion_level: int = 0):
 """
 Recursively finds and unpacks modules from webpack bundle content.
 """
 prefix = f"[L{recursion_level}]"
 print(f"{prefix} Searching for modules...")

 # Regex to find individual module blocks. Defined on a single line for robustness.
 module_finder_regex = re.compile(
     r'/\*\*\*/\s*"(?P<path>.+?)":\s*/\*!.*?\*/\s*/\*\*\*/\s*\((?:.*?)\)\s*=>\s*\{(?P<code>.*?)'
     r'/\*\*\*/\s*\}\)',
     re.DOTALL
 )

 # Regex to find nested bundle string literal. Defined on a single line for robustness.
 # Using \s instead of \n within the regex to match any whitespace char, including newline.
 # The non-greedy '?' is crucial for '*' to match the smallest possible string.
 nested_bundle_regex = re.compile(
     r'const __WEBPACK_DEFAULT_EXPORT__ = \("((?:.|\s)*?)"\);?',
     re.DOTALL
 )

 modules_found = 0
 for match in module_finder_regex.finditer(content):
     modules_found += 1
     module_path_str = match.group('path')
     raw_code = match.group('code').strip()

     nested_match = nested_bundle_regex.search(raw_code)
     
     if nested_match:
         print(f"{prefix} Found nested bundle in module: {module_path_str}")
         nested_bundle_string = nested_match.group(1)
         
         # Use the new, safe unescaping function
         nested_content = unescape_js_string(nested_bundle_string)
         
         # Recurse
         process_bundle_content(nested_content, output_dir, recursion_level + 1)
     else:
         # --- Code Cleaning ---
         dedented_code = textwrap.dedent(raw_code)
         export_pattern = r'/\* harmony default export \*/\s*const __WEBPACK_DEFAULT_EXPORT__ = \((.+)\);?'
         processed_code = re.sub(r'(?s)' + export_pattern, r'export default \1;', dedented_code)
         final_code = processed_code.strip()

         # --- File I/O ---
         if module_path_str.startswith('./'):
             module_path_str = module_path_str[2:]
         
         # Loader syntax in path is not a valid filename
         module_path_str = module_path_str.replace('!', '_')

         output_file_path = output_dir / module_path_str
         output_file_path.parent.mkdir(parents=True, exist_ok=True)
         
         try:
             with open(output_file_path, 'w', encoding='utf-8') as out_f:
                 out_f.write(final_code)
             print(f"{prefix} -> Extracted regular module to: {output_file_path}")
         except Exception as e:
             print(f"{prefix} [!] Could not write file '{output_file_path}'. Reason: {e}")

 if modules_found == 0:
     print(f"{prefix} No modules found at this level.")


def main():
 parser = argparse.ArgumentParser(
     description="A recursive tool to unpack and clean webpack modules, including nested bundles.",
     epilog="Example: python unpack_webpack.py rce_module.js ./unpacked_source"
 )
 parser.add_argument("input_file", type=str, help="Path to the input webpack bundle .js file.")
 parser.add_argument("output_dir", type=str, help="Path to the directory where source files will be saved.")
 
 args = parser.parse_args()
 
 input_path = Path(args.input_file)
 output_path = Path(args.output_dir)

 print(f"[*] Starting unpack process for: {input_path}")
 try:
     with open(input_path, 'r', encoding='utf-8') as f:
         initial_content = f.read()
     process_bundle_content(initial_content, output_path)
     print(f"\n[*] Unpack process finished.")
 except FileNotFoundError:
     print(f"[!] Error: Input file not found at '{input_path}'")
 except Exception as e:
     print(f"[!] An error occurred: {e}")


if __name__ == '__main__':
 main()