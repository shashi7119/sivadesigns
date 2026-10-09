import {
  getLineItemTaxBreakdown,
  getTaxBreakdown,
  getTaxStatusFromStateCode,
  hasShipToOverride,
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
