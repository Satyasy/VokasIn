"""Layer 0 parser: extract Unit Kompetensi / Elemen / KUK from SKKNI PDFs.

Non-ML, regex-based. Shells out to `pdftotext -layout` (poppler-utils) instead
of adding a PDF-parsing dependency — it's already on PATH and does the job.

Two document schemas were found in data/skkni-raw/ by manual inspection first:

  Schema A ("resmi"): explicit "KODE UNIT :" / "JUDUL UNIT :" /
  "DESKRIPSI UNIT :" / "ELEMEN KOMPETENSI ... KRITERIA UNJUK KERJA" /
  "BATASAN VARIABEL" markers. Used by the Cloud Computing, IoT, and AI PDFs.
  Parsed fully (kode, judul, elemen[], kuk[]).

  Schema B ("adopsi ICT/BSB/HLT/..."): no "KODE UNIT" marker at all — unit
  starts are just a title block ("ICTTEN5201A Install, configure and test a
  server") followed by "Modification History". Used throughout the
  Software-Programming PDF. Elemen/KUK cells in this schema wrap across two
  columns with no reliable text-only column boundary, so we only extract
  kodeUnit/judulUnit/halaman here and flag the unit parsing_uncertain — this
  is the "jangan dipaksakan rapi" case, not a gap in effort.

ponytail: no pdfplumber/pypdf dependency added — pdftotext (already
installed) + stdlib regex covers this. Swap in a real layout-aware parser
(pdfplumber word boxes) only if Schema B needs real elemen/KUK extraction later.
"""

import json
import re
import subprocess
import sys
from pathlib import Path

RAW_DIR = Path(__file__).resolve().parent.parent / "data" / "skkni-raw"
OUT_PATH = Path(__file__).resolve().parent.parent / "data" / "skkni-parsed.json"

KODE_RE = re.compile(r"^KODE UNIT\s*:?\s*(.*)$")
JUDUL_RE = re.compile(r"^JUDUL UNIT\s*:?\s*(.*)$")
DESKRIPSI_RE = re.compile(r"^DESKRIPSI UNIT\s*:?\s*(.*)$")
ELEMEN_HEADER_RE = re.compile(r"^ELEMEN KOMPETENSI\b")
BATASAN_RE = re.compile(r"^BATASAN VARIABEL\b")

ELEM_START_RE = re.compile(r"^(\d{1,2})\.\s+(.*)$")
KUK_INLINE_RE = re.compile(r"(\d{1,2}\.\d{1,2})\s+")
WIDE_GAP_RE = re.compile(r"\S {3,}\S")

# Schema B: "<CODE> <Title...>" line immediately followed (within a few
# lines) by "Modification History". Codes are adopted-package style
# (BSBxxx, CUxxx, HLTxxx, ICTxxx, FNSxxx, ...), not the SKKNI J./K. pattern.
# Require a digit in the code so section headers like "JUDUL UNIT" or
# "ELEMENT ..." (all-caps, no digit) don't false-positive as unit codes.
SCHEMA_B_TITLE_RE = re.compile(r"^([A-Z]{2,6}\d{2,6}[A-Z]?)\s+([A-Z].*)$")


def pdf_pages(pdf_path: Path) -> list[str]:
    """Return the document's text as a list of pages (1 entry per physical page)."""
    result = subprocess.run(
        ["pdftotext", "-layout", str(pdf_path), "-"],
        capture_output=True,
        text=True,
        check=True,
    )
    # pdftotext separates pages with a form-feed character.
    pages = result.stdout.split("\f")
    if pages and pages[-1] == "":
        pages.pop()
    return pages


