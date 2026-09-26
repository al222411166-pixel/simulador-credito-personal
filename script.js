document.addEventListener('DOMContentLoaded', () => {
  const btnCalcular = document.getElementById('btn-calcular');
  const btnLimpiar = document.getElementById('btn-limpiar');
  const montoInput = document.getElementById('monto');
  const comisionSelect = document.getElementById('comision-select');
  const tasaSelect = document.getElementById('tasa');
  const plazoSelect = document.getElementById('plazo');

  btnCalcular.addEventListener('click', procesarSimulacion);
  btnLimpiar.addEventListener('click', limpiarFormulario);

  montoInput.addEventListener('input', recalcularTotales);
  comisionSelect.addEventListener('change', recalcularTotales);
  tasaSelect.addEventListener('change', actualizarEstimados);
  plazoSelect.addEventListener('change', actualizarEstimados);
});

const IVA_VALOR = 0.16;

function formatearMoneda(valor) {
  if (isNaN(valor)) return '$0.00';
  return '$' + valor.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function recalcularTotales() {
  const monto = parseFloat(document.getElementById('monto').value);
  const porcentajeComision = parseFloat(document.getElementById('comision-select').value) || 0;

  if (isNaN(monto) || monto <= 0) {
    document.getElementById('monto-comision').value = '';
    document.getElementById('total-financiar').value = '';
    return;
  }

  const comisionConIVA = monto * porcentajeComision * (1 + IVA_VALOR);
  const totalFinanciar = monto + comisionConIVA;

  document.getElementById('monto-comision').value = formatearMoneda(comisionConIVA);
  document.getElementById('total-financiar').value = formatearMoneda(totalFinanciar);
}

function actualizarEstimados() {
  const monto = parseFloat(document.getElementById('monto').value);
  const tasaAnual = parseFloat(document.getElementById('tasa').value);
  const plazoMeses = parseInt(document.getElementById('plazo').value);
  const porcentajeComision = parseFloat(document.getElementById('comision-select').value) || 0;

  if (monto > 0 && tasaAnual > 0 && plazoMeses > 0) {
    const totalFinanciar = monto + (monto * porcentajeComision * (1 + IVA_VALOR));
    const tasaMensual = (tasaAnual / 100) / 12;

    const cuotaMensualBase = totalFinanciar * ((tasaMensual * Math.pow(1 + tasaMensual, plazoMeses)) / (Math.pow(1 + tasaMensual, plazoMeses) - 1));
    const pagoPorMil = (cuotaMensualBase / totalFinanciar) * 1000;

    document.getElementById('pago-por-mil').value = formatearMoneda(pagoPorMil);
    document.getElementById('cat-val').value = (tasaAnual + 4.0).toFixed(1) + '%';
  }
}

function procesarSimulacion() {
  const monto = parseFloat(document.getElementById('monto').value);
  const tasaSeleccionada = parseFloat(document.getElementById('tasa').value);
  const plazoMeses = parseInt(document.getElementById('plazo').value);
  const porcentajeComision = parseFloat(document.getElementById('comision-select').value) || 0;

  if (!monto || monto <= 0) {
    alert("Por favor ingrese un monto autorizado válido.");
    document.getElementById('monto').focus();
    return;
  }

  if (isNaN(tasaSeleccionada)) {
    alert("Por favor seleccione una tasa de interés.");
    document.getElementById('tasa').focus();
    return;
  }

  if (isNaN(plazoMeses)) {
    alert("Por favor seleccione un plazo de financiamiento.");
    document.getElementById('plazo').focus();
    return;
  }

  recalcularTotales();
  actualizarEstimados();

  const totalFinanciar = monto + (monto * porcentajeComision * (1 + IVA_VALOR));
  const amortizacionCapital = totalFinanciar / plazoMeses;
  const tasaMensualEquivalente = (tasaSeleccionada / 100) / 12;

  let saldoInsoluto = totalFinanciar;
  const tablaBody = document.querySelector('#tabla-amortizacion tbody');
  tablaBody.innerHTML = '';

  // Variables acumuladoras para los totales
  let sumaCapital = 0;
  let sumaIntereses = 0;
  let sumaPagoFijo = 0;
  let sumaIva = 0;
  let sumaPagoTotal = 0;

  for (let periodo = 1; periodo <= plazoMeses; periodo++) {
    const interesPeriodo = saldoInsoluto * tasaMensualEquivalente;
    const ivaPeriodo = interesPeriodo * IVA_VALOR;
    const pagoCapital = amortizacionCapital;
    const pagoFijoMensual = pagoCapital + interesPeriodo;
    const totalMes = pagoFijoMensual + ivaPeriodo;

    // Acumular valores
    sumaCapital += pagoCapital;
    sumaIntereses += interesPeriodo;
    sumaPagoFijo += pagoFijoMensual;
    sumaIva += ivaPeriodo;
    sumaPagoTotal += totalMes;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${periodo}</td>
      <td>${formatearMoneda(saldoInsoluto)}</td>
      <td>${formatearMoneda(pagoCapital)}</td>
      <td>${formatearMoneda(interesPeriodo)}</td>
      <td>${formatearMoneda(pagoFijoMensual)}</td>
      <td>${formatearMoneda(ivaPeriodo)}</td>
      <td style="font-weight: 700; color: #0b2545;">${formatearMoneda(totalMes)}</td>
    `;
    tablaBody.appendChild(row);

    saldoInsoluto -= amortizacionCapital;
    if (saldoInsoluto < 0.01) saldoInsoluto = 0;
  }

  // Actualizar e insertar la fila de Totales en la tabla
  document.getElementById('tot-capital').textContent = formatearMoneda(sumaCapital);
  document.getElementById('tot-intereses').textContent = formatearMoneda(sumaIntereses);
  document.getElementById('tot-fijo').textContent = formatearMoneda(sumaPagoFijo);
  document.getElementById('tot-iva').textContent = formatearMoneda(sumaIva);
  document.getElementById('tot-mensual').textContent = formatearMoneda(sumaPagoTotal);
  document.getElementById('tabla-totales').style.display = 'table-footer-group';

  // Actualizar tarjetas métricas
  document.getElementById('resumen-intereses').textContent = formatearMoneda(sumaIntereses);
  document.getElementById('resumen-iva').textContent = formatearMoneda(sumaIva);
  document.getElementById('resumen-total-final').textContent = formatearMoneda(sumaPagoTotal);
  document.getElementById('resumen-cards').style.display = 'grid';
}

function limpiarFormulario() {
  document.getElementById('cliente').value = '';
  document.getElementById('monto').value = '';
  document.getElementById('monto-comision').value = '';
  document.getElementById('total-financiar').value = '';
  document.getElementById('pago-por-mil').value = '';
  document.getElementById('cat-val').value = '';

  document.getElementById('comision-select').selectedIndex = 0;
  document.getElementById('plazo').selectedIndex = 0;
  document.getElementById('tasa').selectedIndex = 0;

  // Limpiar tabla, fila de totales y tarjetas
  document.querySelector('#tabla-amortizacion tbody').innerHTML = '';
  document.getElementById('tabla-totales').style.display = 'none';
  document.getElementById('resumen-cards').style.display = 'none';
}
