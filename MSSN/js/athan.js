document.addEventListener('DOMContentLoaded', () => {
  const prayerTable = document.getElementById('prayerTable');
  const nextPrayerNameEl = document.getElementById('nextPrayerName');
  const nextPrayerCountdownEl = document.getElementById('nextPrayerCountdown');
  const currentPrayerNameEl = document.getElementById('currentPrayerName');
  const athanStatus = document.getElementById('athanStatus');
  const locationInfo = document.getElementById('locationInfo');
  const calcMethodSelect = document.getElementById('calculationMethod');
  const notificationsToggle = document.getElementById('notificationsToggle');

  const prayerOrder = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  let prayerTimes = null;
  const userLocation = {
    lat: null,
    lng: null,
    label: 'Location unavailable'
  };

  const setStatus = (message, type = '') => {
    if (!athanStatus) return;
    athanStatus.textContent = message;
    athanStatus.classList.remove('success', 'error', 'visible');
    if (type) athanStatus.classList.add(type, 'visible');
  };

  const formatTime = (timeText) => {
    if (!timeText) return '--:--';
    return timeText.replace(/\s/g, '').slice(0, 5);
  };

  const parseTimeToMinutes = (value) => {
    const [hours, minutes] = String(value || '00:00').split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  };

  const getCurrentPrayer = (times) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const prayerMinutes = prayerOrder.map((label) => ({
      name: label,
      minutes: parseTimeToMinutes(times[label])
    }));

    for (let i = prayerMinutes.length - 1; i >= 0; i -= 1) {
      if (currentMinutes >= prayerMinutes[i].minutes) {
        return prayerMinutes[i].name;
      }
    }
    return 'Fajr';
  };

  const getNextPrayer = (times) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const prayerMinutes = prayerOrder.map((label) => ({
      name: label,
      minutes: parseTimeToMinutes(times[label])
    }));

    const next = prayerMinutes.find((entry) => {
      const target = entry.minutes;
      return target > currentMinutes;
    });

    if (next) return next;
    return { name: 'Fajr', minutes: parseTimeToMinutes(times.Fajr) + 24 * 60 };
  };

  const renderPrayerTimes = (times) => {
    if (!prayerTable) return;
    prayerTable.innerHTML = '';

    prayerOrder.forEach((label) => {
      const row = document.createElement('div');
      row.className = 'prayer-row';
      row.innerHTML = `
        <strong>${label}</strong>
        <span>${formatTime(times[label])}</span>
        <span>${label === getCurrentPrayer(times) ? 'Now' : ''}</span>
      `;
      prayerTable.appendChild(row);
    });
  };

  const updateCountdown = (times) => {
    if (!nextPrayerNameEl || !nextPrayerCountdownEl) return;

    const nextPrayer = getNextPrayer(times);
    const now = new Date();
    const target = new Date();
    const nextMinutes = nextPrayer.minutes;
    target.setHours(Math.floor(nextMinutes / 60) % 24, nextMinutes % 60, 0, 0);

    if (target.getTime() < now.getTime()) {
      target.setDate(target.getDate() + 1);
    }

    const diffMs = target.getTime() - now.getTime();
    const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));
    const hours = Math.floor(diffSeconds / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    const seconds = diffSeconds % 60;

    nextPrayerNameEl.textContent = nextPrayer.name;
    nextPrayerCountdownEl.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} remaining`;

    const currentPrayer = getCurrentPrayer(times);
    if (currentPrayerNameEl) {
      currentPrayerNameEl.textContent = currentPrayer;
    }

    setTimeout(() => updateCountdown(times), 1000);
  };

  const fetchPrayerTimes = async () => {
    if (!userLocation.lat || !userLocation.lng) {
      setStatus('Location access is required to fetch prayer times.', 'error');
      return;
    }

    setStatus('Loading prayer times...');

    try {
      const method = calcMethodSelect?.value || 'MuslimWorldLeague';
      const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${userLocation.lat}&longitude=${userLocation.lng}&method=${method}`);
      if (!response.ok) throw new Error('Prayer API failed');

      const data = await response.json();
      prayerTimes = data.data?.timings || null;

      if (!prayerTimes) {
        throw new Error('No prayer data found');
      }

      renderPrayerTimes(prayerTimes);
      updateCountdown(prayerTimes);
      if (locationInfo) locationInfo.textContent = `Location: ${userLocation.label}`;
      setStatus('Prayer times updated successfully.', 'success');
    } catch (error) {
      console.error('Prayer times failed', error);
      setStatus('Unable to load prayer times right now. Please check your internet connection and try again.', 'error');
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setStatus('Geolocation is not supported on this device.', 'error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation.lat = position.coords.latitude;
        userLocation.lng = position.coords.longitude;
        userLocation.label = `${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)}`;
        fetchPrayerTimes();
      },
      (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? 'Location permission was denied. Please allow location access to show prayer times.'
          : 'Location was unavailable. Please enable location access.';
        setStatus(message, 'error');
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  if (calcMethodSelect) {
    calcMethodSelect.addEventListener('change', () => {
      if (prayerTimes) {
        fetchPrayerTimes();
      }
    });
  }

  if (notificationsToggle) {
    notificationsToggle.addEventListener('change', () => {
      const enabled = notificationsToggle.checked;
      localStorage.setItem('athan-notifications', String(enabled));
      if (enabled && 'Notification' in window) {
        Notification.requestPermission().then((permission) => {
          setStatus(permission === 'granted' ? 'Prayer notifications enabled.' : 'Notifications not granted. Prayer reminders will remain disabled.', permission === 'granted' ? 'success' : 'error');
        });
      } else {
        setStatus(enabled ? 'Notifications are enabled in settings.' : 'Notifications are disabled.', enabled ? 'success' : '');
      }
    });
  }

  const savedNotificationState = localStorage.getItem('athan-notifications') === 'true';
  if (notificationsToggle) notificationsToggle.checked = savedNotificationState;

  getUserLocation();
});