def parse_elemen_kuk(lines: list[str]) -> tuple[list[dict], bool]:
    """Parse the ELEMEN KOMPETENSI / KRITERIA UNJUK KERJA block. Returns
    (elements, unit_uncertain)."""
    elements: list[dict] = []
    current_element: dict | None = None
    current_kuk: dict | None = None
    unit_uncertain = False

    def flush_kuk():
        nonlocal current_kuk
        if current_kuk is not None and current_element is not None:
            teks = " ".join(current_kuk["teks_parts"]).strip()
            teks = re.sub(r"\s+", " ", teks)
            current_element["kuk"].append(
                {
                    "kode": current_kuk["kode"],
                    "teks": teks,
                    "parsing_uncertain": current_kuk["uncertain"],
                }
            )
        current_kuk = None

    def flush_element():
        nonlocal current_element
        if current_element is not None:
            judul = " ".join(current_element["judul_parts"]).strip()
            judul = re.sub(r"\s+", " ", judul)
            elements.append({"judul": judul, "kuk": current_element["kuk"]})
        current_element = None

    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            continue

        remaining = line
        m = ELEM_START_RE.match(remaining)
        if m:
            flush_kuk()
            flush_element()
            current_element = {"num": m.group(1), "judul_parts": [], "kuk": []}
            remaining = m.group(2)

        matched_kuk_this_line = False
        while True:
            km = KUK_INLINE_RE.search(remaining)
            if not km:
                break
            matched_kuk_this_line = True
            pre = remaining[: km.start()].strip()
            if pre:
                if current_kuk is None and current_element is not None:
                    current_element["judul_parts"].append(pre)
                elif current_kuk is not None:
                    current_kuk["teks_parts"].append(pre)
                    current_kuk["uncertain"] = True
                    unit_uncertain = True
            flush_kuk()
            current_kuk = {"kode": km.group(1), "teks_parts": [], "uncertain": False}
            remaining = remaining[km.end() :]

        if remaining.strip():
            if current_kuk is not None:
                current_kuk["teks_parts"].append(remaining.strip())
                # A markerless continuation line with a wide internal gap is
                # the fingerprint of an unresolved two-column wrap (element
                # title continuation bleeding into KUK text, or vice versa).
                if not matched_kuk_this_line and WIDE_GAP_RE.search(raw_line):
                    current_kuk["uncertain"] = True
                    unit_uncertain = True
            elif current_element is not None:
                current_element["judul_parts"].append(remaining.strip())

    flush_kuk()
    flush_element()
    return elements, unit_uncertain


def parse_schema_a(pages: list[str], source_file: str) -> list[dict]:
    # Flatten to (page_no, line) pairs, 1-indexed pages.
    flat: list[tuple[int, str]] = []
    for i, page_text in enumerate(pages, start=1):
        for line in page_text.split("\n"):
            flat.append((i, line))

    kode_indices = [i for i, (_, line) in enumerate(flat) if KODE_RE.match(line.strip())]
    units = []

    for idx, start in enumerate(kode_indices):
        end = kode_indices[idx + 1] if idx + 1 < len(kode_indices) else len(flat)
        block = flat[start:end]
        halaman_mulai = block[0][0]
        halaman_selesai = block[-1][0]

        kode_m = KODE_RE.match(block[0][1].strip())
        kode_unit = kode_m.group(1).strip() if kode_m else ""

        judul_parts: list[str] = []
        deskripsi_parts: list[str] = []
        elemen_lines: list[str] = []
        section = None  # None -> 'judul' -> 'deskripsi' -> 'elemen'

        for _, raw_line in block[1:]:
            line = raw_line.strip()
            if not line:
                continue
            jm = JUDUL_RE.match(line)
            dm = DESKRIPSI_RE.match(line)
            if jm:
                section = "judul"
                if jm.group(1).strip():
                    judul_parts.append(jm.group(1).strip())
                continue
            if dm:
                section = "deskripsi"
                if dm.group(1).strip():
                    deskripsi_parts.append(dm.group(1).strip())
                continue
            if ELEMEN_HEADER_RE.match(line):
                section = "elemen"
                continue
            if BATASAN_RE.match(line):
                section = "batasan"
                continue
            if section == "judul":
                judul_parts.append(line)
            elif section == "deskripsi":
                deskripsi_parts.append(line)
            elif section == "elemen":
                elemen_lines.append(raw_line)
            # section in (None, 'batasan') -> ignore (front matter / range statement)

        elements, elemen_uncertain = parse_elemen_kuk(elemen_lines)

        units.append(
            {
                "kodeUnit": kode_unit,
                "judulUnit": re.sub(r"\s+", " ", " ".join(judul_parts)).strip(),
                "deskripsiUnit": re.sub(r"\s+", " ", " ".join(deskripsi_parts)).strip(),
                "elemenKompetensi": elements,
                "halaman": {"mulai": halaman_mulai, "selesai": halaman_selesai},
                "sumberFile": source_file,
                "skema": "A",
                "parsing_uncertain": elemen_uncertain
                or not kode_unit
                or not elements,
            }
        )

    return units


