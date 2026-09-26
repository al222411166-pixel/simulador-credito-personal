document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-calcular').addEventListener('click', procesarSimulacion);
  document.getElementById('monto').addEventListener('input', actualizarTotalesEntrada);
  document.getElementById('comision-select').addEventListener('change', actualizarTotalesEntrada);

  actualizarTotalesEntrada();
  procesarSimulacion();
});

const IVA_VALOR = 0.16;

function formatearMoneda(valor) {
  return '$' + valor.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function actualizarTotalesEntrada() {
  const monto = parseFloat(document.getElementById('monto').value) || 0;
  const porcentajeComision = parseFloat(document.getElementById('comision-select').value) || 0;

  // Cálculo de comisión con IVA incluido
  const comisionSinIVA = monto * porcentajeComision;
  const comisionConIVA = comisionSinIVA * (1 + IVA_VALOR);
  const totalFinanciar = monto + comisionConIVA;

  document.getElementById('monto-comision').value = formatearMoneda(comisionConIVA);
  document.getElementById('total-financiar').value = formatearMoneda(totalFinanciar);
}

function procesarSimulacion() {
  actualizarTotalesEntrada();

  const monto = parseFloat(document.getElementById('monto').value);
  const tasaAnual = parseFloat(document.getElementById('tasa').value) / 100;
  const plazoMeses = parseInt(document.getElementById('plazo').value);
  const porcentajeComision = parseFloat(document.getElementById('comision-select').value) || 0;

  if (isNaN(monto) || monto <= 0) {
    alert("Por favor ingrese un monto válido.");
    return;
  }

  // Regla de amortización constante sobre saldo insoluto
  const totalFinanciar = monto + (monto * porcentajeComision * (1 + IVA_VALOR));
  const amortizacionCapital = totalFinanciar / plazoMeses;
  const tasaMensualEquivalente = tasaAnual / 12;

  let saldoInsoluto = totalFinanciar;
  const tablaBody = document.querySelector('#tabla-amortizacion tbody');
  tablaBody.innerHTML = '';

  for (let periodo = 1; periodo <= plazoMeses; periodo++) {
    const interesDelPeriodo = saldoInsoluto * tasaMensualEquivalente;
    const ivaSobreInteres = interesDelPeriodo * IVA_VALOR;
    const pagoCapitalPeriodo = amortizacionCapital;
    const pagoFijoMensual = pagoCapitalPeriodo + interesDelPeriodo;
    const pagoMensualTotal = pagoFijoMensual + ivaSobreInteres;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${periodo}</td>
      <td>${formatearMoneda(saldoInsoluto)}</td>
      <td>${formatearMoneda(pagoCapitalPeriodo)}</td>
      <td>${formatearMoneda(interesDelPeriodo)}</td>
      <td>${formatearMoneda(pagoFijoMensual)}</td>
      <td>${formatearMoneda(ivaSobreInteres)}</td>
      <td style="font-weight: bold;">${formatearMoneda(pagoMensualTotal)}</td>
    `;
    tablaBody.appendChild(row);

    saldoInsoluto -= amortizacionCapital;
    if (saldoInsoluto < 0) saldoInsoluto = 0;
  }
}