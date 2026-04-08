const XLSX = require('xlsx');
const fs = require('fs');

const filePath = './Galpão_Supermecado Portal 1.xlsx';
let output = '';

try {
  const workbook = XLSX.readFile(filePath);
  
  output += "=== TODAS AS ABAS: " + JSON.stringify(workbook.SheetNames) + "\n\n";

  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    output += "\n========== ABA: " + sheetName + " ==========\n";
    output += "Total de linhas: " + data.length + "\n";
    
    const limit = sheetName === 'OBRAS' ? 5 : 15;
    data.slice(0, limit).forEach((row, i) => {
      output += "L" + i + ": " + JSON.stringify(row) + "\n";
    });
    output += "---\n";
  });

  fs.writeFileSync('./planilha_preview.txt', output, 'utf-8');
  console.log("Salvo em planilha_preview.txt");

} catch (error) {
  console.error("Erro:", error.message);
}
