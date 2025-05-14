import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';

const getImageFromUrl = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error loading image:", error);
    return null;
  }
}

export const generateAuctionInvoice = async (auctionWon, user) => {
  toast.info("Generating your invoice, please wait...", {
    position: "bottom-right",
    autoClose: 3000
  });

  const auction = {
    ...auctionWon,
    description: auctionWon.description || "Vintage item from RetroShop auction"
  };

  const doc = new jsPDF();
  
  doc.setFillColor(0, 179, 179); 
  doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('RetroShop - Invoice', 105, 25, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 15, 60);
  doc.text(`Invoice #: INV-${auction._id.substring(0, 8).toUpperCase()}`, 15, 70);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Buyer Information:', 15, 90);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`Name: ${user.userName}`, 15, 100);
  doc.text(`Email: ${user.email}`, 15, 110);
  doc.text(`Address: ${user.address || 'Not provided'}`, 15, 120);
  doc.text(`Phone: ${user.phone || 'Not provided'}`, 15, 130);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Auction Details:', 15, 150);
  
  autoTable(doc, {
    startY: 160,
    head: [['Item', 'Description', 'Won Date', 'Final Price']],
    body: [
      [
        auction.title || "Untitled Item", 
        auction.description,  
        new Date(auction.wonAt).toLocaleDateString(),
        `${auction.finalBid || auction.highestBid || auction.startingBid} RON`
      ]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [0, 179, 179],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
  });
  
  const finalPrice = auction.finalBid || auction.highestBid || auction.startingBid;
  const vat = finalPrice * 0.19; 
  const total = finalPrice + vat;
  
  const finalY = doc.lastAutoTable.finalY + 20;
  
  autoTable(doc, {
    startY: finalY,
    head: [['', 'Amount (RON)']],
    body: [
      ['Subtotal', finalPrice.toFixed(2)],
      ['VAT (19%)', vat.toFixed(2)],
      ['Total', total.toFixed(2)]
    ],
    theme: 'grid',
    styles: {
      cellPadding: 5
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' }
    },
    margin: { left: 100 },
    tableWidth: 100,
  });
  
  if (auction.image?.url) {
    try {
      const imageData = await getImageFromUrl(auction.image.url);
      
      if (imageData) {
        const imgHeight = 60; // inaltimea imaginii în PDF
        const imgWidth = 60; // latimea imaginii în PDF
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Product Image:', 15, finalY - 5);

        doc.addImage(
          imageData, 
          'JPEG', 
          15, 
          finalY, 
          imgWidth,
          imgHeight
        );
      }
    } catch (error) {
      console.error("Error adding image to PDF:", error);
      doc.text('Product image could not be loaded', 15, finalY + 80);
    }
  }
  
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for using RetroShop!', 105, pageHeight - 20, { align: 'center' });
  doc.text('This is an electronically generated invoice and does not require a signature.', 105, pageHeight - 15, { align: 'center' });

  doc.save(`RetroShop_Invoice_${auction._id}.pdf`);
  
  toast.success("Invoice successfully downloaded!", {
    position: "bottom-right",
    autoClose: 3000
  });
};