def parse_schema_b(pages: list[str], source_file: str) -> list[dict]:
    """Best-effort unit identification only. Elemen/KUK not extracted — this
    schema's two-column wrap can't be split reliably from text alone, so we
    don't pretend it can. Always flagged parsing_uncertain.

    Each unit's title/body/mapping-table headings repeat the same "<CODE>
    <Title>" line 3-5 times through the document (English heading, Indonesian
    heading, assessment-requirements heading, mapping table, ...) — dedupe by
    code, keeping the first (page-earliest) occurrence."""
    units = []
    seen_codes: set[str] = set()
    for i, page_text in enumerate(pages, start=1):
        lines = page_text.split("\n")
        for j, raw_line in enumerate(lines):
            line = raw_line.strip()
            m = SCHEMA_B_TITLE_RE.match(line)
            if not m or m.group(1) in seen_codes:
                continue
            # Require "Modification History" within the next ~15 lines to
            # confirm this is really a unit title block, not stray text.
            window = "\n".join(lines[j : j + 15])
            if i + 1 < len(pages):
                window += "\n" + "\n".join(pages[i].split("\n")[:15])
            if "Modification History" not in window and "Riwayat" not in window:
                continue
            seen_codes.add(m.group(1))
            judul = m.group(2).strip()
            # Title often wraps onto the next 1-2 lines before a blank line.
            for follow in lines[j + 1 : j + 3]:
                follow = follow.strip()
                if not follow or follow.startswith(m.group(1)):
                    break
                judul += " " + follow
            units.append(
                {
                    "kodeUnit": m.group(1),
                    "judulUnit": re.sub(r"\s+", " ", judul).strip(),
                    "deskripsiUnit": "",
                    "elemenKompetensi": [],
                    "halaman": {"mulai": i, "selesai": i},
                    "sumberFile": source_file,
                    "skema": "B",
                    "parsing_uncertain": True,
                    "catatan": (
                        "Skema unit adopsi (bukan format resmi 'KODE UNIT :'). "
                        "Elemen/KUK tidak diekstrak otomatis karena wrap dua "
                        "kolom tidak bisa dipisahkan andal dari teks polos — "
                        "perlu verifikasi manual di halaman ini."
                    ),
                }
            )
    return units


def parse_pdf(pdf_path: Path) -> list[dict]:
    pages = pdf_pages(pdf_path)
    has_schema_a = any(
        KODE_RE.match(line.strip())
        for page in pages
        for line in page.split("\n")
    )
    if has_schema_a:
        return parse_schema_a(pages, pdf_path.name)
    return parse_schema_b(pages, pdf_path.name)


def main() -> None:
    if not RAW_DIR.is_dir():
        print(f"Direktori tidak ditemukan: {RAW_DIR}", file=sys.stderr)
        sys.exit(1)

    pdf_files = sorted(RAW_DIR.glob("*.pdf"))
    if not pdf_files:
        print(f"Tidak ada PDF di {RAW_DIR}", file=sys.stderr)
        sys.exit(1)

    all_units = []
    per_file_summary = []
    for pdf_path in pdf_files:
        units = parse_pdf(pdf_path)
        uncertain = sum(1 for u in units if u["parsing_uncertain"])
        per_file_summary.append(
            {"file": pdf_path.name, "unit_terdeteksi": len(units), "parsing_uncertain": uncertain}
        )
        all_units.extend(units)

    output = {"units": all_units, "ringkasan_per_file": per_file_summary}
    OUT_PATH.write_text(json.dumps(output, indent=2, ensure_ascii=False), encoding="utf-8")

    total = len(all_units)
    total_uncertain = sum(1 for u in all_units if u["parsing_uncertain"])
    print(f"Total unit terdeteksi: {total}")
    print(f"parsing_uncertain: {total_uncertain}")
    for row in per_file_summary:
        print(f"  {row['file']}: {row['unit_terdeteksi']} unit, {row['parsing_uncertain']} uncertain")
    print(f"Output: {OUT_PATH}")


if __name__ == "__main__":
    main()
