import React, { useRef, useState, useEffect } from 'react';

const WebcamCapture = ({ onPhotoCapture, onClose, isOpen }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  useEffect(() => {
    if (isOpen) {
      console.log('Webcam modal açıldı, kamera başlatılıyor...');
      startCamera();
    } else {
      console.log('Webcam modal kapatıldı, kamera durduruluyor...');
      stopCamera();
    }

    return () => {
      console.log('Webcam component unmount, kamera durduruluyor...');
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      console.log('Kamera başlatılıyor...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      console.log('Kamera erişimi sağlandı');
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Video yüklendiğinde kamera aktif olarak işaretle
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata yüklendi');
          setIsCameraActive(true);
        };
        
        videoRef.current.onerror = (error) => {
          console.error('Video yüklenirken hata:', error);
          setIsCameraActive(false);
        };
      }
    } catch (error) {
      console.error('Kamera erişimi hatası:', error);
      
      let errorMessage = 'Kameraya erişim sağlanamadı.';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Kamera izni reddedildi. Lütfen tarayıcı ayarlarından kamera iznini verin.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Kamera bulunamadı. Lütfen kamera bağlantısını kontrol edin.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Kamera başka uygulama tarafından kullanılıyor. Lütfen diğer uygulamaları kapatın.';
      }
      
      alert(errorMessage);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    console.log('Kamera durduruluyor...');
    if (stream) {
      try {
        stream.getTracks().forEach(track => {
          console.log('Track durduruluyor:', track.kind);
          track.stop();
        });
        setStream(null);
        setIsCameraActive(false);
        console.log('Kamera başarıyla durduruldu');
      } catch (error) {
        console.error('Kamera durdurulurken hata:', error);
      }
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Video yüklenene kadar bekle
    if (video.readyState < 2) {
      console.log('Video henüz yüklenmedi, bekleniyor...');
      setTimeout(capturePhoto, 100);
      return;
    }

    // Canvas boyutlarını video boyutlarına ayarla
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    try {
      // Video frame'ini canvas'a çiz
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Canvas'tan base64 formatında fotoğraf al
      const photoData = canvas.toDataURL('image/jpeg', 0.8);
      console.log('Fotoğraf çekildi:', photoData.substring(0, 50) + '...');
      setCapturedPhoto(photoData);
    } catch (error) {
      console.error('Fotoğraf çekilirken hata:', error);
      alert('Fotoğraf çekilirken hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const retakePhoto = () => {
    console.log('Fotoğraf yeniden çekiliyor...');
    setCapturedPhoto(null);
  };

  const savePhoto = () => {
    if (capturedPhoto && onPhotoCapture) {
      console.log('Fotoğraf kaydediliyor...');
      try {
        onPhotoCapture(capturedPhoto);
        onClose();
        console.log('Fotoğraf başarıyla kaydedildi');
      } catch (error) {
        console.error('Fotoğraf kaydedilirken hata:', error);
        alert('Fotoğraf kaydedilirken hata oluştu. Lütfen tekrar deneyin.');
      }
    } else {
      console.error('Fotoğraf veya callback bulunamadı');
      alert('Fotoğraf kaydedilemedi. Lütfen tekrar deneyin.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Fotoğraf Çek</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {!capturedPhoto ? (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 bg-gray-200 rounded-lg"
              />
              {!isCameraActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-gray-600">Kamera başlatılıyor...</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Debug bilgileri */}
            <div className="text-xs text-gray-500 space-y-1">
              <div>Kamera Durumu: {isCameraActive ? 'Aktif' : 'Pasif'}</div>
              <div>Stream: {stream ? 'Var' : 'Yok'}</div>
              <div>Video Ref: {videoRef.current ? 'Var' : 'Yok'}</div>
              <div>Canvas Ref: {canvasRef.current ? 'Var' : 'Yok'}</div>
            </div>
            
            {/* Gizli canvas elementi - fotoğraf çekmek için */}
            <canvas
              ref={canvasRef}
              style={{ display: 'none' }}
            />
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={capturePhoto}
                disabled={!isCameraActive}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Fotoğraf Çek
              </button>
              
              {/* Test butonu */}
              <button
                onClick={() => {
                  console.log('Test butonu tıklandı');
                  console.log('Video ref:', videoRef.current);
                  console.log('Canvas ref:', canvasRef.current);
                  console.log('Stream:', stream);
                  console.log('Kamera aktif:', isCameraActive);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
              >
                Debug
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={capturedPhoto}
                alt="Çekilen fotoğraf"
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={retakePhoto}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Yeniden Çek
              </button>
              <button
                onClick={savePhoto}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Fotoğrafı Kaydet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture; 