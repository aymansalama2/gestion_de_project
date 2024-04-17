import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { jsPDF } from 'jspdf';

const ImageTextSearch = () => {
  const [imageSrc, setImageSrc] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [modifiedText, setModifiedText] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImageSrc(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleOCR = async () => {
    setLoading(true);
    setError('');
    setText('');
    setModifiedText('');

    if (!imageSrc) {
      setLoading(false);
      setError('No image uploaded');
      return;
    }

    try {
      const { data: { text } } = await Tesseract.recognize(imageSrc, 'eng');
      setLoading(false);
      if (text.length > 0) {
        setText(text);
        setModifiedText(text); // Initialize modified text with the extracted text
      } else {
        setError('No text found in the image');
      }
    } catch (error) {
      setLoading(false);
      setError('Error processing image: ' + error.message);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSavePDF = () => {
    const doc = new jsPDF();
    doc.text(modifiedText, 10, 10);
    doc.save('modified_text.pdf');
  };

  const handleModifyText = (e) => {
    setModifiedText(e.target.value);
  };

  const renderHighlightedText = (text, searchTerm) => {
    if (!searchTerm) return text;
  
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
  
    return parts.map((part, index) => (
      regex.test(part) ? <span key={index} style={{ color: 'red' }}>{part}</span> : part
    ));
  };
  

  const occurrences = (text.match(new RegExp(searchTerm, 'gi')) || []).length;

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 rounded-lg shadow-lg">
      <input type="file" onChange={handleImageChange} className="mb-4" />
      <button onClick={handleOCR} disabled={loading} className="btn">
        {loading ? 'Loading...' : 'Extract Text'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search name..."
        className="input"
      />
      {searchTerm && (
        <p className="mt-2 text-sm text-gray-700">
          <strong>{occurrences}</strong> occurrences found
        </p>
      )}
      <div className="mt-4">
        <textarea
          value={modifiedText}
          onChange={handleModifyText}
          rows="6"
          cols="50"
          className="textarea"
        />
      </div>
      <div className="mt-4">
        <button onClick={handleSavePDF} className="btn btn-green">
          Save as PDF
        </button>
      </div>
      {imageSrc && <img src={imageSrc} alt="Uploaded" className="mt-4" style={{ maxWidth: '100%' }} />}
    </div>
  );
};

export default ImageTextSearch;
