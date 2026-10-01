import PDFDocument from 'pdfkit';
import crypto from 'crypto';
import bwipjs from 'bwip-js';

// Signed token that lets whoever scans the invoice QR download that one invoice
export const invoiceToken = (orderId) =>
  crypto.createHmac('sha256', process.env.JWT_SECRET).update('invoice:' + String(orderId)).digest('hex').slice(0, 32);

// Seller details printed on the label and the tax invoice. Override via env.
const seller = () => ({
  name: process.env.SELLER_NAME || 'Plusway Spare Parts',
  address: process.env.SELLER_ADDRESS || '',
  gstin: process.env.SELLER_GSTIN || '',
  pan: process.env.SELLER_PAN || '',
});

// The built-in PDF fonts have no rupee glyph
const money = (n) => (Number(n) || 0).toFixed(2);

const barcode = (bcid, text, opts = {}) =>
  bwipjs.toBuffer({ bcid, text, scale: 3, ...opts });

const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB').replace(/\//g, '-');
const fmtDateTime = (d) =>
  `${fmtDate(d)}, ${new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;

const L = 30; // left margin
const W = 535; // content width (A4 595 - 2*30)

/**
 * Streams a one-page-style PDF to `res`: a shipping label on top, a dashed
 * cut line, then a tax invoice. Used for both the admin and customer downloads.
 * `order.customer` must be populated (name, email, mobile).
 */
const generateInvoice = async (order, res, baseUrl = '') => {
  const downloadUrl = `${baseUrl}/api/customer/invoice/${order._id}/${invoiceToken(order._id)}`;
  const s = seller();
  const orderNo = `PW${String(order._id).toUpperCase()}`;
  const invoiceNo = `PWINV${new Date(order.createdAt).getFullYear()}${String(order._id).slice(-8).toUpperCase()}`;
  const isCod = String(order.paymentMethod).toLowerCase() === 'cod';
  const addr = order.shippingAddress || {};
  const addrLines = [
    addr.address,
    addr.landmark,
    [addr.city, addr.state].filter(Boolean).join(', '),
    `${addr.pincode || ''}${addr.country ? `, ${addr.country}` : ''}`,
  ].filter(Boolean);

  const [orderBarcode, awbBarcode, matrix, qr] = await Promise.all([
    barcode('code128', orderNo, { height: 14, includetext: false }),
    barcode('code128', orderNo, { height: 12, includetext: false }),
    barcode('qrcode', downloadUrl, { scale: 4 }),
    barcode('qrcode', downloadUrl, { scale: 3 }),
  ]);

  const doc = new PDFDocument({ size: 'A4', margins: { top: 30, bottom: 0, left: 30, right: 30 } });
  doc.pipe(res);

  // ─── Shipping label ────────────────────────────────────────────────────
  let y = 30;
  const labelH = 436;
  const rightX = L + 170;
  doc.lineWidth(1).strokeColor('#000').rect(L, y, W, labelH).stroke();

  // header row
  doc.moveTo(L, y + 30).lineTo(L + W, y + 30).stroke();
  doc.moveTo(L + 60, y).lineTo(L + 60, y + 30).stroke();
  doc.moveTo(L + W - 140, y).lineTo(L + W - 140, y + 30).stroke();
  doc.font('Helvetica-Bold').fontSize(16).fillColor('#000').text('STD', L + 8, y + 8);
  doc.font('Helvetica').fontSize(9).text(s.name, L + 68, y + 4, { width: 280 });
  doc.font('Helvetica-Bold').fontSize(11).text(orderNo, L + 68, y + 15, { width: 280 });
  doc.font('Helvetica-Bold').fontSize(13).text(isCod ? 'COD' : 'PREPAID', L + W - 132, y + 8, { width: 124 });
  y += 30;

  // left column: brand + barcode
  doc.moveTo(rightX, y).lineTo(rightX, y + 232).stroke();
  doc.font('Helvetica').fontSize(11).text('Ordered through', L + 10, y + 10);
  doc.font('Helvetica-Bold').fontSize(16).text('PLUSWAY', L + 10, y + 28);
  doc.font('Helvetica-Bold').fontSize(9).text('SPARE PARTS', L + 10, y + 46);
  doc.image(awbBarcode, L + 10, y + 70, { width: 140, height: 90 });
  doc.font('Helvetica-Bold').fontSize(8).text(`Order No.\n${orderNo}`, L + 10, y + 170, { width: 150 });
  doc.font('Helvetica').fontSize(10).text(
    `Order Date: ${fmtDate(order.createdAt)}\nItems: ${order.orderItems.reduce((n, i) => n + i.qty, 0)}`,
    L + 10, y + 205, { width: 150 },
  );

  // right column: matrix code over the address
  doc.image(matrix, rightX + 120, y + 6, { fit: [112, 112] });
  doc.moveTo(rightX, y + 128).lineTo(L + W, y + 128).stroke();
  doc.font('Helvetica-Bold').fontSize(13).text('Shipping/Customer address:', rightX + 8, y + 135);
  doc.font('Helvetica-Bold').fontSize(12).text(`Name: ${addr.name || order.customer?.name || ''}`, rightX + 8, y + 152, { width: W - 178 });
  doc.font('Helvetica').fontSize(10).text(addrLines.join(',\n'), rightX + 8, y + 168, { width: W - 178 });
  doc.font('Helvetica').fontSize(9).text(`Mobile: ${addr.mobile || order.customer?.mobile || ''}`, rightX + 8, y + 214, { width: W - 178 });
  y += 232;

  // sold by + items
  doc.moveTo(L, y).lineTo(L + W, y).stroke();
  doc.font('Helvetica').fontSize(8).text(
    `Sold By: ${s.name}${s.address ? `, ${s.address}` : ''}${s.gstin ? `\nGSTIN: ${s.gstin}` : ''}`,
    L + 4, y + 4, { width: W - 8 },
  );
  y += 34;
  doc.moveTo(L, y).lineTo(L + W, y).stroke();
  doc.font('Helvetica-Bold').fontSize(8).text('Product | Description', L + 4, y + 4);
  doc.text('QTY', L + W - 36, y + 4);
  doc.moveTo(L + W - 40, y).lineTo(L + W - 40, y + 70).stroke();
  y += 16;
  doc.moveTo(L, y).lineTo(L + W, y).stroke();
  const shown = order.orderItems.slice(0, 3);
  shown.forEach((item, i) => {
    doc.font('Helvetica').fontSize(8).text(`${i + 1} ${item.name}`, L + 4, y + 4 + i * 16, { width: W - 52, height: 12, ellipsis: true, lineBreak: false });
    doc.text(String(item.qty), L + W - 36, y + 4 + i * 16);
  });
  if (order.orderItems.length > shown.length) {
    doc.font('Helvetica-Oblique').fontSize(8).text(`+ ${order.orderItems.length - shown.length} more item(s) — see invoice`, L + 4, y + 4 + shown.length * 16);
  }
  y += 54;

  // footer: barcode + packaging note
  doc.moveTo(L, y).lineTo(L + W, y).stroke();
  doc.font('Helvetica').fontSize(10).text(orderNo, L + 8, y + 6);
  doc.font('Helvetica-Bold').fontSize(9).text('Use Transparent Packaging', L + W - 180, y + 6);
  doc.image(orderBarcode, L + 8, y + 22, { width: 300, height: 26 });
  doc.font('Helvetica-Bold').fontSize(8).text('Not for resale.', L + 8, y + 55);
  doc.font('Helvetica-Bold').fontSize(8).text(`Printed at ${fmtDateTime(new Date())}`, L + W - 190, y + 55);

  // ─── Cut line ──────────────────────────────────────────────────────────
  y = 30 + labelH + 14;
  doc.dash(6, { space: 4 }).moveTo(L, y).lineTo(L + W, y).stroke().undash();

  // ─── Tax invoice ───────────────────────────────────────────────────────
  y += 14;
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#000').text('Tax Invoice', L, y);
  doc.font('Helvetica').fontSize(8).fillColor('#444');
  doc.text('Order Id:', L + 90, y);
  doc.font('Helvetica-Bold').fillColor('#000').text(orderNo, L + 90, y + 10);
  doc.font('Helvetica').fillColor('#444').text(`Order Date: ${fmtDateTime(order.createdAt)}`, L + 90, y + 22);
  doc.text('Invoice No:', L + 260, y);
  doc.font('Helvetica-Bold').fillColor('#000').text(invoiceNo, L + 260, y + 10);
  doc.font('Helvetica').fillColor('#444').text(`Invoice Date: ${fmtDateTime(order.createdAt)}`, L + 260, y + 22);
  if (s.gstin) doc.text(`GSTIN: ${s.gstin}`, L + 400, y, { width: 90 });
  if (s.pan) doc.text(`PAN: ${s.pan}`, L + 400, y + 10, { width: 90 });
  doc.image(qr, L + W - 56, y - 6, { width: 56, height: 56 });
  y += 56;

  // parties
  const colW = 165;
  const party = (title, x, lines) => {
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#444').text(title, x, y);
    doc.font('Helvetica').fontSize(8).fillColor('#000').text(lines.filter(Boolean).join('\n'), x, y + 13, { width: colW - 8 });
  };
  party('Sold By', L, [s.name, s.address, s.gstin && `GST: ${s.gstin}`]);
  party('Billing Address', L + colW, [addr.name, ...addrLines]);
  party('Shipping ADDRESS', L + colW * 2, [addr.name, ...addrLines]);
  y += 66;

  // items table
  const cols = [
    ['Product', 150, 'left'],
    ['Qty', 30, 'center'],
    ['Gross Amount', 65, 'right'],
    ['Discount', 55, 'right'],
    ['Taxable Value', 65, 'right'],
    ['Tax', 60, 'right'],
    ['Total', 110, 'right'],
  ];
  const drawRow = (vals, yy, h, bold) => {
    let x = L;
    doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(8).fillColor('#000');
    cols.forEach(([, w, align], i) => {
      doc.text(String(vals[i]), x + 4, yy + 5, { width: w - 8, align, height: h - 6, ellipsis: true });
      x += w;
    });
  };
  doc.lineWidth(0.8).rect(L, y, W, 20).stroke();
  drawRow(cols.map((c) => c[0]), y, 20, true);
  y += 20;

  const taxRate = order.itemsPrice > 0 ? order.taxPrice / order.itemsPrice : 0;
  let gross = 0;
  let discountTotal = 0;
  let qtyTotal = 0;
  order.orderItems.forEach((item) => {
    if (y > 760) {
      doc.addPage();
      y = 40;
    }
    const grossAmt = (item.originalPrice ?? item.price) * item.qty;
    const taxable = item.price * item.qty;
    const disc = Math.max(0, grossAmt - taxable);
    const tax = taxable * taxRate;
    gross += grossAmt;
    discountTotal += disc;
    qtyTotal += item.qty;
    const rowH = 26;
    doc.rect(L, y, W, rowH).stroke();
    drawRow([item.name, item.qty, money(grossAmt), money(disc), money(taxable), money(tax), money(taxable + tax)], y, rowH, false);
    y += rowH;
  });

  const extraRow = (label, amount) => {
    doc.rect(L, y, W, 20).stroke();
    drawRow([label, '', '', '', money(amount), money(0), money(amount)], y, 20, true);
    y += 20;
  };
  if (order.shippingPrice > 0) extraRow('Shipping Fee', order.shippingPrice);

  doc.rect(L, y, W, 30).stroke();
  doc.font('Helvetica-Bold').fontSize(8).text(`TOTAL QTY: ${qtyTotal}`, L + 4, y + 10);
  doc.fontSize(9).text(`TOTAL PRICE: ${money(order.totalPrice)}`, L + W - 200, y + 6, { width: 196, align: 'right' });
  doc.font('Helvetica').fontSize(7).text('All values are in INR', L + W - 200, y + 18, { width: 196, align: 'right' });
  y += 44;

  doc.font('Helvetica').fontSize(8).fillColor('#000');
  doc.text(`Tax charged at ${(taxRate * 100).toFixed(2)}% on taxable value. Payment: ${isCod ? 'Cash on Delivery' : String(order.paymentMethod).toUpperCase()}${order.isPaid ? ' (Paid)' : ''}.`, L, y, { width: W });
  y += 18;
  if (s.address) {
    doc.font('Helvetica-Bold').text('Seller Registered Address: ', L, y, { continued: true });
    doc.font('Helvetica').text(s.address, { width: 400 });
  }

  // signature block
  let sigY = doc.y + 4;
  if (sigY > 790) {
    doc.addPage();
    sigY = 40;
  }
  doc.font('Helvetica').fontSize(8).text('E. & O.E.', L, sigY + 14);
  doc.font('Helvetica-Bold').fontSize(12).text(s.name.toUpperCase(), L + 280, sigY, { width: W - 280, align: 'right' });
  doc.font('Helvetica').fontSize(8).text('Authorized Signature', L + 280, sigY + 16, { width: W - 280, align: 'right' });

  doc.end();
};

export default generateInvoice;

// Public base URL for links embedded in the PDF (set BACKEND_PUBLIC_URL behind a proxy)
export const publicBaseUrl = (req) =>
  (process.env.BACKEND_PUBLIC_URL || `${req.get('x-forwarded-proto') || req.protocol}://${req.get('host')}`).replace(/\/$/, '');
