const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', 'Galpão_Supermecado Portal 1.xlsx');
console.log('Lendo:', filePath);

try {
  const wb = XLSX.readFile(filePath, { cellDates: true, cellNF: false, cellText: false });
  console.log('Abas:', wb.SheetNames);

  const result = {};
  
  wb.SheetNames.forEach(sheetName => {
    const sheet = wb.Sheets[sheetName];
    // header:1 = array of arrays (raw rows)
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: true });
    // Filter out completely empty rows
    const filtered = rows.filter(row => row.some(cell => cell !== '' && cell != null));
    result[sheetName] = filtered.slice(0, 60); // Limit to first 60 rows per sheet
    console.log(`  ${sheetName}: ${filtered.length} rows (mostrando ate 60)`);
  });

  const outPath = path.join(__dirname, 'planilha_data.json');
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');
  console.log('\nSalvo em:', outPath);
} catch(e) {
  console.error('Erro:', e.message);
}
