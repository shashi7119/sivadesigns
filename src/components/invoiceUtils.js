export function getTaxStatusFromStateCode(stateCode) {
  const normalizedCode = Number(stateCode);

  if (normalizedCode === 33) {
    return {
      label: 'CGST/SGST',
      type: 'cgst_sgst',
      taxColumns: ['CGST', 'SGST']
    };
  }

  return {
    label: 'IGST',
    type: 'igst',
    taxColumns: ['IGST']
  };
}

export function getTaxBreakdown(totalTax, taxType = 'igst') {
  const safeTax = Number(totalTax || 0);
  const total = Number.isFinite(safeTax) ? safeTax : 0;

  if (taxType === 'cgst_sgst') {
    const half = total / 2;
    return {
      totalTax: total.toFixed(2),
      cgst: half.toFixed(2),
      sgst: half.toFixed(2),
      igst: '0.00'
    };
  }

  return {
    totalTax: total.toFixed(2),
    cgst: '0.00',
    sgst: '0.00',
    igst: total.toFixed(2)
  };
}

export function getLineItemTaxBreakdown(item, taxType = 'igst') {
  const quantity = Number(item?.quantity || 0);
  const rate = Number(item?.rate || 0);
  const baseAmount = quantity * rate;
  const taxPercent = Number(item?.tax || 0);
  const itemTax = (taxPercent / 100) * baseAmount;

  if (taxType === 'cgst_sgst') {
    const half = itemTax / 2;
    return {
      taxAmount: itemTax.toFixed(2),
      cgst: half.toFixed(2),
      sgst: half.toFixed(2),
      igst: '0.00'
    };
  }

  return {
    taxAmount: itemTax.toFixed(2),
    cgst: '0.00',
    sgst: '0.00',
    igst: itemTax.toFixed(2)
  };
}
