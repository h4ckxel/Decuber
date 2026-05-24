import io
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

import DecuberBase36 as decuber


class DecuberBase36Tests(unittest.TestCase):
    def test_round_trip_empty_text_and_binary(self):
        cases = [
            b"",
            b"hello world",
            "mensaje simple".encode("utf-8"),
            b"\x00\x01\x02hello\xff",
            bytes(range(256)),
        ]

        for payload in cases:
            with self.subTest(payload=payload[:12]):
                encoded = decuber.encode_base36(payload)
                self.assertTrue(encoded.startswith(decuber.FORMAT_PREFIX))
                self.assertEqual(decuber.decode_base36(encoded), payload)

    def test_invalid_characters_and_payload_shape(self):
        invalid_samples = [
            "v:a",
            "v:a$",
            "v:zz",
            "abc$",
        ]

        for sample in invalid_samples:
            with self.subTest(sample=sample):
                with self.assertRaises(ValueError):
                    decuber.decode_base36(sample)

    def test_summary_counts_needed_cubes(self):
        info = decuber.calculate_summary(b"abcde")
        self.assertEqual(info["size_bytes"], 5)
        self.assertEqual(info["bits"], 40)
        self.assertEqual(info["encoded_length"], 12)
        self.assertEqual(info["needed_cubes"], 3)

        stream = io.StringIO()
        decuber.summarize(b"abcde", stream=stream)
        self.assertIn("Needed cubes: 3", stream.getvalue())

    def test_file_round_trip_cli(self):
        data = b"\x00\x01\x02hello\xff"
        script = ROOT / "DecuberBase36.py"

        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            input_path = tmp_path / "input.bin"
            encoded_path = tmp_path / "encoded.txt"
            output_path = tmp_path / "output.bin"
            input_path.write_bytes(data)

            subprocess.run(
                [sys.executable, str(script), "-i", str(input_path), "-o", str(encoded_path)],
                check=True,
            )
            subprocess.run(
                [
                    sys.executable,
                    str(script),
                    "-d",
                    "-i",
                    str(encoded_path),
                    "-o",
                    str(output_path),
                ],
                check=True,
            )

            self.assertEqual(output_path.read_bytes(), data)

    def test_stdin_stdout_cli(self):
        data = b"\x00\x01\x02hello\xff"
        script = ROOT / "DecuberBase36.py"

        encoded_proc = subprocess.run(
            [sys.executable, str(script)],
            input=data,
            stdout=subprocess.PIPE,
            check=True,
        )
        encoded = encoded_proc.stdout.decode("utf-8").strip("\r\n")

        decoded_proc = subprocess.run(
            [sys.executable, str(script), "-d", encoded],
            stdout=subprocess.PIPE,
            check=True,
        )

        self.assertEqual(decoded_proc.stdout, data)

    def test_cli_reports_invalid_decode_input(self):
        script = ROOT / "DecuberBase36.py"
        proc = subprocess.run(
            [sys.executable, str(script), "-d", "v:zz"],
            stderr=subprocess.PIPE,
            text=True,
        )

        self.assertNotEqual(proc.returncode, 0)
        self.assertIn("Invalid byte pair", proc.stderr)


if __name__ == "__main__":
    unittest.main()
