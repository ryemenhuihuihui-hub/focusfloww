// Timer alarm sound using Web Audio API
function playAlarmSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    function beep(startTime, freq, duration) {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.value = freq;
        gainNode.gain.setValueAtTime(0.5, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    }

    // Play a pattern of beeps: 3 groups of 3 beeps
    const now = audioCtx.currentTime;
    for (let group = 0; group < 3; group++) {
        for (let i = 0; i < 3; i++) {
            beep(now + group * 0.8 + i * 0.15, 880, 0.12);
        }
    }
}

// Tab functionality
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
}

// Timer functionality
let timerInterval;
let timerSeconds = 0;
let timerRunning = false;

function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (timerRunning) return;
    
    const hours = parseInt(document.getElementById('timerHours').value) || 0;
    const minutes = parseInt(document.getElementById('timerMinutes').value) || 0;
    const seconds = parseInt(document.getElementById('timerSeconds').value) || 0;
    
    if (timerSeconds === 0) {
        timerSeconds = hours * 3600 + minutes * 60 + seconds;
    }
    
    if (timerSeconds > 0) {
        timerRunning = true;
        document.getElementById('startTimerBtn').textContent = 'Running...';
        
        timerInterval = setInterval(() => {
            timerSeconds--;
            document.getElementById('timerDisplay').textContent = formatTime(timerSeconds);
            
            if (timerSeconds <= 0) {
                clearInterval(timerInterval);
                timerRunning = false;
                document.getElementById('startTimerBtn').textContent = 'Start';
                playAlarmSound();
                alert('⏰ Timer Complete!');
            }
        }, 1000);
    }
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    document.getElementById('startTimerBtn').textContent = 'Start';
}

function resetTimer() {
    pauseTimer();
    timerSeconds = 0;
    document.getElementById('timerDisplay').textContent = '00:00:00';
    document.getElementById('timerHours').value = '0';
    document.getElementById('timerMinutes').value = '0';
    document.getElementById('timerSeconds').value = '0';
}

// Stopwatch functionality
let stopwatchInterval;
let stopwatchMilliseconds = 0;
let stopwatchRunning = false;
let lapCount = 0;

function formatStopwatch(ms) {
    const mins = Math.floor(ms / 6000);
    const secs = Math.floor((ms % 6000) / 100);
    const centis = ms % 100;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
}

function startStopwatch() {
    if (stopwatchRunning) return;
    stopwatchRunning = true;
    document.getElementById('startStopwatchBtn').textContent = 'Running...';
    
    stopwatchInterval = setInterval(() => {
        stopwatchMilliseconds++;
        document.getElementById('stopwatchDisplay').textContent = formatStopwatch(stopwatchMilliseconds);
    }, 10);
}

function pauseStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchRunning = false;
    document.getElementById('startStopwatchBtn').textContent = 'Start';
}

function lapStopwatch() {
    if (!stopwatchRunning) return;
    lapCount++;
    const lapTime = formatStopwatch(stopwatchMilliseconds);
    const lapsContainer = document.getElementById('lapsContainer');
    
    const lapItem = document.createElement('div');
    lapItem.className = 'lap-item';
    lapItem.innerHTML = `
        <span>Lap ${lapCount}</span>
        <span>${lapTime}</span>
    `;
    lapsContainer.insertBefore(lapItem, lapsContainer.firstChild);
}

function resetStopwatch() {
    pauseStopwatch();
    stopwatchMilliseconds = 0;
    lapCount = 0;
    document.getElementById('stopwatchDisplay').textContent = '00:00:00.00';
    document.getElementById('lapsContainer').innerHTML = '';
}

// Calendar functionality
let currentDate = new Date();
let notes = JSON.parse(localStorage.getItem('notes')) || [];

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    document.getElementById('currentMonth').textContent = 
        new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';
    
    // Day headers
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        grid.appendChild(header);
    });
    
    // Get first day of month and total days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = daysInPrevMonth - i;
        grid.appendChild(day);
    }
    
    // Current month days
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day';
        day.textContent = i;
        
        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            day.classList.add('today');
        }
        
        // Check for notes on this day
        const dateKey = `${year}-${month + 1}-${i}`;
        const dayNotes = notes.filter(n => n.date === dateKey);
        if (dayNotes.length > 0) {
            const indicator = document.createElement('div');
            indicator.className = 'note-indicator';
            day.appendChild(indicator);
        }
        
        day.onclick = () => selectDate(dateKey);
        grid.appendChild(day);
    }
    
    // Next month days
    const totalCells = firstDay + daysInMonth;
    const remainingCells = 42 - totalCells;
    for (let i = 1; i <= remainingCells; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = i;
        grid.appendChild(day);
    }
    
    renderNotes();
}

function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderCalendar();
}

function goToToday() {
    currentDate = new Date();
    renderCalendar();
}

function selectDate(dateKey) {
    document.querySelectorAll('.calendar-day.selected').forEach(d => d.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    document.getElementById('noteInput').focus();
    document.getElementById('noteInput').dataset.date = dateKey;
}

function addNote() {
    const input = document.getElementById('noteInput');
    const text = input.value.trim();
    const dateKey = input.dataset.date || new Date().toISOString().split('T')[0];
    
    if (text) {
        notes.push({ date: dateKey, text: text, id: Date.now() });
        localStorage.setItem('notes', JSON.stringify(notes));
        input.value = '';
        delete input.dataset.date;
        renderCalendar();
    }
}

function handleNoteKeypress(event) {
    if (event.key === 'Enter') {
        addNote();
    }
}

function deleteNote(id) {
    notes = notes.filter(n => n.id !== id);
    localStorage.setItem('notes', JSON.stringify(notes));
    renderCalendar();
}

function renderNotes() {
    const list = document.getElementById('notesList');
    list.innerHTML = '';
    
    const sortedNotes = [...notes].sort((a, b) => b.id - a.id);
    
    sortedNotes.forEach(note => {
        const item = document.createElement('div');
        item.className = 'note-item';
        item.innerHTML = `
            <div>
                <div>${note.text}</div>
                <div class="date">${note.date}</div>
            </div>
            <button class="delete-btn" onclick="deleteNote(${note.id})">×</button>
        `;
        list.appendChild(item);
    });
}

// Initialize
renderCalendar();
