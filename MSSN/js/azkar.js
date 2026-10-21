document.addEventListener('DOMContentLoaded', () => {
  const azkarCategories = document.getElementById('azkarCategories');
  const azkarItem = document.getElementById('azkarItem');
  const progressLabel = document.getElementById('azkarProgressLabel');
  const counterBar = document.getElementById('azkarCounterBar');
  const prevBtn = document.getElementById('prevAzkar');
  const nextBtn = document.getElementById('nextAzkar');
  const resetBtn = document.getElementById('resetAzkar');
  const incrementBtn = document.getElementById('incrementAzkar');

  const categories = [
    'Morning Azkar',
    'Evening Azkar',
    'After Salah',
    'Before Sleeping',
    'Upon Waking',
    'Travel',
    'Protection',
    'General Dhikr'
  ];

  const azkarData = {
    'Morning Azkar': [
      {
        arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ',
        transliteration: 'Asbahna wa asbahal mulku lillah wal hamdu lillah',
        translation: 'We have entered the morning and the kingdom belongs to Allah, and all praise is for Allah.',
        count: 1
      },
      {
        arabic: 'اللَّهُ أَكْبَرُ',
        transliteration: 'Allahu Akbar',
        translation: 'Allah is the Greatest.',
        count: 34
      }
    ],
    'Evening Azkar': [
      {
        arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ',
        transliteration: 'Amsayna wa amsa al-mulku lillah',
        translation: 'We have entered the evening and the kingdom belongs to Allah.',
        count: 1
      },
      {
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
        transliteration: 'Bismillah al-Rahman al-Rahim',
        translation: 'In the name of Allah, the Most Merciful, the Most Compassionate.',
        count: 3
      }
    ],
    'After Salah': [
      {
        arabic: 'سُبْحَانَ اللَّهِ',
        transliteration: 'SubhanAllah',
        translation: 'Glory be to Allah.',
        count: 33
      },
      {
        arabic: 'الْحَمْدُ لِلَّهِ',
        transliteration: 'Alhamdulillah',
        translation: 'All praise is due to Allah.',
        count: 33
      }
    ],
    'Before Sleeping': [
      {
        arabic: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي',
        transliteration: 'Bismika Rabbi wada tu janbi',
        translation: 'In Your name, my Lord, I lie down and I wake up.',
        count: 1
      }
    ],
    'Upon Waking': [
      {
        arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا',
        transliteration: 'Alhamdulillah alladhi ahyana ba’da ma amatana',
        translation: 'All praise is due to Allah, who gave us life after He caused us to die.',
        count: 1
      }
    ],
    Travel: [
      {
        arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا',
        transliteration: 'Subhana alladhi sakhkhara lana hadha',
        translation: 'Glory be to the One who has subjected this to us.',
        count: 1
      }
    ],
    'Protection': [
      {
        arabic: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
        transliteration: 'A’udhu billahi min ash-shaytan ir-rajim',
        translation: 'I seek refuge in Allah from the accursed Satan.',
        count: 1
      }
    ],
    'General Dhikr': [
      {
        arabic: 'لَا إِلَهَ إِلَّا اللَّهُ',
        transliteration: 'La ilaha illa Allah',
        translation: 'There is no deity worthy of worship except Allah.',
        count: 100
      }
    ]
  };

  let currentCategory = categories[0];
  let currentIndex = 0;
  let currentCount = 0;

  const setProgress = () => {
    const list = azkarData[currentCategory] || [];
    const max = list[currentIndex]?.count || 1;
    const progressPercent = Math.min((currentCount / max) * 100, 100);

    if (progressLabel) {
      progressLabel.textContent = `${currentCount} / ${max}`;
    }

    if (counterBar) {
      counterBar.style.width = `${progressPercent}%`;
    }
  };

  const renderCategories = () => {
    if (!azkarCategories) return;
    azkarCategories.innerHTML = '';
    categories.forEach((category) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `category-btn ${category === currentCategory ? 'active' : ''}`;
      button.textContent = category;
      button.addEventListener('click', () => {
        currentCategory = category;
        currentIndex = 0;
        currentCount = 0;
        renderAzkar();
        renderCategories();
      });
      azkarCategories.appendChild(button);
    });
  };

  const renderAzkar = () => {
    const list = azkarData[currentCategory] || [];
    const item = list[currentIndex] || {
      arabic: 'No content available',
      transliteration: '',
      translation: 'Please select another category.',
      count: 1
    };

    if (!azkarItem) return;
    azkarItem.innerHTML = `
      <div class="eyebrow">${currentCategory}</div>
      <div class="azkar-arabic">${item.arabic}</div>
      <div class="azkar-transliteration">${item.transliteration || ''}</div>
      <div class="azkar-translation">${item.translation}</div>
      <div class="azkar-transliteration">Repeat count: ${item.count}</div>
    `;
    currentCount = Number(localStorage.getItem(`azkar-count-${currentCategory}-${currentIndex}`) || 0);
    setProgress();
  };

  prevBtn?.addEventListener('click', () => {
    const list = azkarData[currentCategory] || [];
    currentIndex = (currentIndex - 1 + list.length) % list.length;
    currentCount = 0;
    renderAzkar();
  });

  nextBtn?.addEventListener('click', () => {
    const list = azkarData[currentCategory] || [];
    currentIndex = (currentIndex + 1) % list.length;
    currentCount = 0;
    renderAzkar();
  });

  resetBtn?.addEventListener('click', () => {
    currentCount = 0;
    localStorage.setItem(`azkar-count-${currentCategory}-${currentIndex}`, '0');
    setProgress();
  });

  incrementBtn?.addEventListener('click', () => {
    const list = azkarData[currentCategory] || [];
    const max = list[currentIndex]?.count || 1;
    currentCount = Math.min(currentCount + 1, max);
    localStorage.setItem(`azkar-count-${currentCategory}-${currentIndex}`, String(currentCount));
    setProgress();
  });

  renderCategories();
  renderAzkar();
});
