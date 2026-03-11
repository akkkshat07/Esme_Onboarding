import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FileSignature, CheckCircle2, XCircle, Loader2, PenTool, Eraser, MapPin } from 'lucide-react';

const SignatureCapture = ({ userEmail, userName, onVerificationComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState(null);
  const [signatureLocation, setSignatureLocation] = useState('');
  const [signatureData, setSignatureData] = useState(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const canvasRef = useRef(null);
  const [canvasContext, setCanvasContext] = useState(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      setCanvasContext(ctx);
    }
    checkSignatureStatus();
    fetchCurrentLocation();
  }, []);

  const checkSignatureStatus = async () => {
    try {
      const response = await axios.get(`/api/signature/status/${userEmail}`);
      if (response.data.success && response.data.data) {
        setSignatureData(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch signature status:', err);
    }
  };

  const fetchCurrentLocation = async () => {
    setFetchingLocation(true);
    
    if (!navigator.geolocation) {
      setSignatureLocation('Location not available');
      setFetchingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
          );
          
          const data = await response.json();
          
          if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.village || data.address.county || '';
            const state = data.address.state || '';
            const country = data.address.country || '';
            
            let locationString = '';
            if (city && state) {
              locationString = `${city}, ${state}`;
            } else if (city) {
              locationString = city;
            } else if (state) {
              locationString = state;
            } else {
              locationString = country || 'Location detected';
            }
            
            setSignatureLocation(locationString);
          } else {
            setSignatureLocation('Location detected');
          }
        } catch (err) {
          console.error('Geocoding error:', err);
          setSignatureLocation('Location detected');
        } finally {
          setFetchingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setSignatureLocation('Location access denied');
        setFetchingLocation(false);
      }
    );
  };

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    if (!canvasContext) return;
    setIsDrawing(true);
    const coords = getCanvasCoordinates(e);
    canvasContext.beginPath();
    canvasContext.moveTo(coords.x, coords.y);
  };

  const draw = (e) => {
    if (!isDrawing || !canvasContext) return;
    const coords = getCanvasCoordinates(e);
    canvasContext.lineTo(coords.x, coords.y);
    canvasContext.stroke();
  };

  const stopDrawing = () => {
    if (!canvasContext) return;
    setIsDrawing(false);
    canvasContext.closePath();
    const signatureImage = canvasRef.current.toDataURL('image/png');
    setSignature(signatureImage);
  };

  const clearSignature = () => {
    if (!canvasContext || !canvasRef.current) return;
    canvasContext.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setSignature(null);
  };

  const handleSaveSignature = async () => {
    if (!signature) {
      setError('Please draw your signature first');
      return;
    }

    if (!signatureLocation || signatureLocation.trim() === '') {
      setError('Please enter the location where you are signing');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const signedDate = new Date().toISOString();

      const response = await axios.post('/api/signature/save', {
        email: userEmail,
        name: userName,
        signatureImage: signature,
        location: signatureLocation.trim(),
        signedDate: signedDate
      });

      if (response.data.success) { 
        setSuccess('Signature saved successfully!');
        setSignatureData(response.data.data);
        
        if (onVerificationComplete) {
          onVerificationComplete({
            signature: signature,
            location: signatureLocation,
            date: signedDate
          });
        }

        clearSignature();
        setSignatureLocation('');
      } else {
        setError(response.data.message || 'Failed to save signature');
      }
    } catch (err) {
      console.error('Signature save error:', err);
      setError(err.response?.data?.message || 'Failed to save signature. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = () => {
    if (signatureData) {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm">
          <CheckCircle2 size={16} />
          <span>Signature Saved</span>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm">
        <PenTool size={16} />
        <span>Not Signed</span>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileSignature className="text-purple-500" size={24} />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Digital Signature</h2>
        </div>
        {renderStatusBadge()}
      </div>

      {signatureData ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-green-700 dark:text-green-300 font-medium mb-2">
                ✅ Signature Captured Successfully
              </p>
              <div className="text-green-600 dark:text-green-400 text-sm space-y-1">
                <p><strong>Signed At:</strong> {new Date(signatureData.signedDate).toLocaleString()}</p>
                <p><strong>Location:</strong> {signatureData.location}</p>
              </div>
              {signatureData.signatureImage && (
                <div className="mt-3 p-2 bg-white rounded border border-green-200">
                  <img src={signatureData.signatureImage} alt="Signature" className="h-20" />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <FileSignature className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-blue-700 dark:text-blue-300 text-sm">
                <p className="font-medium mb-2">📝 How it works:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Draw your signature using mouse/trackpad on the canvas below</li>
                  <li>Enter your current location (city/state)</li>
                  <li>Click "Save Signature" to store it</li>
                  <li>Your signature will be automatically applied to all required documents with date and location</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Draw Your Signature
            </label>
            <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="border border-gray-300 dark:border-gray-500 rounded cursor-crosshair bg-white max-w-full"
                style={{ touchAction: 'none' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={clearSignature}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                >
                  <Eraser size={16} />
                  Clear
                </button>
                {signature && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                    <CheckCircle2 size={16} />
                    <span>Signature captured</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>Location (Auto-detected)</span>
              </div>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={signatureLocation}
                onChange={(e) => setSignatureLocation(e.target.value)}
                placeholder={fetchingLocation ? "Detecting location..." : "e.g., Mumbai, Maharashtra"}
                disabled={fetchingLocation}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              />
              <button
                onClick={fetchCurrentLocation}
                disabled={fetchingLocation}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                title="Refresh location"
              >
                {fetchingLocation ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <MapPin size={16} />
                )}
              </button>
            </div>
            {fetchingLocation && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                📍 Detecting your current location...
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <XCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-green-700 dark:text-green-300">{success}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleSaveSignature}
            disabled={loading || !signature || !signatureLocation}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              loading || !signature || !signatureLocation
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <PenTool size={20} />
                <span>Save Signature</span>
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default SignatureCapture;
