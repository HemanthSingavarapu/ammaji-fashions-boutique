import io
import qrcode
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from app.config import settings
from app import models

def generate_invoice_pdf(order: models.Order) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'InvoiceTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#8B0000'),
        fontName='Helvetica-Bold'
    )
    subtitle_style = ParagraphStyle(
        'InvoiceSubtitle',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#555555')
    )
    bold_style = ParagraphStyle(
        'InvoiceBold',
        parent=styles['Normal'],
        fontSize=10,
        leading=13,
        fontName='Helvetica-Bold'
    )
    normal_style = ParagraphStyle(
        'InvoiceNormal',
        parent=styles['Normal'],
        fontSize=10,
        leading=13
    )

    story = []

    # Header
    header_data = [
        [
            Paragraph(f"<b>AMMAJI FASHIONS</b><br/><font size=9 color='#666'>Bespoke Blouse Designing & Stitching</font>", title_style),
            Paragraph(f"<b>TAX INVOICE</b><br/>Invoice #: INV-{order.orderNumber}<br/>Date: {order.createdAt.strftime('%d-%b-%Y') if order.createdAt else 'N/A'}", normal_style)
        ]
    ]
    t_header = Table(header_data, colWidths=[320, 200])
    t_header.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ALIGN', (1,0), (1,0), 'RIGHT')
    ]))
    story.append(t_header)
    story.append(Spacer(1, 15))

    # Customer & Order Info
    user_name = order.user.name if (order.user and order.user.name) else "Valued Customer"
    user_email = order.user.email if order.user else ""
    user_mobile = order.user.mobile if (order.user and order.user.mobile) else "N/A"
    address = order.deliveryAddress or (order.user.address if order.user else "N/A")

    info_data = [
        [
            Paragraph("<b>BILLED TO:</b>", bold_style),
            Paragraph("<b>ORDER DETAILS:</b>", bold_style)
        ],
        [
            Paragraph(f"<b>{user_name}</b><br/>Phone: {user_mobile}<br/>Email: {user_email}<br/>Address: {address}", normal_style),
            Paragraph(f"Order #: <b>{order.orderNumber}</b><br/>Status: <b>{order.orderStatus.replace('_', ' ')}</b><br/>Payment Mode: <b>{order.paymentType or 'Standard'}</b><br/>Txn Ref: <b>{order.transactionNumber or 'N/A'}</b>", normal_style)
        ]
    ]
    t_info = Table(info_data, colWidths=[260, 260])
    t_info.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F9F9F9')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#E0E0E0')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_info)
    story.append(Spacer(1, 20))

    # Items Table
    design_name = order.design.name if order.design else (order.customDesignName or "Custom Stitching Order")
    design_desc = order.design.description if order.design else (order.customDesignDetails or "Customer specified customization")

    items_data = [
        [
            Paragraph("<b>Item & Description</b>", bold_style),
            Paragraph("<b>Courier Option</b>", bold_style),
            Paragraph("<b>Amount (INR)</b>", bold_style)
        ],
        [
            Paragraph(f"<b>{design_name}</b><br/><font size=8 color='#666'>{design_desc}</font>", normal_style),
            Paragraph(f"{order.courierOption or 'Standard'}", normal_style),
            Paragraph(f"₹{order.amount:.2f}", bold_style)
        ]
    ]
    t_items = Table(items_data, colWidths=[300, 120, 100])
    t_items.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#8B0000')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#DDDDDD')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (2,0), (2,-1), 'RIGHT'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_items)
    story.append(Spacer(1, 15))

    # Payment Summary
    paid_amt = order.paidAmount if order.paidAmount is not None else 0.0
    balance_amt = order.balanceAmount if order.balanceAmount is not None else (order.amount - paid_amt)

    summary_data = [
        ["Total Amount:", f"₹{order.amount:.2f}"],
        ["Amount Paid (Online/Advance):", f"₹{paid_amt:.2f}"],
        ["Balance Due on Delivery:", f"₹{balance_amt:.2f}"],
        ["Payment Status:", f"{order.paymentStatus}"]
    ]
    t_summary = Table(summary_data, colWidths=[380, 140])
    t_summary.setStyle(TableStyle([
        ('ALIGN', (0,0), (0,-1), 'RIGHT'),
        ('ALIGN', (1,0), (1,-1), 'RIGHT'),
        ('FONTNAME', (0,-2), (-1,-1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0,2), (1,2), colors.HexColor('#8B0000')),
        ('LINEABOVE', (0,0), (-1,0), 0.5, colors.HexColor('#CCCCCC')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_summary)
    story.append(Spacer(1, 30))

    # Bank Details Note
    bank_note = f"<b>Bank Transfer Details:</b> {settings.BANK_NAME} | A/C: {settings.BANK_ACCOUNT_NO} | IFSC: {settings.BANK_IFSC} | UPI: {settings.UPI_VPA}"
    story.append(Paragraph(bank_note, subtitle_style))
    story.append(Spacer(1, 10))
    story.append(Paragraph("Thank you for choosing Ammaji Fashions! For order queries, WhatsApp us at +91 83410 85629.", subtitle_style))

    doc.build(story)
    return buffer.getvalue()

def generate_job_card_pdf(order: models.Order) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=30,
        leftMargin=30,
        topMargin=30,
        bottomMargin=30
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'JobCardTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#003366'),
        fontName='Helvetica-Bold'
    )
    bold_style = ParagraphStyle(
        'JobCardBold',
        parent=styles['Normal'],
        fontSize=10,
        leading=13,
        fontName='Helvetica-Bold'
    )
    normal_style = ParagraphStyle(
        'JobCardNormal',
        parent=styles['Normal'],
        fontSize=10,
        leading=13
    )

    story = []

    # Generate QR Code image for the Order Tracking
    qr_buffer = io.BytesIO()
    qr = qrcode.QRCode(box_size=4, border=1)
    qr.add_data(f"http://localhost:5180/track?orderId={order.orderNumber}")
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    qr_img.save(qr_buffer, format="PNG")
    qr_buffer.seek(0)
    reportlab_qr = Image(qr_buffer, width=70, height=70)

    # Header with QR code
    header_data = [
        [
            Paragraph("<b>AMMAJI FASHIONS — WORKSHOP JOB CARD</b><br/><font size=12 color='#8B0000'><b>ORDER #" + order.orderNumber + "</b></font><br/><font size=9 color='#666'>Date: " + (order.createdAt.strftime('%d-%b-%Y') if order.createdAt else 'N/A') + "</font>", title_style),
            reportlab_qr
        ]
    ]
    t_header = Table(header_data, colWidths=[440, 80])
    t_header.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (1,0), (1,0), 'RIGHT')
    ]))
    story.append(t_header)
    story.append(Spacer(1, 15))

    # Basic Info
    cust_name = order.user.name if (order.user and order.user.name) else "Customer"
    cust_phone = order.user.mobile if (order.user and order.user.mobile) else "N/A"
    design_name = order.design.name if order.design else (order.customDesignName or "Custom Pattern")

    order_info = [
        ["Customer Name:", cust_name, "Phone:", cust_phone],
        ["Design Pattern:", design_name, "Fabric Courier:", order.courierOption or "Standard"],
        ["Order Status:", order.orderStatus.replace('_', ' '), "Payment:", f"Paid: ₹{order.paidAmount or 0} / Bal: ₹{order.balanceAmount or 0}"]
    ]
    t_order_info = Table(order_info, colWidths=[100, 160, 100, 160])
    t_order_info.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F2F5F8')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#D0D8E0')),
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTNAME', (2,0), (2,-1), 'Helvetica-Bold'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_order_info)
    story.append(Spacer(1, 15))

    # Measurement Grid
    story.append(Paragraph("<b>TAILORING MEASUREMENTS (INCHES):</b>", bold_style))
    story.append(Spacer(1, 5))

    m = order.measurement
    m_data = [
        [
            Paragraph("<b>Bust Size:</b> " + (str(m.bust) + '"' if m and m.bust else "-"), normal_style),
            Paragraph("<b>Waist:</b> " + (str(m.waist) + '"' if m and m.waist else "-"), normal_style),
            Paragraph("<b>Shoulder:</b> " + (str(m.shoulder) + '"' if m and m.shoulder else "-"), normal_style)
        ],
        [
            Paragraph("<b>Blouse Length:</b> " + (str(m.blouseLength) + '"' if m and m.blouseLength else "-"), normal_style),
            Paragraph("<b>Sleeve Length:</b> " + (str(m.sleeveLength) + '"' if m and m.sleeveLength else "-"), normal_style),
            Paragraph("<b>Armhole:</b> " + (str(m.armhole) + '"' if m and m.armhole else "-"), normal_style)
        ],
        [
            Paragraph("<b>Front Neck Depth:</b> " + (str(m.frontNeck) + '"' if m and m.frontNeck else "-"), normal_style),
            Paragraph("<b>Back Neck Depth:</b> " + (str(m.backNeck) + '"' if m and m.backNeck else "-"), normal_style),
            Paragraph("<b>Cups/Padded:</b> Standard", normal_style)
        ]
    ]
    t_meas = Table(m_data, colWidths=[173, 173, 174])
    t_meas.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#003366')),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FFFFFF')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_meas)
    story.append(Spacer(1, 15))

    # Special Instructions & Cutting Notes
    notes = (order.specialInstructions or "None") + (" | " + m.otherMeasurements if (m and m.otherMeasurements) else "")
    notes_data = [
        [Paragraph("<b>Special Stitching & Neck/Back Notes:</b>", bold_style)],
        [Paragraph(notes, normal_style)]
    ]
    t_notes = Table(notes_data, colWidths=[520])
    t_notes.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#FFF2E6')),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#FFFAF5')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#FFB266')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_notes)
    story.append(Spacer(1, 20))

    # Workshop Checklist
    checklist_data = [
        [
            Paragraph("<b>Step</b>", bold_style),
            Paragraph("<b>Tailor Signature</b>", bold_style),
            Paragraph("<b>Date / Notes</b>", bold_style)
        ],
        ["[  ] 1. Raw Fabric Checked & Ironed", "", ""],
        ["[  ] 2. Pattern Cut & Lined", "", ""],
        ["[  ] 3. Maggam / Zari Embroidery Verified", "", ""],
        ["[  ] 4. Machine Stitching & Piping", "", ""],
        ["[  ] 5. Tassels / Latkans Attached", "", ""],
        ["[  ] 6. Final QC & Ironing Pass", "", ""]
    ]
    t_check = Table(checklist_data, colWidths=[240, 140, 140])
    t_check.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#E0E0E0')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#999999')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_check)

    doc.build(story)
    return buffer.getvalue()
