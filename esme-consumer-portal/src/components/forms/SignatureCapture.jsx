import React, { useRef, useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Pen, RotateCcw, Upload, X, Check } from 'lucide-react';
export default function SignatureCapture({ 
  label = "Signature", 
  value = '', 
  onChange, 
  required = false,
  width = 500,
  height = 180 
}) {
  const { isDark } = useTheme();
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState('draw');
  const [hasSignature, setHasSignature] = useState(!!value);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    ctx.strokeStyle = isDark ? '#ffffff' : '#1e293b';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
    ctx.fillRect(0, 0, width, height);
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        setHasSignature(true);
      };
      img.src = value;
    }
  }, [isDark, width, height]);
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };
  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };
  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getCanvasCoords(e);
    ctx.strokeStyle = isDark ? '#ffffff' : '#1e293b';
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setHasSignature(true);
  };
  const stopDrawing = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
    saveSignature();
  };
  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.fillStyle = '#ffffff';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      if (isDark) {
        const originalCtx = canvas.getContext('2d');
        const imageData = originalCtx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255 - data[i];       
          data[i + 1] = 255 - data[i + 1]; 
          data[i + 2] = 255 - data[i + 2]; 
        }
        tempCtx.putImageData(imageData, 0, 0);
      } else {
        tempCtx.drawImage(canvas, 0, 0);
      }
      const dataUrl = tempCanvas.toDataURL('image/png');
      onChange && onChange(dataUrl);
    }
  };
  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
    ctx.fillRect(0, 0, width, height);
    setHasSignature(false);
    onChange && onChange('');
  };
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('File size should be less than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
        ctx.fillRect(0, 0, width, height);
        const scale = Math.min(width / img.width, height / img.height) * 0.9;
        const newWidth = img.width * scale;
        const newHeight = img.height * scale;
        const x = (width - newWidth) / 2;
        const y = (height - newHeight) / 2;
        ctx.drawImage(img, x, y, newWidth, newHeight);
        setHasSignature(true);
        saveSignature();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };
  const containerClass = `border rounded-xl p-4 transition-all duration-300 ${
    isDark 
      ? 'bg-slate-800/50 border-slate-600' 
      : 'bg-white border-slate-200'
  }`;
  const labelClass = `block text-sm font-semibold mb-2 ${
    isDark ? 'text-slate-200' : 'text-slate-700'
  }`;
  const tabClass = (active) => `px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
    active
      ? isDark 
        ? 'bg-teal-600 text-white' 
        : 'bg-teal-500 text-white'
      : isDark 
        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
  }`;
  const buttonClass = `px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
    isDark 
      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
  }`;
  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between mb-3">
        <label className={labelClass}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('draw')}
            className={tabClass(mode === 'draw')}
          >
            <Pen size={16} />
            Draw
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('upload');
              fileInputRef.current?.click();
            }}
            className={tabClass(mode === 'upload')}
          >
            <Upload size={16} />
            Upload
          </button>
        </div>
      </div>
      {}
      <div className={`relative border-2 border-dashed rounded-lg overflow-hidden ${
        isDark ? 'border-slate-600' : 'border-slate-300'
      }`} style={{ minHeight: height }}>
        <canvas
          ref={canvasRef}
          className="w-full touch-none cursor-crosshair block"
          style={{ 
            width: '100%', 
            height: height,
            minHeight: height 
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasSignature && (
          <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}>
            <p className="text-sm">
              {mode === 'draw' ? 'Draw your signature here' : 'Upload your signature image'}
            </p>
          </div>
        )}
      </div>
      {}
      <div className="flex items-center justify-between mt-3">
        <button
          type="button"
          onClick={clearSignature}
          className={buttonClass}
        >
          <RotateCcw size={16} />
          Clear
        </button>
        {hasSignature && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Check size={16} />
            <span className="text-sm font-medium">Signature captured</span>
          </div>
        )}
      </div>
      {}
      <input
        ref={fileInputRef}
        type="file"
