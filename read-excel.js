const XLSX = require('xlsx');
const path = require('path');

// Leer el archivo Excel
const filePath = path.join(__dirname, 'stock.xlsx');
const workbook = XLSX.readFile(filePath);

// Obtener los nombres de las hojas
const sheetNames = workbook.SheetNames;
console.log('📊 Hojas encontradas:', sheetNames);

// Leer cada hoja
sheetNames.forEach((sheetName, index) => {
  console.log(`\n🔸 HOJA ${index + 1}: ${sheetName}`);
  console.log('=' .repeat(50));
  
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Mostrar las primeras filas para entender la estructura
  jsonData.slice(0, 10).forEach((row, rowIndex) => {
    if (row.length > 0) {
      console.log(`Fila ${rowIndex + 1}:`, row);
    }
  });
  
  if (jsonData.length > 10) {
    console.log(`... y ${jsonData.length - 10} filas más`);
  }
  
  // También convertir a JSON con headers
  console.log('\n📋 Datos como JSON (primeros 5 registros):');
  const jsonWithHeaders = XLSX.utils.sheet_to_json(worksheet);
  jsonWithHeaders.slice(0, 5).forEach((row, index) => {
    console.log(`${index + 1}:`, JSON.stringify(row, null, 2));
  });
});
