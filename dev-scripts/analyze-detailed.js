const XLSX = require('xlsx');
const path = require('path');

// Leer el archivo Excel para analizar las fórmulas
const filePath = path.join(__dirname, '../data/stock.xlsx');
const workbook = XLSX.readFile(filePath);
const worksheet = workbook.Sheets['Hoja1'];
const jsonData = XLSX.utils.sheet_to_json(worksheet);

console.log('🔍 Analizando múltiples productos para entender las fórmulas...\n');

// Analizar los primeros 3 productos
jsonData.slice(0, 3).forEach((producto, index) => {
  console.log(`\n📝 PRODUCTO ${index + 1}:`);
  console.log('Valor:', producto['VALOR']);
  console.log('Porcentaje aplicado:', producto['PORCENTAJE APLICADO'], '%');
  
  const valorInicial = producto['VALOR'];
  const porcentaje = producto['PORCENTAJE APLICADO'];
  
  // Ganancia
  const ganancia = valorInicial * (porcentaje / 100);
  console.log('Ganancia calculada:', ganancia, '| Excel:', producto['GANANCIA EN UN PAGO']);
  
  // Valor con ganancia
  const valorConGanancia = valorInicial + ganancia;
  console.log('Valor con ganancia:', valorConGanancia, '| Excel:', producto['VALOR EN UN PAGO CON GANANCIA']);
  
  // Análisis de 3 cuotas
  const valor3CuotasExcel = producto['VALOR EN 3 CUOTAS CON GANANCIA'];
  const factorRecargo3 = valor3CuotasExcel / valorConGanancia;
  console.log('Factor recargo 3 cuotas:', factorRecargo3);
  
  // Análisis de 6 cuotas  
  const valor6CuotasExcel = producto['VALOR EN 6 CUOTAS CON GANANCIA'];
  const factorRecargo6 = valor6CuotasExcel / valorConGanancia;
  console.log('Factor recargo 6 cuotas:', factorRecargo6);
  
  console.log('Valor por cuota (3) Excel:', producto['VALOR POR CUOTA (3)']);
  console.log('Valor por cuota (6) Excel:', producto['VALOR POR CUOTA (6)']);
  
  // Verificar si es simplemente dividir
  console.log('División 3 cuotas:', valor3CuotasExcel / 3);
  console.log('División 6 cuotas:', valor6CuotasExcel / 6);
});
