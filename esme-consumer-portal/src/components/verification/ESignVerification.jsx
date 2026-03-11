import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  PenLine, CheckCircle2, Upload, Crop, ZoomIn, ZoomOut,
  RotateCcw, Trash2, Save, AlertCircle, Loader2, MoveHorizontal
} from 'lucide-react';

const API_URL = '/api';

const SIGNATURE_RULES = [
  'Signature must be on a white/light background',
  'Use dark ink (black or blue) only',
  'Keep the signature within the crop frame',
  'Avoid including extra text or stamps',
  'Minimum visible area: 30% of the cropped region',
];

const ESignVerification = ({ userEmail, userName, onVerificationComplete }) => {
  const [step, setStep] = useState('upload'); // 'upload' | 'crop' | 'preview' | 'done'
  const [uploadedImage, setUploadedImage] = useState(null);
  const [croppedSignature, setCroppedSignature] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedData, setSavedData] = useState(null);

  const [cropBox, setCropBox] = useState({ x: 50, y: 50, w: 300, h: 120 });
  const [dragging, setDragging] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 0, h: 0 });
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(120);

  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axios.get(`${API_URL}/signature/status/${userEmail}`);
        if (res.data.success && res.data.isSaved) {
          setSavedData(res.data.data);
          setCroppedSignature(res.data.data.signatureImage);
          setStep('done');
        }
      } catch { /* no saved signature */ }
    };
    if (userEmail) checkStatus();
  }, [userEmail]);

  const drawCropOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !uploadedImage) return;
    const ctx = canvas.getContext('2d');
    const cw = canvas.width;
    const ch = canvas.height;
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.drawImage(img, 0, 0, cw, ch);
    ctx.filter = 'none';
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, cw, ch);
    ctx.clearRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.drawImage(
      img,
      (cropBox.x / cw) * img.naturalWidth,
      (cropBox.y / ch) * img.naturalHeight,
      (cropBox.w / cw) * img.naturalWidth,
      (cropBox.h / ch) * img.naturalHeight,
      cropBox.x, cropBox.y, cropBox.w, cropBox.h
    );
    ctx.filter = 'none';
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.strokeRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);
    ctx.setLineDash([]);
    const hs = 10;
    const corners = [
      { x: cropBox.x, y: cropBox.y },
      { x: cropBox.x + cropBox.w - hs, y: cropBox.y },
      { x: cropBox.x, y: cropBox.y + cropBox.h - hs },
      { x: cropBox.x + cropBox.w - hs, y: cropBox.y + cropBox.h - hs },
    ];
    ctx.fillStyle = '#14b8a6';
    corners.forEach(c => ctx.fillRect(c.x, c.y, hs, hs));
  }, [uploadedImage, cropBox, brightness, contrast]);

  useEffect(() => {
    if (step === 'crop') drawCropOverlay();
  }, [step, drawCropOverlay]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please upload an image file (JPG, PNG, etc.)'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('File size must be less than 5MB'); return; }
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setUploadedImage(dataUrl);
      const img = new Image();
      img.onload = () => {
        setImgNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
        const dispW = Math.min(600, img.naturalWidth);
        const dispH = Math.round((dispW / img.naturalWidth) * img.naturalHeight);
        const pad = 0.15;
        setCropBox({
          x: Math.round(dispW * pad),
          y: Math.round(dispH * pad),
          w: Math.round(dispW * (1 - 2 * pad)),
          h: Math.round(dispH * (1 - 2 * pad)),
        });
      };
      img.src = dataUrl;
      setStep('crop');
    };
    reader.readAsDataURL(file);
  };

  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const getHitZone = (pos) => {
    const hs = 14;
    const { x, y, w, h } = cropBox;
    if (Math.abs(pos.x - x) < hs && Math.abs(pos.y - y) < hs) return 'tl';
    if (Math.abs(pos.x - (x + w)) < hs && Math.abs(pos.y - y) < hs) return 'tr';
    if (Math.abs(pos.x - x) < hs && Math.abs(pos.y - (y + h)) < hs) return 'bl';
    if (Math.abs(pos.x - (x + w)) < hs && Math.abs(pos.y - (y + h)) < hs) return 'br';
    if (pos.x > x && pos.x < x + w && pos.y > y && pos.y < y + h) return 'move';
    return null;
  };

  const onMouseDown = (e) => {
    const pos = getCanvasPos(e);
    const zone = getHitZone(pos);
    if (!zone) return;
    setDragging(zone);
    setDragStart({ pos, box: { ...cropBox } });
  };

  const onMouseMove = (e) => {
    if (!dragging || !dragStart) return;
    const canvas = canvasRef.current;
    const cw = canvas.width; const ch = canvas.height;
    const pos = getCanvasPos(e);
    const dx = pos.x - dragStart.pos.x; const dy = pos.y - dragStart.pos.y;
    const { box } = dragStart; const minSize = 60;
    let nb = { ...box };
    if (dragging === 'move') {
      nb.x = Math.max(0, Math.min(cw - box.w, box.x + dx));
      nb.y = Math.max(0, Math.min(ch - box.h, box.y + dy));
    } else if (dragging === 'tl') {
      nb.x = Math.max(0, Math.min(box.x + box.w - minSize, box.x + dx));
      nb.y = Math.max(0, Math.min(box.y + box.h - minSize, box.y + dy));
      nb.w = box.w - (nb.x - box.x); nb.h = box.h - (nb.y - box.y);
    } else if (dragging === 'tr') {
      nb.w = Math.max(minSize, Math.min(cw - box.x, box.w + dx));
      nb.y = Math.max(0, Math.min(box.y + box.h - minSize, box.y + dy));
      nb.h = box.h - (nb.y - box.y);
    } else if (dragging === 'bl') {
      nb.x = Math.max(0, Math.min(box.x + box.w - minSize, box.x + dx));
      nb.w = box.w - (nb.x - box.x);
      nb.h = Math.max(minSize, Math.min(ch - box.y, box.h + dy));
    } else if (dragging === 'br') {
      nb.w = Math.max(minSize, Math.min(cw - box.x, box.w + dx));
      nb.h = Math.max(minSize, Math.min(ch - box.y, box.h + dy));
    }
    setCropBox(nb);
  };

  const onMouseUp = () => { setDragging(null); setDragStart(null); };

  const performCrop = () => {
    const img = imgRef.current; const canvas = canvasRef.current;
    if (!img || !canvas) return;
    const cw = canvas.width; const ch = canvas.height;
    const scaleX = img.naturalWidth / cw; const scaleY = img.naturalHeight / ch;
    const out = document.createElement('canvas');
    out.width = Math.round(cropBox.w * scaleX);
    out.height = Math.round(cropBox.h * scaleY);
    const ctx = out.getContext('2d');
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.drawImage(img, Math.round(cropBox.x * scaleX), Math.round(cropBox.y * scaleY), out.width, out.height, 0, 0, out.width, out.height);
    ctx.filter = 'none';
    setCroppedSignature(out.toDataURL('image/png'));
    setStep('preview');
  };

  const handleSave = async () => {
    if (!croppedSignature) return;
    setSaving(true); setError('');
    try {
      const res = await axios.post(`${API_URL}/signature/save`, {
        email: userEmail,
        name: userName || userEmail,
        signatureImage: croppedSignature,
        location: 'Online',
        signedDate: new Date().toISOString(),
      });
      if (res.data.success) {
        setSavedData(res.data.data);
        setStep('done');
        if (onVerificationComplete) onVerificationComplete({ signature: croppedSignature });
      } else {
        setError(res.data.message || 'Failed to save signature');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save signature');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setUploadedImage(null); setCroppedSignature(null); setSavedData(null);
    setError(''); setStep('upload'); setBrightness(100); setContrast(120);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getCanvasSize = () => {
    if (!imgNaturalSize.w) return { w: 600, h: 300 };
    const dispW = Math.min(600, imgNaturalSize.w);
    const dispH = Math.round((dispW / imgNaturalSize.w) * imgNaturalSize.h);
    return { w: dispW, h: dispH };
  };
  const canvasSize = getCanvasSize();

  if (step === 'done' && croppedSignature) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-semibold text-green-800">Signature Saved Successfully</span>
          </div>
          <div className="bg-white border border-green-200 rounded p-3 flex justify-center">
            <img src={croppedSignature} alt="Saved signature" className="max-h-24 object-contain" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))' }} />
          </div>
          {savedData?.savedAt && (
            <p className="text-xs text-green-600 mt-2">Saved at: {new Date(savedData.savedAt).toLocaleString()}</p>
          )}
          <p className="text-xs text-green-600 mt-1">This signature is auto-populated in all your forms.</p>
        </div>
        <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-600">
          <RotateCcw className="w-3.5 h-3.5" /> Upload New Signature
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <PenLine className="w-5 h-5 text-teal-600" />
        <h3 className="text-sm font-semibold text-gray-800">Upload & Crop Signature</h3>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-xs font-semibold text-amber-800 mb-1.5 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> Signature Guidelines
        </p>
        <ul className="space-y-0.5">
          {SIGNATURE_RULES.map((rule, i) => (
            <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
              <span className="mt-0.5 w-1 h-1 rounded-full bg-amber-500 flex-shrink-0" />{rule}
            </li>
          ))}
        </ul>
      </div>

      {step === 'upload' && (
        <div>
          <label htmlFor="sig-upload" className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-teal-300 rounded-lg p-8 cursor-pointer hover:bg-teal-50 transition-colors">
            <Upload className="w-8 h-8 text-teal-500" />
            <span className="text-sm font-medium text-teal-700">Click to upload signature image</span>
            <span className="text-xs text-gray-500">JPG, PNG — max 5 MB</span>
            <input id="sig-upload" ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>
      )}

      {step === 'crop' && uploadedImage && (
        <div className="space-y-3">
          <p className="text-xs text-gray-600 flex items-center gap-1">
            <MoveHorizontal className="w-3.5 h-3.5 text-teal-600" />
            Drag the <strong className="mx-0.5">teal corner handles</strong> to resize, or drag inside the box to move it.
          </p>
          <img ref={imgRef} src={uploadedImage} alt="source" className="hidden" onLoad={drawCropOverlay} />
          <div className="overflow-auto rounded-lg border border-gray-200 bg-gray-100">
            <canvas
              ref={canvasRef}
              width={canvasSize.w}
              height={canvasSize.h}
              className="block cursor-crosshair select-none"
              style={{ maxWidth: '100%', touchAction: 'none' }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                <ZoomIn className="w-3.5 h-3.5" /> Brightness: {brightness}%
              </label>
              <input type="range" min="50" max="150" value={brightness} onChange={e => setBrightness(Number(e.target.value))} className="w-full accent-teal-600" />
            </div>
            <div>
              <label className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                <ZoomOut className="w-3.5 h-3.5" /> Contrast: {contrast}%
              </label>
              <input type="range" min="50" max="200" value={contrast} onChange={e => setContrast(Number(e.target.value))} className="w-full accent-teal-600" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={performCrop} className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-xs rounded hover:bg-teal-700">
              <Crop className="w-3.5 h-3.5" /> Crop & Preview
            </button>
            <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-600 text-xs rounded hover:bg-gray-50">
              <Trash2 className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}

      {step === 'preview' && croppedSignature && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-gray-700">Preview — this is how your signature will appear in all forms:</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4 relative">
            <div className="flex justify-center">
              <img src={croppedSignature} alt="Cropped signature" className="max-h-28 object-contain" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }} />
            </div>
            <div className="mt-2 border-t border-gray-400 border-dashed mx-6" />
            <p className="text-center text-xs text-gray-400 mt-1">Signature</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
            <p className="text-xs font-medium text-gray-700 mb-1">Before saving, confirm:</p>
            {['Signature is clearly visible', 'No extra background clutter', 'Signature matches your official records'].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />{item}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-xs rounded hover:bg-teal-700 disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving...' : 'Save Signature'}
            </button>
            <button onClick={() => setStep('crop')} className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-600 text-xs rounded hover:bg-gray-50">
              <Crop className="w-3.5 h-3.5" /> Re-crop
            </button>
            <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 text-xs rounded hover:bg-red-50">
              <Trash2 className="w-3.5 h-3.5" /> Discard
            </button>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default ESignVerification;
