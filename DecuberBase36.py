#!/usr/bin/env python3
"""Binary-safe Decuber command line codec.

The public function names keep the project's original Base36 label. New output
uses a visible `v:` format that is safe to paste into the web encoder and can
round-trip empty files, leading null bytes, stdin, stdout, and binary blobs.
Unprefixed legacy numeric Base36 strings are still accepted for decode.
"""

import argparse
import sys
from pathlib import Path

ALPHABET = " abcdefghijklmnopqrstuvwxyz.!?@#:/()"
BASE = len(ALPHABET)
FORMAT_PREFIX = "v:"

# The binary transport avoids literal spaces so terminal copy/paste does not
# silently drop significant bytes. All symbols remain valid Decuber web input.
BYTE_ALPHABET = ALPHABET.replace(" ", "")
BYTE_BASE = len(BYTE_ALPHABET)

char_to_val = {c: i for i, c in enumerate(ALPHABET)}
byte_char_to_val = {c: i for i, c in enumerate(BYTE_ALPHABET)}


def encode_base36(data: bytes) -> str:
    """Encode bytes into a Decuber-safe, fixed-width text representation."""
    if not isinstance(data, (bytes, bytearray)):
        raise TypeError("encode_base36 expects bytes-like input")

    pairs = []
    for byte in data:
        high, low = divmod(byte, BYTE_BASE)
        pairs.append(BYTE_ALPHABET[high])
        pairs.append(BYTE_ALPHABET[low])
    return FORMAT_PREFIX + "".join(pairs)


def _decode_visible_payload(payload: str) -> bytes:
    if len(payload) % 2:
        raise ValueError("Invalid v: payload length; expected pairs of symbols")

    output = bytearray()
    for pos in range(0, len(payload), 2):
        high_char = payload[pos]
        low_char = payload[pos + 1]
        if high_char not in byte_char_to_val:
            raise ValueError(f"Invalid character in input: {high_char!r}")
        if low_char not in byte_char_to_val:
            raise ValueError(f"Invalid character in input: {low_char!r}")

        value = byte_char_to_val[high_char] * BYTE_BASE + byte_char_to_val[low_char]
        if value > 255:
            pair = high_char + low_char
            raise ValueError(f"Invalid byte pair in input: {pair!r}")
        output.append(value)
    return bytes(output)


def _decode_legacy_numeric_base36(encoded: str) -> bytes:
    num = 0
    for char in encoded:
        if char not in char_to_val:
            raise ValueError(f"Invalid character in input: {char!r}")
        num = num * BASE + char_to_val[char]
    length = (num.bit_length() + 7) // 8
    return num.to_bytes(length, "big")


def decode_base36(encoded: str) -> bytes:
    """Decode `v:` output, or old unprefixed numeric Base36 output."""
    if not isinstance(encoded, str):
        raise TypeError("decode_base36 expects text input")

    normalized = encoded.replace("\r", "").replace("\n", "")
    if normalized.startswith(FORMAT_PREFIX):
        return _decode_visible_payload(normalized[len(FORMAT_PREFIX):])
    return _decode_legacy_numeric_base36(normalized)


def _path_exists(value: str) -> bool:
    try:
        return Path(value).exists()
    except OSError:
        return False


def read_input(input_arg: str, binary=False, decode_mode=False):
    if input_arg == "-":
        return sys.stdin.buffer.read() if binary else sys.stdin.read()
    if _path_exists(input_arg):
        path = Path(input_arg)
        return path.read_bytes() if binary else path.read_text(encoding="utf-8")
    return input_arg if decode_mode else input_arg.encode("utf-8")


def write_output(output_arg: str, data, binary=False):
    if output_arg == "-":
        if binary:
            sys.stdout.buffer.write(data)
        else:
            sys.stdout.write(data)
            sys.stdout.write("\n")
        return

    path = Path(output_arg)
    if binary:
        path.write_bytes(data)
    else:
        path.write_text(data, encoding="utf-8")


def _format_size(size_bytes: int) -> str:
    if size_bytes < 1024:
        return f"{size_bytes} Bytes"
    if size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.2f} KB"
    return f"{size_bytes / (1024 * 1024):.2f} MB"


def calculate_summary(data: bytes):
    encoded = encode_base36(data)
    chars = len(encoded)
    return {
        "size_bytes": len(data),
        "human_size": _format_size(len(data)),
        "bits": len(data) * 8,
        "encoded_length": chars,
        "needed_cubes": (chars + 3) // 4,
    }


def summarize(data: bytes, stream=None):
    stream = stream or sys.stdout
    info = calculate_summary(data)
    print("File Summary:", file=stream)
    print(f"- File size: {info['human_size']} ({info['bits']} bits)", file=stream)
    print(f"- Encoded length: {info['encoded_length']} characters", file=stream)
    print(
        f"- Needed cubes: {info['needed_cubes']} "
        "(1 face per cube, 4 characters each)",
        file=stream,
    )


def main(argv=None):
    parser = argparse.ArgumentParser(description="Decuber Base36 Encoder/Decoder")
    parser.add_argument("positional_input", nargs="?", help="Optional input string or path")
    parser.add_argument("-i", "--input", default="-", help="Input file, '-' or direct text")
    parser.add_argument("-o", "--output", default="-", help="Output file (default: stdout)")
    parser.add_argument("-d", "--decode", action="store_true", help="Decode mode")
    parser.add_argument("-s", "--summary", action="store_true", help="Show summary only")

    args = parser.parse_args(argv)

    input_arg = args.input
    if args.positional_input and input_arg == "-":
        input_arg = args.positional_input

    try:
        if args.summary:
            data = read_input(input_arg, binary=True, decode_mode=False)
            summarize(data)
            return 0

        if args.decode:
            encoded = read_input(input_arg, binary=False, decode_mode=True).strip("\r\n")
            decoded = decode_base36(encoded)
            write_output(args.output, decoded, binary=True)
            return 0

        data = read_input(input_arg, binary=True, decode_mode=False)
        encoded = encode_base36(data)
        write_output(args.output, encoded, binary=False)
        return 0
    except (OSError, ValueError, TypeError) as exc:
        parser.exit(2, f"error: {exc}\n")


if __name__ == "__main__":
    raise SystemExit(main())
