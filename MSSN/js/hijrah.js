document.addEventListener('DOMContentLoaded', () => {
  const hijriDateText = document.getElementById('hijriDateText');
  const gregorianDateText = document.getElementById('gregorianDateText');
  const calendarMonthLabel = document.getElementById('calendarMonthLabel');
  const hijriCalendarEl = document.getElementById('hijriCalendar');
  const prevMonthBtn = document.getElementById('prevMonthBtn');
  const nextMonthBtn = document.getElementById('nextMonthBtn');
  const todayBtn = document.getElementById('todayBtn');

  let currentDate = new Date();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const renderCalendar = () => {
    if (!hijriCalendarEl) return;

    hijriCalendarEl.innerHTML = '';
    weekdays.forEach((day) => {
      const label = document.createElement('div');
      label.className = 'day-name';
      label.textContent = day;
      hijriCalendarEl.appendChild(label);
    });

    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startingOffset = firstDay.getDay();

    for (let i = 0; i < startingOffset; i += 1) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'calendar-day empty';
      hijriCalendarEl.appendChild(emptyCell);
    }

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      const cell = document.createElement('div');
      cell.className = 'calendar-day';
      cell.textContent = day;

      const isToday =
        day === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();

      if (isToday) cell.classList.add('today');

      hijriCalendarEl.appendChild(cell);
    }

    if (calendarMonthLabel) {
      calendarMonthLabel.textContent = `${currentDate.toLocaleString('en-US', { month: 'long' })} ${currentDate.getFullYear()}`;
    }
  };

  const updateHijriDate = () => {
    const today = new Date();
    if (hijriDateText) {
      const hijri = new Intl.DateTimeFormat('en-u-ca-islamic', { year: 'numeric', month: 'long', day: 'numeric' }).format(today);
      hijriDateText.textContent = hijri;
    }

    if (gregorianDateText) {
      gregorianDateText.textContent = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
  };

  prevMonthBtn?.addEventListener('click', () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    renderCalendar();
  });

  nextMonthBtn?.addEventListener('click', () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    renderCalendar();
  });

  todayBtn?.addEventListener('click', () => {
    currentDate = new Date();
    renderCalendar();
  });

  updateHijriDate();
  renderCalendar();
});
