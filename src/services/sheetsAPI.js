const BASE_URL = "https://script.google.com/macros/s/AKfycbynCcMasb-wHuT8S31YblHMO8jFDb-SSj8ZECXQsY9b0kMtEhSuFhQCONMy6LgfXKc/exec";

export const getSheetData = async (sheetName) => {
  const res = await fetch(`${BASE_URL}?sheet=${sheetName}`);
  return res.json();
};

export const addRow = async (sheetName, data) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, sheet: sheetName }),
  });
  return res.json();
};
