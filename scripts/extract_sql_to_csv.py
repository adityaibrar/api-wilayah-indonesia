#!/usr/bin/env python3
"""
Script untuk mengekstrak data wilayah dari file SQL BPS ke CSV.
Menggunakan line-by-line parsing agar bisa handle multiple INSERT blocks.
Output: provinces.csv, cities.csv, districts.csv, villages.csv
"""

import csv
import os
import re

SQL_FILE = "/Users/IbrarDev/Downloads/db_wilayah_bps.sql"
OUTPUT_DIR = "/Users/IbrarDev/Development/Projects/backend/api-wilayah-indonesia/data"


# ─── Title Case ─────────────────────────────────────────────────────────────

def to_title_case(text: str) -> str:
    """Konversi UPPERCASE BPS ke Title Case yang proper untuk nama wilayah Indonesia."""
    if not text:
        return text

    # Singkatan / kata khusus yang tidak diubah
    exceptions_lower = {"di", "dan", "atau", "ke", "di", "dari", "yang"}

    # Awalan khusus yang perlu format spesifik
    prefix_map = {
        "kab.": "Kab.",
        "kota": "Kota",
        "dki": "DKI",
        "di": "DI",
    }

    words = text.lower().split()
    result = []
    for i, word in enumerate(words):
        lower_word = word.lower()
        if lower_word in prefix_map:
            result.append(prefix_map[lower_word])
        else:
            result.append(word.capitalize())

    return " ".join(result)


# ─── SQL Row Parser ─────────────────────────────────────────────────────────

def parse_sql_row(row_str: str) -> list[str]:
    """
    Parse satu baris VALUES SQL, contoh:
    1,1,'1101010','TEUPAH SELATAN','110907','11.09.07','TEUPAH SELATAN','2026-...'
    Handle: single quotes, escaped quotes (''), NULL values.
    """
    fields = []
    current = ""
    in_quote = False
    i = 0

    while i < len(row_str):
        c = row_str[i]
        if c == "'" and not in_quote:
            in_quote = True
            i += 1
        elif c == "'" and in_quote:
            # Escaped quote ''
            if i + 1 < len(row_str) and row_str[i + 1] == "'":
                current += "'"
                i += 2
            else:
                in_quote = False
                i += 1
        elif c == "," and not in_quote:
            fields.append(current.strip())
            current = ""
            i += 1
        else:
            current += c
            i += 1

    fields.append(current.strip())
    return fields


def extract_rows_from_lines(lines: list[str], table_name: str) -> list[list[str]]:
    """
    Line-by-line parser untuk semua INSERT INTO `table_name` VALUES blocks.
    Menggabungkan semua INSERT blocks dalam satu tabel.
    """
    in_insert = False
    buffer = ""
    all_rows = []
    insert_pattern = re.compile(rf"^INSERT INTO `{re.escape(table_name)}` VALUES")

    for line in lines:
        stripped = line.strip()

        # Masuk ke INSERT block
        if insert_pattern.match(stripped):
            in_insert = True
            # Ambil sisa setelah VALUES (bisa langsung ada data di baris ini)
            after_values = stripped[stripped.index("VALUES") + 6:].strip()
            if after_values:
                buffer += after_values
            continue

        if not in_insert:
            continue

        # Di dalam INSERT block, kumpulkan semua baris hingga ";"
        buffer += " " + stripped

        # Cek apakah INSERT block sudah selesai (diakhiri ;)
        if stripped.endswith(";"):
            in_insert = False
            # Bersihkan buffer: hapus trailing ; dan whitespace
            block = buffer.strip().rstrip(";").strip()

            # Ekstrak semua (...)  tuples dari block
            # Handle nested quotes dengan state machine sederhana
            depth = 0
            start = -1
            row_buffer = ""

            for idx, ch in enumerate(block):
                if ch == "(" and depth == 0:
                    depth = 1
                    start = idx + 1
                    row_buffer = ""
                elif ch == "(" and depth > 0:
                    depth += 1
                    row_buffer += ch
                elif ch == ")" and depth > 1:
                    depth -= 1
                    row_buffer += ch
                elif ch == ")" and depth == 1:
                    depth = 0
                    # Parse row
                    parsed = parse_sql_row(row_buffer)
                    all_rows.append(parsed)
                    row_buffer = ""
                elif depth > 0:
                    row_buffer += ch

            buffer = ""

    return all_rows


