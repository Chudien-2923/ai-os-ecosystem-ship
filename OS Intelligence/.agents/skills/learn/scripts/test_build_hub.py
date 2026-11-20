#!/usr/bin/env python3

import subprocess
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).with_name("build_hub.py")


class BuildHubTest(unittest.TestCase):
    def run_builder(self, root: Path) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            ["python3", str(SCRIPT), "--outputs-root", str(root)],
            check=False,
            capture_output=True,
            text=True,
        )

    def test_refuses_empty_hub(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            result = self.run_builder(root)
            self.assertEqual(result.returncode, 2)
            self.assertFalse((root / "index.html").exists())

    def test_builds_completed_cards_and_skips_drafts(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            completed = root / "marketing" / "attribution"
            completed.mkdir(parents=True)
            (completed / "overview.md").write_text(
                """# Attribution & Measurement

- Domain: `Digital Marketing`
- Updated: `2026-10-27`
- Status: `completed`

## Tóm tắt

Attribution phân bổ credit; incrementality kiểm tra causal lift.

## Điều cần nhớ

- Attribution không tự chứng minh nhân quả.
- Holdout giúp đo phần tăng thêm.
- Chọn phép đo theo quyết định cần đưa ra.

## Kết quả

Có thể chọn đúng loại đo lường cho một campaign.
""",
                encoding="utf-8",
            )
            (completed / "practice.md").write_text(
                "# Practice\n\nA detailed exercise.\n",
                encoding="utf-8",
            )
            draft = root / "general" / "draft"
            draft.mkdir(parents=True)
            (draft / "overview.md").write_text(
                """# Draft
- Domain: `General`
- Updated: `2026-10-27`
- Status: `draft`
""",
                encoding="utf-8",
            )

            result = self.run_builder(root)
            self.assertEqual(result.returncode, 0, result.stderr)
            page = (root / "index.html").read_text(encoding="utf-8")
            self.assertIn("Attribution &amp; Measurement", page)
            self.assertIn("marketing/attribution/overview.md", page)
            self.assertIn("marketing/attribution/practice.md", page)
            self.assertNotIn(">Draft<", page)
            self.assertIn("data-filter=\"digital marketing\"", page)

    def test_rejects_topic_without_domain_folder(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            topic = root / "topic"
            topic.mkdir()
            (topic / "overview.md").write_text(
                """# Topic
- Domain: `General`
- Updated: `2026-10-27`
- Status: `completed`
## Tóm tắt
Summary.
## Điều cần nhớ
- One.
## Kết quả
Outcome.
""",
                encoding="utf-8",
            )
            result = self.run_builder(root)
            self.assertEqual(result.returncode, 2)
            self.assertIn("<domain>/<topic>/overview.md", result.stderr)
            self.assertFalse((root / "index.html").exists())

    def test_rejects_missing_cover(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            topic = root / "general" / "topic"
            topic.mkdir(parents=True)
            (topic / "overview.md").write_text(
                """# Topic
- Domain: `General`
- Updated: `2026-10-27`
- Status: `completed`
- Cover: `missing.png`
## Tóm tắt
Summary.
## Điều cần nhớ
- One.
## Kết quả
Outcome.
""",
                encoding="utf-8",
            )
            result = self.run_builder(root)
            self.assertEqual(result.returncode, 2)
            self.assertIn("cover does not exist", result.stderr)
            self.assertFalse((root / "index.html").exists())


if __name__ == "__main__":
    unittest.main()
