import {
  getLineItemTaxBreakdown,
  getTaxBreakdown,
  getTaxStatusFromStateCode,
  hasShipToOverride,
  allocateInvoiceQuantity,
  getAvailableQuantity,
} from "./invoiceUtils";

describe("getTaxStatusFromStateCode", () => {
  it("returns CGST/SGST when the customer state code is 33", () => {
    expect(getTaxStatusFromStateCode(33)).toEqual({
      label: "CGST/SGST",
      type: "cgst_sgst",
      taxColumns: ["CGST", "SGST"],
    });
  });

  it("returns IGST for other state codes", () => {
    expect(getTaxStatusFromStateCode(27)).toEqual({
      label: "IGST",
      type: "igst",
      taxColumns: ["IGST"],
    });
  });

  it("splits the total tax into two equal halves for CGST/SGST", () => {
    expect(getTaxBreakdown(180, "cgst_sgst")).toEqual({
      totalTax: "180.00",
      cgst: "90.00",
      sgst: "90.00",
      igst: "0.00",
    });
  });

  it("keeps the total tax as IGST for inter-state customers", () => {
    expect(getTaxBreakdown(180, "igst")).toEqual({
      totalTax: "180.00",
      cgst: "0.00",
      sgst: "0.00",
      igst: "180.00",
    });
  });

  it("splits a line item tax amount into CGST and SGST", () => {
    expect(
      getLineItemTaxBreakdown(
        { quantity: 10, rate: 100, tax: 18 },
        "cgst_sgst",
      ),
    ).toEqual({
      taxAmount: "180.00",
      cgst: "90.00",
      sgst: "90.00",
      igst: "0.00",
    });
  });

  it("treats a populated ship-to address as an override even when fields use alternate key names", () => {
    expect(
      hasShipToOverride({
        name: "Test Customer",
        address1: "1 Main Road",
        address2: "",
        city: "Coimbatore",
        state: "Tamil Nadu",
        pincode: "641001",
        gstin: "",
        contact_number: "9999999999",
      }),
    ).toBe(true);
  });

  it("returns false when the ship-to address is effectively empty", () => {
    expect(
      hasShipToOverride({
        name: "",
        address1: "   ",
        address2: null,
        city: undefined,
        state: "",
        pincode: "",
        gstin: "",
        contact: "",
      }),
    ).toBe(false);
  });
});

describe("getAvailableQuantity", () => {
  it("subtracts the already invoiced quantity", () => {
    expect(getAvailableQuantity(100, 40)).toBe(60);
  });

  it("never goes below zero", () => {
    expect(getAvailableQuantity(10, 12)).toBe(0);
  });
});

describe("allocateInvoiceQuantity", () => {
  const sources = [
    { dcNo: "DC1", availableQty: 50 },
    { dcNo: "DC2", availableQty: 30 },
  ];

  it("fills the source DCs in order for a partial quantity", () => {
    expect(allocateInvoiceQuantity(sources, 60)).toEqual([
      { dcNo: "DC1", availableQty: 50, invoicedQty: 50, balanceQty: 0 },
      { dcNo: "DC2", availableQty: 30, invoicedQty: 10, balanceQty: 20 },
    ]);
  });

  it("invoices everything when the full quantity is used", () => {
    expect(allocateInvoiceQuantity(sources, 80).map((s) => s.balanceQty)).toEqual([0, 0]);
  });

  it("handles decimal quantities without float drift", () => {
    expect(allocateInvoiceQuantity([{ dcNo: "DC1", availableQty: 10.3 }], 10.1)[0].balanceQty).toBe(0.2);
  });
});