# ─── Transformasi Data ──────────────────────────────────────────────────────

def build_provinces(rows: list[list[str]]):
    """m_provinsi: (id, kode_bps, nama_bps, kode_dagri, nama_dagri, created_at, updated_at)"""
    provinces = []
    id_to_code = {}  # internal id → kode_bps
    for f in rows:
        if len(f) < 3:
            continue
        internal_id = f[0].strip()
        code = f[1].strip()          # kode_bps (2 digit)
        name = to_title_case(f[2].strip())  # nama_bps
        id_to_code[internal_id] = code
        provinces.append({"code": code, "name": name})
    return provinces, id_to_code


def build_cities(rows: list[list[str]], prov_id_to_code: dict):
    """m_kabupaten: (id, id_prov, kode_bps, nama_bps, kode_dagri, kode_dagri2, nama_dagri, tipe, ...)"""
    cities = []
    id_to_code = {}  # internal id → kode_bps
    warn_count = 0
    for f in rows:
        if len(f) < 4:
            continue
        internal_id = f[0].strip()
        id_prov = f[1].strip()
        code = f[2].strip()          # kode_bps (4 digit)
        name = to_title_case(f[3].strip())  # nama_bps
        province_code = prov_id_to_code.get(id_prov, "")
        if not province_code:
            warn_count += 1
            if warn_count <= 5:
                print(f"  [WARN] Kab '{name}' id_prov={id_prov} tidak ditemukan")
        id_to_code[internal_id] = code
        cities.append({"code": code, "province_code": province_code, "name": name})
    if warn_count > 5:
        print(f"  [WARN] ... dan {warn_count - 5} warning lainnya")
    return cities, id_to_code


def build_districts(rows: list[list[str]], kab_id_to_code: dict):
    """m_kecamatan: (id, id_prov, id_kab, kode_bps, nama_bps, kode_dagri, kode_dagri2, nama_dagri, ...)"""
    districts = []
    id_to_code = {}
    warn_count = 0
    for f in rows:
        if len(f) < 5:
            continue
        internal_id = f[0].strip()
        id_kab = f[2].strip()
        code = f[3].strip()          # kode_bps (7 digit)
        name = to_title_case(f[4].strip())  # nama_bps
        city_code = kab_id_to_code.get(id_kab, "")
        if not city_code:
            warn_count += 1
            if warn_count <= 5:
                print(f"  [WARN] Kec '{name}' id_kab={id_kab} tidak ditemukan")
        id_to_code[internal_id] = code
        districts.append({"code": code, "city_code": city_code, "name": name})
    if warn_count > 5:
        print(f"  [WARN] ... dan {warn_count - 5} warning lainnya")
    return districts, id_to_code


def build_villages(rows: list[list[str]], kec_id_to_code: dict):
    """m_kelurahan: (id, id_prov, id_kab, id_kec, kode_bps, nama_bps, kode_dagri, kode_dagri2, nama_dagri, tipe, ...)"""
    villages = []
    warn_count = 0
    for f in rows:
        if len(f) < 6:
            continue
        id_kec = f[3].strip()
        code = f[4].strip()          # kode_bps (10 digit)
        name = to_title_case(f[5].strip())  # nama_bps
        district_code = kec_id_to_code.get(id_kec, "")
        if not district_code:
            warn_count += 1
            if warn_count <= 5:
                print(f"  [WARN] Kel '{name}' id_kec={id_kec} tidak ditemukan")
        villages.append({"code": code, "district_code": district_code, "name": name})
    if warn_count > 5:
        print(f"  [WARN] ... dan {warn_count - 5} warning lainnya")
    return villages


