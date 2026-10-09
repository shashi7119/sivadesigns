# Invoice Workflow Reference

## Scope
Use this guide for changes in src/components/Invoice.js and src/components/invoiceUtils.js.

## Current Behavioral Contracts
- Invoice supports both create and edit flows based on route state invoice number.
- Customer and shipping data may arrive with multiple alternate key names.
- Tax mode is derived from customer state code.
- Printable values should never display raw undefined/null text.

## Required Normalization
- Convert missing, blank, undefined, or null values to display fallback values.
- Keep buyer details shape consistent:
  - name
  - address1
  - address2
  - city
  - pincode
  - state
  - gstin
  - contact
- Preserve compatibility aliases from payloads:
  - customerId/customerid/customer_id/customerID
  - stateCode/statecode/customer_state_code

## Tax Logic
- State code 33 means intra-state tax split (CGST/SGST).
- Other state codes use IGST.
- Keep two-decimal string outputs from helpers for print consistency.

## Edit Checklist
1. Confirm whether change affects create mode, edit mode, or both.
2. Validate fallback behavior for missing customer details.
3. Verify tax split labels and numbers match selected tax mode.
4. Ensure print-ready output remains readable and sanitized.
5. Add or update tests in invoiceUtils.test.js when helper behavior changes.
