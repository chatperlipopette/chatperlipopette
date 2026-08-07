import Papa from "papaparse";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ1DbiNsGdrjT76s70wAFH92OI2gUTyrRlqg8mGtrD3RxVVgLsHQieMXupWs1CYSZkW6TW1N5wVcBuG/pub?gid=0&single=true&output=csv";

export async function getGames() {
  const response = await fetch(SHEET_URL, {
    cache: "no-store",
  });

  const csv = await response.text();

  const result = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
  });

  return result.data;
}
