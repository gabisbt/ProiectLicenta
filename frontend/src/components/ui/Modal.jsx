import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ children, onClose }) => {
  // Previne scroll-ul în pagină când modalul este deschis
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Cleanup function pentru a restaura scroll-ul când modalul se închide
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Oprește propagarea click-ului în modal pentru a preveni închiderea accidentală
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden relative m-4"
        onClick={handleModalClick}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors z-10"
        >
          <FaTimes size={20} />
        </button>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;