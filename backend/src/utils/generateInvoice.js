import PDFDocument from 'pdfkit';

const generateInvoice = (order, res) => {
  const doc = new PDFDocument({ margin: 50 });

  // Pipe its output somewhere, e.g. onto a response
  doc.pipe(res);

  // Header
  doc
    .fontSize(20)
    .text('INVOICE', { align: 'center' })
    .moveDown();

  doc
    .fontSize(14)
    .text(`Plusway Spare Parts`, { align: 'left' })
    .fontSize(10)
    .text(`Order ID: ${order._id}`)
    .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`)
    .moveDown();

  // Customer Info
  doc
    .fontSize(12)
    .text(`Bill To:`)
    .fontSize(10)
    .text(`Name: ${order.customer.name}`)
    .text(`Email: ${order.customer.email}`)
    .text(`Mobile: ${order.customer.mobile}`)
    .text(`Address: ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.pincode}`)
    .moveDown();

  // Table Header
  const tableTop = 250;
  doc
    .fontSize(10)
    .text('Item', 50, tableTop)
    .text('Qty', 300, tableTop)
    .text('Price', 350, tableTop)
    .text('Total', 450, tableTop);

  doc
    .moveTo(50, tableTop + 15)
    .lineTo(550, tableTop + 15)
    .stroke();

  // Table Content
  let i = 0;
  order.orderItems.forEach((item) => {
    const y = tableTop + 30 + i * 20;
    doc
      .text(item.name, 50, y)
      .text(item.qty.toString(), 300, y)
      .text(`₹${item.price}`, 350, y)
      .text(`₹${item.price * item.qty}`, 450, y);
    i++;
  });

  // Footer / Totals
  const footerTop = tableTop + 50 + i * 20;
  doc
    .moveTo(50, footerTop)
    .lineTo(550, footerTop)
    .stroke();

  doc
    .fontSize(10)
    .text(`Subtotal: ₹${order.itemsPrice}`, 400, footerTop + 15)
    .text(`Shipping: ₹${order.shippingPrice}`, 400, footerTop + 30)
    .text(`Tax: ₹${order.taxPrice}`, 400, footerTop + 45)
    .fontSize(12)
    .text(`Total: ₹${order.totalPrice}`, 400, footerTop + 65, { bold: true });

  doc.end();
};

export default generateInvoice;
