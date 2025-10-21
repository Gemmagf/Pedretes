export const BASE_URL = "https://script.google.com/macros/s/AKfycbyp3PfCmhKeK2Qk-5kl5y41793d2Hov5sirpyA3k3Cs9ToyW0U-j62rPlVJ8yLSCjgG/exec";

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