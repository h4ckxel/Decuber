#!/usr/bin/env python3
import argparse
import sys
from pathlib import Path

ALPHABET = " abcdefghijklmnopqrstuvwxyz.!?@#:/()"
BASE = len(ALPHABET)

char_to_val = {c: i for i, c in enumerate(ALPHABET)}
val_to_char = {i: c for i, c in enumerate(ALPHABET)}

def encode_base36(data: bytes) -> str:
    num = int.from_bytes(data, 'big')
    if num == 0:
        return ALPHABET[0]
    result = ""
    while num > 0:
        num, rem = divmod(num, BASE)
        result = val_to_char[rem] + result
    return result

def decode_base36(encoded: str) -> bytes:
    num = 0
    for char in encoded:
        if char not in char_to_val:
            raise ValueError(f"Invalid character in input: {char}")
        num = num * BASE + char_to_val[char]
    length = (num.bit_length() + 7) // 8
    return num.to_bytes(length, 'big')

def read_input(input_arg: str, binary=False, decode_mode=False):
    if input_arg == "-":
        return sys.stdin.buffer.read() if binary else sys.stdin.read()
    elif Path(input_arg).exists():
        mode = 'rb' if binary else 'r'
        with open(input_arg, mode, encoding=None if binary else 'utf-8') as f:
            return f.read()
    else:
        return input_arg if decode_mode else input_arg.encode()

def write_output(output_arg: str, data, binary=False):
    if output_arg == "-":
        (sys.stdout.buffer if binary else sys.stdout).write(data)
        if not binary:
            print()
    else:
        mode = 'wb' if binary else 'w'
        with open(output_arg, mode, encoding=None if not binary else None) as f:
            f.write(data)

def summarize(data: bytes):
    size_bytes = len(data)
    encoded = encode_base36(data)
    bits = size_bytes * 8
    chars = len(encoded)
    needed_cubes = (chars + 3) // 4

    def fmt_size(bytes_):
        if bytes_ < 1024:
            return f"{bytes_} Bytes"
        elif bytes_ < 1024 * 1024:
            return f"{bytes_ / 1024:.2f} KB"
        else:
            return f"{bytes_ / (1024 * 1024):.2f} MB"

    print("📦 File Summary:")
    print(f"- File size: {fmt_size(size_bytes)} ({bits} bits)")
    print(f"- Encoded length: {chars} characters (Base36)")
    print(f"- Needed cubes: {needed_cubes} (1 face per cube, 4 chars each)")

def main():
    parser = argparse.ArgumentParser(description="StegaCube Base36 Encoder/Decoder")
    parser.add_argument("positional_input", nargs="?", help="Optional input string or path")
    parser.add_argument("-i", "--input", default="-", help="Input file or '-' or direct text")
    parser.add_argument("-o", "--output", default="-", help="Output file (default: stdout)")
    parser.add_argument("-d", "--decode", action="store_true", help="Decode mode")
    parser.add_argument("-s", "--summary", action="store_true", help="Show summary only")

    args = parser.parse_args()

    input_arg = args.input
    if args.positional_input and input_arg == "-":
        input_arg = args.positional_input

    if args.summary:
        data = read_input(input_arg, binary=True, decode_mode=False)
        summarize(data)
        return

    if args.decode:
        encoded = read_input(input_arg, binary=False, decode_mode=True).strip()
        decoded = decode_base36(encoded)
        write_output(args.output, decoded, binary=True)
    else:
        data = read_input(input_arg, binary=True, decode_mode=False)
        encoded = encode_base36(data)
        write_output(args.output, encoded, binary=False)

if __name__ == "__main__":
    main()
