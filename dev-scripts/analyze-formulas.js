const XLSX = require('xlsx');
const path = require('path');

// Leer el archivo Excel para analizar las fórmulas
const filePath = path.join(__dirname, '../data/stock.xlsx');
const workbook = XLSX.readFile(filePath);
const worksheet = workbook.Sheets['Hoja1'];
const jsonData = XLSX.utils.sheet_to_json(worksheet);

// Analizar un producto para entender los cálculos
console.log('🔍 Analizando cálculos del Excel...\n');

const producto = jsonData[0]; // Primer producto como ejemplo
console.log('📝 Producto ejemplo:', {
  categoria: producto.CATEGORIA,
  marca: producto.MARCA,
  modelo: producto.MODELO,
  detalle: producto.DETALLE,
  valorInicial: producto['VALOR'],
  porcentajeAplicado: producto['PORCENTAJE APLICADO']
});

console.log('\n📊 Análisis de cálculos:');
console.log('Valor:', producto['VALOR']);
console.log('Porcentaje aplicado:', producto['PORCENTAJE APLICADO'], '%');
console.log('Ganancia en un pago:', producto['GANANCIA EN UN PAGO']);
console.log('Valor en un pago con ganancia:', producto['VALOR EN UN PAGO CON GANANCIA']);
console.log('Valor en 3 cuotas con ganancia:', producto['VALOR EN 3 CUOTAS CON GANANCIA']);
console.log('Valor por cuota (3):', producto['VALOR POR CUOTA (3)']);
console.log('Valor en 6 cuotas con ganancia:', producto['VALOR EN 6 CUOTAS CON GANANCIA']);
console.log('Valor por cuota (6):', producto['VALOR POR CUOTA (6)']);

// Verificar las fórmulas
const valorInicial = producto['VALOR'];
const porcentaje = producto['PORCENTAJE APLICADO'];

console.log('\n🧮 Verificando fórmulas:');

// Ganancia = valorInicial * (porcentaje / 100)
const gananciaCalculada = valorInicial * (porcentaje / 100);
console.log('Ganancia calculada:', gananciaCalculada, '| Excel:', producto['GANANCIA EN UN PAGO']);

// Valor con ganancia = valorInicial + ganancia
const valorConGanancia = valorInicial + gananciaCalculada;
console.log('Valor con ganancia:', valorConGanancia, '| Excel:', producto['VALOR EN UN PAGO CON GANANCIA']);

// Para 3 cuotas: agregar 3% de recargo
const recargo3Cuotas = 0.03;
const valorEn3Cuotas = valorConGanancia * (1 + recargo3Cuotas);
const valorPorCuota3 = valorEn3Cuotas / 3;
console.log('Valor en 3 cuotas:', valorEn3Cuotas, '| Excel:', producto['VALOR EN 3 CUOTAS CON GANANCIA']);
console.log('Valor por cuota (3):', valorPorCuota3, '| Excel:', producto['VALOR POR CUOTA (3)']);

// Para 6 cuotas: agregar 10% de recargo
const recargo6Cuotas = 0.10;
const valorEn6Cuotas = valorConGanancia * (1 + recargo6Cuotas);
const valorPorCuota6 = valorEn6Cuotas / 6;
console.log('Valor en 6 cuotas:', valorEn6Cuotas, '| Excel:', producto['VALOR EN 6 CUOTAS CON GANANCIA']);
console.log('Valor por cuota (6):', valorPorCuota6, '| Excel:', producto['VALOR POR CUOTA (6)']);
