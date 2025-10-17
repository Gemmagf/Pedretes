const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbw_GOZyFNBBcxp4_UhOFBdvSyJ2qcddNTQqNhm_uMN6_WahH_rSgEK63MR-08HocHJb/exec';

export const getRows = async (sheetName) => {
  const res = await fetch(`${SHEETS_API_URL}?sheet=${sheetName}`);
  const data = await res.json();
  return data;
};

export const addRow = async (sheetName, row) => {
  const res = await fetch(SHEETS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sheet: sheetName, ...row })
  });
  return res.json();
};
