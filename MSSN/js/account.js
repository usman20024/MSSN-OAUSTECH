document.addEventListener('DOMContentLoaded', () => {
  const bookmarkList = document.getElementById('accountBookmarks');
  const readingProgress = document.getElementById('accountReadingProgress');
  const azkarProgress = document.getElementById('accountAzkarProgress');
  const prayerSettings = document.getElementById('accountPrayerSettings');
  const editProfileBtn = document.getElementById('editProfileBtn');
  const profileEditor = document.getElementById('profileEditor');
  const profileForm = document.getElementById('profileForm');
  const profileFormMessage = document.getElementById('profileFormMessage');
  const editProfileName = document.getElementById('editProfileName');
  const editProfileEmail = document.getElementById('editProfileEmail');
  const cancelProfileEdit = document.getElementById('cancelProfileEdit');

  const renderList = (container, items) => {
    if (!container) return;
    if (!items.length) {
      container.textContent = 'No items yet.';
      return;
    }
    container.innerHTML = items.map((item) => `<div class="list-item">${item}</div>`).join('');
  };

  const setProfileMessage = (message, type = '') => {
    if (!profileFormMessage) return;
    profileFormMessage.textContent = message;
    profileFormMessage.classList.remove('success', 'error', 'visible');
    if (type) profileFormMessage.classList.add(type, 'visible');
  };

  const showProfileEditor = (show = true) => {
    if (!profileEditor) return;
    profileEditor.classList.toggle('hidden', !show);
    if (show) {
      const user = firebase.auth().currentUser;
      if (user) {
        if (editProfileName) editProfileName.value = user.displayName || '';
        if (editProfileEmail) editProfileEmail.value = user.email || '';
      }
    }
  };

  const updateAccountPage = () => {
    const bookmarks = JSON.parse(localStorage.getItem('quran-bookmarks') || '[]');
    renderList(bookmarkList, bookmarks.length ? bookmarks.map((entry) => `Bookmark: ${entry}`) : []);

    const lastSurah = localStorage.getItem('last-quran-surah') || '1';
    const quranProgress = JSON.parse(localStorage.getItem('quran-progress') || '{}');
    const quranProgressText = quranProgress[lastSurah] ? `${quranProgress[lastSurah]}%` : 'Not started';
    if (readingProgress) {
      readingProgress.innerHTML = `
        <div class="list-item">Last surah: ${lastSurah}</div>
        <div class="list-item">Progress: ${quranProgressText}</div>
      `;
    }

    const azkarKeys = Object.keys(localStorage)
      .filter((key) => key.startsWith('azkar-count-'))
      .map((key) => localStorage.getItem(key));
    if (azkarProgress) {
      const total = azkarKeys.reduce((sum, value) => sum + Number(value || 0), 0);
      azkarProgress.innerHTML = `<div class="list-item">Azkar total count: ${total}</div>`;
    }

    const prayerMode = localStorage.getItem('athan-notifications') === 'true' ? 'Notifications enabled' : 'Notifications disabled';
    if (prayerSettings) {
      prayerSettings.innerHTML = `
        <div class="list-item">Prayer notifications: ${prayerMode}</div>
        <div class="list-item">Theme preference: ${localStorage.getItem('islamic-platform-theme') === 'dark' ? 'Dark' : 'Light'}</div>
      `;
    }

    const user = firebase.auth().currentUser;
    if (user) {
      const name = user.displayName || 'Muslim User';
      if (editProfileName) editProfileName.value = name;
      if (editProfileEmail) editProfileEmail.value = user.email || '';
    }
  };

  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
      showProfileEditor(true);
    });
  }

  if (cancelProfileEdit) {
    cancelProfileEdit.addEventListener('click', () => {
      setProfileMessage('', '');
      showProfileEditor(false);
    });
  }

  if (profileForm) {
    profileForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const currentUser = firebase.auth().currentUser;
      if (!currentUser) {
        setProfileMessage('Please log in to edit your profile.', 'error');
        return;
      }

      const fullName = String(editProfileName?.value || '').trim();
      const email = String(editProfileEmail?.value || '').trim();

      if (!fullName || fullName.length < 2) {
        setProfileMessage('Please enter your full name.', 'error');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setProfileMessage('Please enter a valid email address.', 'error');
        return;
      }

      const saveButton = document.getElementById('saveProfileBtn');
      if (saveButton) saveButton.disabled = true;

      try {
        if (currentUser.displayName !== fullName) {
          await currentUser.updateProfile({ displayName: fullName });
        }

        if (currentUser.email !== email) {
          await currentUser.updateEmail(email);
        }

        setProfileMessage('Profile updated successfully.', 'success');
        updateAccountPage();
        setTimeout(() => showProfileEditor(false), 700);
      } catch (error) {
        let message = 'Profile update failed. Please try again.';
        if (error?.code === 'auth/requires-recent-login') {
          message = 'Please log out and log back in before changing your email.';
        }
        if (error?.code === 'auth/email-already-in-use') {
          message = 'This email is already in use by another account.';
        }
        setProfileMessage(message, 'error');
      } finally {
        if (saveButton) saveButton.disabled = false;
      }
    });
  }

  window.initAccountPage = updateAccountPage;
  updateAccountPage();
});
