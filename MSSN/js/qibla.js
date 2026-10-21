document.addEventListener('DOMContentLoaded', () => {
  const qiblaStatusEl = document.getElementById('qiblaStatus');
  const qiblaNeedle = document.getElementById('qiblaNeedle');
  const qiblaDirectionText = document.getElementById('qiblaDirectionText');
  const manualFallback = document.getElementById('qiblaManualFallback');
  const manualBearing = document.getElementById('manualBearing');
  const findBtn = document.getElementById('findQiblaBtn');

  const KAABA = { lat: 21.422487, lng: 39.826206 };
  let currentBearing = 0;
  let hasCompass = false;

  const setStatus = (message, type = '') => {
    if (!qiblaStatusEl) return;
    qiblaStatusEl.textContent = message;
    qiblaStatusEl.classList.remove('success', 'error', 'visible');
    if (type) qiblaStatusEl.classList.add(type, 'visible');
  };

  const normalizeDegrees = (deg) => {
    let value = deg % 360;
    if (value < 0) value += 360;
    return value;
  };

  const calculateQibla = (lat, lng) => {
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;
    const kaabaLat = (KAABA.lat * Math.PI) / 180;
    const kaabaLng = (KAABA.lng * Math.PI) / 180;

    const y = Math.sin(kaabaLng - lngRad);
    const x = Math.cos(latRad) * Math.tan(kaabaLat) - Math.sin(latRad) * Math.cos(kaabaLng - lngRad);
    const angle = Math.atan2(y, x) * (180 / Math.PI);
    return normalizeDegrees(angle + 180);
  };

  const applyDirection = (bearing) => {
    currentBearing = normalizeDegrees(bearing);
    if (qiblaNeedle) qiblaNeedle.style.transform = `translate(-50%, -100%) rotate(${currentBearing}deg)`;
    if (qiblaDirectionText) qiblaDirectionText.textContent = `Direction: ${Math.round(currentBearing)}°`;
    if (manualBearing) manualBearing.textContent = `${Math.round(currentBearing)}°`;
    if (manualFallback) manualFallback.classList.remove('hidden');
  };

  const handleCompass = (heading) => {
    if (!qiblaNeedle) return;
    const rotation = normalizeDegrees(heading - currentBearing);
    qiblaNeedle.style.transform = `translate(-50%, -100%) rotate(${rotation}deg)`;
  };

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setStatus('Geolocation is not supported on this device. Please use the manual direction shown below.', 'error');
      return;
    }

    setStatus('Requesting your location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const bearing = calculateQibla(position.coords.latitude, position.coords.longitude);
        applyDirection(bearing);
        setStatus('Your Qibla direction has been calculated successfully.', 'success');
      },
      (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? 'Location permission was denied. Please enable location access to calculate the Qibla direction.'
          : 'We could not access your location. Please try again or use the manual fallback.';
        setStatus(message, 'error');
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  if (window.DeviceOrientationEvent) {
    hasCompass = true;
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      setStatus('Compass support available. Tap Find My Qibla to enable orientation access.');
    }
  } else {
    setStatus('This device does not support orientation sensors. The calculated direction will be shown as a manual fallback.', 'error');
  }

  if (findBtn) {
    findBtn.addEventListener('click', async () => {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission !== 'granted') {
            setStatus('Orientation permission was denied. The calculated Qibla direction remains available.', 'error');
            return;
          }
        } catch (error) {
          console.error('Compass permission error', error);
        }
      }

      requestGeolocation();

      if (hasCompass && window.DeviceOrientationEvent) {
        const compassHandler = (event) => {
          const heading = event.alpha || 0;
          handleCompass(heading);
        };
        window.addEventListener('deviceorientation', compassHandler, { once: false });
      }
    });
  }
});
