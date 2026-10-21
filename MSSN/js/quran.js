document.addEventListener('DOMContentLoaded', () => {
  const surahSearchInput = document.getElementById('surahSearch');
  const verseSearchInput = document.getElementById('verseSearch');
  const surahListEl = document.getElementById('surahList');
  const surahReaderEl = document.getElementById('surahReader');
  const surahStatusEl = document.getElementById('surahStatus');
  const fontBtnEls = document.querySelectorAll('[data-size]');

  let quranData = [];
  let allSurahs = [];
  let currentSurahNumber = 1;
  let currentFontSize = 18;

  const showStatus = (message, type = '') => {
    if (!surahStatusEl) return;
    surahStatusEl.textContent = message;
    surahStatusEl.classList.remove('success', 'error', 'visible');
    if (type) surahStatusEl.classList.add(type, 'visible');
  };

  const fetchQuran = async () => {
    try {
      showStatus('Loading Quran data...');
      const response = await fetch('https://api.alquran.cloud/v1/surah');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      quranData = Array.isArray(data.data) ? data.data : [];
      allSurahs = quranData;
      renderSurahList();
      if (quranData.length) {
        renderSurah(quranData[0].number);
      } else {
        showStatus('No Quran data available. Please check your internet connection and try again.', 'error');
      }
    } catch (error) {
      console.error('Quran fetch failed', error);
      showStatus('Unable to load the Quran right now. Please check your internet connection and retry.', 'error');
    }
  };

  const renderSurahList = () => {
    const query = (surahSearchInput?.value || '').trim().toLowerCase();
    const filtered = allSurahs.filter((surah) => {
      const matchName = `${surah.englishName} ${surah.name} ${surah.englishNameTranslation}`.toLowerCase();
      return matchName.includes(query);
    });

    if (!surahListEl) return;
    surahListEl.innerHTML = '';

    if (!filtered.length) {
      surahListEl.innerHTML = '<p class="status-box visible">No surah found.</p>';
      return;
    }

    filtered.forEach((surah) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `surah-item ${surah.number === currentSurahNumber ? 'active' : ''}`;
      button.innerHTML = `
        <span>
          <strong>${surah.number}. ${surah.englishName}</strong><br>
          <small>${surah.name}</small>
        </span>
        <small>${surah.numberOfAyahs}</small>
      `;
      button.addEventListener('click', () => {
        currentSurahNumber = surah.number;
        renderSurah(surah.number);
        renderSurahList();
        window.localStorage.setItem('last-quran-surah', String(surah.number));
      });
      surahListEl.appendChild(button);
    });
  };

  const renderSurah = async (surahNumber) => {
    const targetSurah = quranData.find((surah) => surah.number === Number(surahNumber));
    if (!targetSurah || !surahReaderEl) return;

    showStatus(`Loading ${targetSurah.englishName}...`);
    try {
      const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
      if (!response.ok) throw new Error('Failed to load surah');

      const data = await response.json();
      const verses = data.data.ayahs || [];
      const query = (verseSearchInput?.value || '').trim().toLowerCase();
      const filteredVerses = verses.filter((verse) => {
        const text = `${verse.text || ''} ${verse.translation || ''}`.toLowerCase();
        return !query || text.includes(query);
      });

      surahReaderEl.innerHTML = `
        <div class="panel-header">
          <h3>${targetSurah.name} — ${targetSurah.englishName}</h3>
          <button type="button" class="bookmark-btn" data-bookmark="${targetSurah.number}">Bookmark Surah</button>
        </div>
      `;

      if (!filteredVerses.length) {
        surahReaderEl.innerHTML += '<div class="status-box visible error">No matching verses found.</div>';
        showStatus('No matching verses found.', 'error');
        return;
      }

      const verseList = document.createElement('div');
      verseList.className = 'verse-blocks';

      filteredVerses.forEach((verse, index) => {
        const verseCard = document.createElement('div');
        verseCard.className = 'verse-block';
        verseCard.innerHTML = `
          <div class="verse-meta">${index + 1}</div>
          <div class="verse-arabic">${verse.text || ''}</div>
          <div class="verse-english">${verse.translation || verse.text || ''}</div>
          <button type="button" class="bookmark-btn" data-verse="${verse.numberInSurah}">Bookmark verse</button>
        `;
        verseList.appendChild(verseCard);
      });
      surahReaderEl.appendChild(verseList);

      const bookmarkButtons = surahReaderEl.querySelectorAll('[data-bookmark]');
      bookmarkButtons.forEach((button) => {
        button.addEventListener('click', () => {
          const saved = JSON.parse(localStorage.getItem('quran-bookmarks') || '[]');
          const key = button.dataset.bookmark;
          if (!saved.includes(key)) saved.push(key);
          localStorage.setItem('quran-bookmarks', JSON.stringify(saved));
          showStatus('Surah saved to bookmarks.', 'success');
        });
      });

      const verseButtons = surahReaderEl.querySelectorAll('[data-verse]');
      verseButtons.forEach((button) => {
        button.addEventListener('click', () => {
          const saved = JSON.parse(localStorage.getItem('quran-bookmarks') || '[]');
          const verseKey = `${targetSurah.number}:${button.dataset.verse}`;
          if (!saved.includes(verseKey)) saved.push(verseKey);
          localStorage.setItem('quran-bookmarks', JSON.stringify(saved));
          showStatus('Verse bookmarked successfully.', 'success');
        });
      });

      window.localStorage.setItem('last-quran-surah', String(surahNumber));
      showStatus(`${targetSurah.englishName} is ready to read.`, 'success');
    } catch (error) {
      console.error('Surah render failed', error);
      showStatus('The Quran content could not be loaded. Please retry in a moment.', 'error');
    }
  };

  const handleFontSize = (direction) => {
    const surahText = document.querySelectorAll('.verse-arabic');
    if (!surahText.length) return;
    currentFontSize = direction === 'increase' ? Math.min(currentFontSize + 4, 32) : Math.max(currentFontSize - 4, 16);
    surahText.forEach((el) => {
      el.style.fontSize = `${currentFontSize}px`;
    });
    localStorage.setItem('quran-font-size', String(currentFontSize));
  };

  if (surahSearchInput) {
    surahSearchInput.addEventListener('input', renderSurahList);
  }

  if (verseSearchInput) {
    verseSearchInput.addEventListener('input', () => {
      if (currentSurahNumber) renderSurah(currentSurahNumber);
    });
  }

  fontBtnEls.forEach((button) => {
    button.addEventListener('click', () => handleFontSize(button.dataset.size));
  });

  const savedFont = Number(localStorage.getItem('quran-font-size') || 18);
  if (savedFont) currentFontSize = savedFont;

  const savedSurah = Number(localStorage.getItem('last-quran-surah') || 1);
  currentSurahNumber = savedSurah;

  fetchQuran();
});
