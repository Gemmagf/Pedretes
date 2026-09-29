#!/usr/bin/env python3
"""
Converts the "Formular Sareta" Google Sheet (exported as .xlsx) into data/sareta-projects.json,
the seed of the local account. Usage:

    python3 scripts/import_sheet.py path/to/Formular-Sareta.xlsx

Sheets read: Pave_Form, Fassung_Form, Alliance_Form (Google Forms responses).
Rules: price = price per stone × number of stones; jobs without an explicit status are
Completed when their date is in the past; a missing project name is derived from the job.
"""
import json, sys, datetime, re
from pathlib import Path

try:
    import openpyxl
except ImportError:
    sys.exit("pip install openpyxl")

TEST_CLIENTS = {'Anna Meier', 'Max Müller', 'Lara Schmidt', 'Tom Bauer', 'Eva Klein'}
SHEETS = {'Pave_Form': 'Pave', 'Fassung_Form': 'Fassung', 'Alliance_Form': 'Alliance'}

def norm_header(h):
    return re.sub(r'\s+', ' ', str(h or '')).strip().lower()

def col(row, headers, *starts):
    for i, h in enumerate(headers):
        if any(h.startswith(s) for s in starts):
            return row[i] if i < len(row) else None
    return None

def num(v):
    if v in (None, ''): return None
    try: return float(str(v).replace(',', '.'))
    except ValueError: return None

def text(v):
    if v in (None, ''): return None
    s = re.sub(r'\s+', ' ', str(v)).strip()
    return s or None

def iso(v, fallback):
    if isinstance(v, datetime.datetime): return v.replace(hour=9, minute=0, second=0, microsecond=0).isoformat()
    if isinstance(v, datetime.date): return datetime.datetime(v.year, v.month, v.day, 9).isoformat()
    return fallback

def main(path):
    wb = openpyxl.load_workbook(path, data_only=True)
    today = datetime.date.today().isoformat()
    projects = []
    for sheet, ptype in SHEETS.items():
        rows = list(wb[sheet].iter_rows(values_only=True))
        headers = [norm_header(h) for h in rows[0]]
        n = 0
        for row in rows[1:]:
            if not any(v not in (None, '') for v in row): continue
            client = text(col(row, headers, 'kunde'))
            if not client or client in TEST_CLIENTS: continue
            n += 1
            stamp = col(row, headers, 'marca de temps')
            date = iso(col(row, headers, 'date'), iso(stamp, today))
            stone_count = num(col(row, headers, 'anzahl steine'))
            price_per_stone = num(col(row, headers, 'preis pro stein'))
            total_time = num(col(row, headers, 'total zeit', 'zeit pro stein'))
            style = text(col(row, headers, 'stil'))
            stone_type = text(col(row, headers, 'steinart'))
            shape = text(col(row, headers, 'steinform', 'form'))
            size = num(col(row, headers, 'steingr'))
            status = text(col(row, headers, 'status')) or ('Completed' if date[:10] <= today else 'Pending')
            name = text(col(row, headers, 'projekte name'))
            if not name:
                if ptype == 'Fassung': name = f"Fassung {shape or ''} · {stone_type or ''}".replace(' · ', ' · ').strip(' ·')
                elif ptype == 'Pave': name = f"Pavé {style.split(',')[0] if style else ''}".strip()
                else: name = f"Alliance {style or ''} {f'{size:g} mm' if size else ''}".strip()
                if stone_count and stone_count > 1 and ptype == 'Fassung': name += f" ({stone_count:g} Steine)"
            p = {
                'id': f'sareta-{ptype.lower()}-{n}',
                'projectName': name,
                'client': client,
                'date': date,
                'status': status,
                'sheetType': ptype,
                'stoneCount': stone_count,
                'totalTime': total_time,
                'actualTime': 0,
                'pricePerStone': price_per_stone,
                'agreedPrice': round(price_per_stone * (stone_count or 1)) if price_per_stone else None,
                'goldWeight': num(col(row, headers, 'gold zur')),
                'stoneSize': size if ptype == 'Alliance' else None,
                'stoneType': stone_type,
                'material': text(col(row, headers, 'material')),
                'style': style,
                'shape': shape,
                'layout': text(col(row, headers, 'layout')) if ptype == 'Pave' else None,
                'fixation': text(col(row, headers, 'fixierung')) if ptype == 'Pave' else None,
            }
            projects.append({k: v for k, v in p.items() if v is not None})
    projects.sort(key=lambda p: p['date'], reverse=True)
    out = Path(__file__).resolve().parent.parent / 'data' / 'sareta-projects.json'
    out.write_text(json.dumps(projects, ensure_ascii=False, indent=1), encoding='utf-8')
    by_type = {t: sum(1 for p in projects if p['sheetType'] == t) for t in SHEETS.values()}
    print(f"{len(projects)} projects written to {out} {by_type}")

if __name__ == '__main__':
    if len(sys.argv) < 2: sys.exit(__doc__)
    main(sys.argv[1])