# ─── CSV Writer ─────────────────────────────────────────────────────────────

def write_csv(filepath: str, fieldnames: list[str], rows: list[dict]):
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"  → Ditulis: {filepath} ({len(rows):,} baris)")


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    print(f"📂 Membaca file SQL: {SQL_FILE}")
    with open(SQL_FILE, "r", encoding="utf-8") as f:
        lines = f.readlines()
    print(f"   Total baris: {len(lines):,}\n")

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # ─── 1. PROVINSI ─────────────────────────────────────────────────
    print("[1/4] Mengekstrak m_provinsi...")
    prov_rows = extract_rows_from_lines(lines, "m_provinsi")
    provinces, prov_id_to_code = build_provinces(prov_rows)
    write_csv(os.path.join(OUTPUT_DIR, "provinces.csv"), ["code", "name"], provinces)

    # ─── 2. KABUPATEN/KOTA ───────────────────────────────────────────
    print("\n[2/4] Mengekstrak m_kabupaten...")
    kab_rows = extract_rows_from_lines(lines, "m_kabupaten")
    cities, kab_id_to_code = build_cities(kab_rows, prov_id_to_code)
    write_csv(os.path.join(OUTPUT_DIR, "cities.csv"), ["code", "province_code", "name"], cities)

    # ─── 3. KECAMATAN ────────────────────────────────────────────────
    print("\n[3/4] Mengekstrak m_kecamatan...")
    kec_rows = extract_rows_from_lines(lines, "m_kecamatan")
    districts, kec_id_to_code = build_districts(kec_rows, kab_id_to_code)
    write_csv(os.path.join(OUTPUT_DIR, "districts.csv"), ["code", "city_code", "name"], districts)

    # ─── 4. KELURAHAN/DESA ───────────────────────────────────────────
    print("\n[4/4] Mengekstrak m_kelurahan (11 INSERT blocks, harap tunggu)...")
    kel_rows = extract_rows_from_lines(lines, "m_kelurahan")
    villages = build_villages(kel_rows, kec_id_to_code)
    write_csv(os.path.join(OUTPUT_DIR, "villages.csv"), ["code", "district_code", "name"], villages)

    # ─── SUMMARY ─────────────────────────────────────────────────────
    print("\n" + "=" * 55)
    print("SUMMARY EKSTRAKSI:")
    print(f"  Provinsi         : {len(provinces):>8,}")
    print(f"  Kabupaten/Kota   : {len(cities):>8,}")
    print(f"  Kecamatan        : {len(districts):>8,}")
    print(f"  Kelurahan/Desa   : {len(villages):>8,}")
    print("=" * 55)

    # ─── VALIDASI RELASI ─────────────────────────────────────────────
    print("\nValidasi relasi parent-child...")
    prov_codes = {p["code"] for p in provinces}
    city_codes = {c["code"] for c in cities}
    dist_codes = {d["code"] for d in districts}

    orphan_cities    = [c for c in cities    if c["province_code"] not in prov_codes]
    orphan_districts = [d for d in districts if d["city_code"]     not in city_codes]
    orphan_villages  = [v for v in villages  if v["district_code"] not in dist_codes]

    ok = True
    if orphan_cities:
        print(f"  ⚠️  {len(orphan_cities)} kabupaten/kota dengan province_code tidak valid")
        ok = False
    if orphan_districts:
        print(f"  ⚠️  {len(orphan_districts)} kecamatan dengan city_code tidak valid")
        ok = False
    if orphan_villages:
        print(f"  ⚠️  {len(orphan_villages)} kelurahan/desa dengan district_code tidak valid")
        ok = False

    if ok:
        print("  ✅ Semua relasi valid! Tidak ada data yang miss.")

    print("\n✅ Selesai!\n")


if __name__ == "__main__":
    main()
