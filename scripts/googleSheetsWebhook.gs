function createJsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function doOptions() {
  return createJsonResponse({ success: true });
}

function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) {
      throw new Error('Missing request body.');
    }

    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
    if (!sheet) {
      throw new Error('Sheet "Orders" not found. Create a sheet named Orders in the spreadsheet.');
    }

    const items = Array.isArray(data.items)
      ? data.items.map((item) => `${item.name} x${item.quantity} (${item.size || '-'} / ${item.color || '-'})`).join('\n')
      : '';

    sheet.appendRow([
      data.id,
      data.customerName,
      data.customerPhone,
      data.wilaya,
      data.commune,
      data.address,
      data.deliveryType,
      data.paymentMethod,
      data.deliveryCompany,
      data.deliveryPrice,
      data.subtotal,
      data.couponCode || '',
      data.couponDiscount,
      data.total,
      data.status,
      data.source,
      data.createdAt,
      items,
    ]);

    return createJsonResponse({ success: true });
  } catch (error) {
    const errorMessage = error && error.message ? error.message : String(error);
    return createJsonResponse({ success: false, error: errorMessage });
  }
}
