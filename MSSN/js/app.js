const THEME_KEY = 'islamic-platform-theme';

const SAMPLE_PRAYER_TIMES = {
  Fajr: '05:15',
  Sunrise: '06:39',
  Dhuhr: '12:49',
  Asr: '15:56',
  Maghrib: '18:41',
  Isha: '20:04'
};

const PRAYER_SEQUENCE = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

function parsePrayerMinutes(timeText) {
  if (!timeText) return 0;
  const [hours, minutes] = String(timeText).split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

function getNextPrayerInfo(times = SAMPLE_PRAYER_TIMES) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const prayerEntries = PRAYER_SEQUENCE.map((name) => ({
    name,
    minutes: parsePrayerMinutes(times[name])
  }));

  const upcoming = prayerEntries.find((entry) => entry.minutes > currentMinutes) || {
    name: 'Fajr',
    minutes: parsePrayerMinutes(times.Fajr) + 24 * 60
  };

  const target = new Date();
  const nextMinutes = upcoming.minutes;
  target.setHours(Math.floor(nextMinutes / 60) % 24, nextMinutes % 60, 0, 0);

  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  const diffMs = target.getTime() - now.getTime();
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    name: upcoming.name,
    countdown: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  };
}

function updatePrayerTracker() {
  const homeNextPrayer = document.getElementById('heroNextPrayer');
  const homeNextCountdown = document.getElementById('heroNextCountdown');
  const dashboardNextPrayer = document.getElementById('nextPrayerName');
  const dashboardNextCountdown = document.getElementById('nextPrayerCountdown');

  const nextPrayer = getNextPrayerInfo();

  if (homeNextPrayer) homeNextPrayer.textContent = nextPrayer.name;
  if (homeNextCountdown) homeNextCountdown.textContent = nextPrayer.countdown;
  if (dashboardNextPrayer) dashboardNextPrayer.textContent = nextPrayer.name;
  if (dashboardNextCountdown) dashboardNextCountdown.textContent = `${nextPrayer.countdown} remaining`;
}

function applyTheme(theme) {
  const prefersDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const nextTheme = prefersDark ? 'dark' : 'light';
  document.body.classList.toggle('dark-mode', nextTheme === 'dark');
  localStorage.setItem(THEME_KEY, nextTheme);
}

function initThemeToggle() {
  const toggles = document.querySelectorAll('.theme-toggle');
  if (!toggles.length) return;

  const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(savedTheme);

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const nextTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
      applyTheme(nextTheme);
    });
  });
}

function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.mobile-nav');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.classList.remove('open');
    });
  });
}

function updateYear() {
  document.querySelectorAll('#yearValue').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

function populateHomePrayerSummary() {
  const homeFajr = document.getElementById('homeFajr');
  const homeDhuhr = document.getElementById('homeDhuhr');
  const homeAsr = document.getElementById('homeAsr');
  const homeMaghrib = document.getElementById('homeMaghrib');
  const homeIsha = document.getElementById('homeIsha');
  const heroNextPrayer = document.getElementById('heroNextPrayer');
  const heroNextCountdown = document.getElementById('heroNextCountdown');
  const homeDateChip = document.getElementById('homeDateChip');

  if (!homeFajr && !homeDhuhr && !homeAsr && !homeMaghrib && !homeIsha && !heroNextPrayer && !heroNextCountdown) {
    return;
  }

  const today = new Date();
  if (homeDateChip) {
    homeDateChip.textContent = today.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  if (homeFajr) homeFajr.textContent = SAMPLE_PRAYER_TIMES.Fajr;
  if (homeDhuhr) homeDhuhr.textContent = SAMPLE_PRAYER_TIMES.Dhuhr;
  if (homeAsr) homeAsr.textContent = SAMPLE_PRAYER_TIMES.Asr;
  if (homeMaghrib) homeMaghrib.textContent = SAMPLE_PRAYER_TIMES.Maghrib;
  if (homeIsha) homeIsha.textContent = SAMPLE_PRAYER_TIMES.Isha;

  updatePrayerTracker();
}

function refreshDashboardData() {
  const nextPrayerName = document.getElementById('nextPrayerName');
  const nextPrayerCountdown = document.getElementById('nextPrayerCountdown');
  const quranProgressText = document.getElementById('quranProgressText');
  const quranProgressBar = document.getElementById('quranProgressBar');
  const bookmarkCount = document.getElementById('bookmarkCount');
  const azkarProgressText = document.getElementById('azkarProgressText');
  const azkarProgressBar = document.getElementById('azkarProgressBar');
  const dashboardGregorian = document.getElementById('dashboardGregorian');
  const dashboardHijri = document.getElementById('dashboardHijri');

  const nextPrayer = getNextPrayerInfo();
  if (nextPrayerName) nextPrayerName.textContent = nextPrayer.name;
  if (nextPrayerCountdown) nextPrayerCountdown.textContent = `${nextPrayer.countdown} remaining`;
  if (quranProgressText) quranProgressText.textContent = '32%';
  if (quranProgressBar) quranProgressBar.style.width = '32%';
  if (bookmarkCount) bookmarkCount.textContent = String(JSON.parse(localStorage.getItem('quran-bookmarks') || '[]').length || 0);
  if (azkarProgressText) azkarProgressText.textContent = '40%';
  if (azkarProgressBar) azkarProgressBar.style.width = '40%';
  if (dashboardGregorian) dashboardGregorian.textContent = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  if (dashboardHijri) dashboardHijri.textContent = new Intl.DateTimeFormat('en-u-ca-islamic', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());
}

window.refreshDashboardData = refreshDashboardData;

document.addEventListener('DOMContentLoaded', () => {
  updateYear();
  initThemeToggle();
  initMobileNav();
  populateHomePrayerSummary();
  refreshDashboardData();
  setInterval(() => {
    updatePrayerTracker();
    refreshDashboardData();
  }, 1000);
});
