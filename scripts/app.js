
const { ipcRenderer, shell } = require('electron')

class Timer {
    constructor(hours, minutes, seconds = 60) {
        this.hours = hours;
        this.minutes = minutes;
        this.seconds = seconds;
        this.initialHours = hours;
        this.initialMinutes = minutes;
        this.initialSeconds = seconds;
        this.timer;
        this.pomodoroTime;
        this.remainingsec;
    }

    startTimer(display) {
        this._initializePomotime();
        this.timer = this.pomodoroTime;
        clearInterval(this.pomodoroIntervalId);

        this.pomodoroIntervalId = setInterval(() => {
            if (++(this.timer) < 0) {
                this.timer = this.pomodoroTime;
            }

            this.hours = parseInt(this.timer / 3600, 10);
            this.remainingsec = parseInt(this.timer % 3600, 10);
            this.minutes = parseInt(this.remainingsec / 60, 10);
            this.seconds = parseInt(this.remainingsec % 60, 10);
            this.hours = this.hours < 10 ? '0' + this.hours : this.hours;
            this.minutes = this.minutes < 10 ? '0' + this.minutes : this.minutes;
            this.seconds = this.seconds < 10 ? '0' + this.seconds : this.seconds;

            display.textContent = this.hours + ":" + this.minutes + ":" + this.seconds;
            ipcRenderer.send('time-updated', display.textContent)
            if (this.hours == 0 && (this.minutes == 0 && this.seconds == 0)) {
                notifyUser();
                this.stopTimer();
            }
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.pomodoroIntervalId);
    }

    resetTimer(selector) {

        this.hours = this.initialHours;
        this.minutes = this.initialMinutes;
        this.seconds = this.initialSeconds;
        clearInterval(this.pomodoroIntervalId);
        document.querySelector(selector).textContent = `${this._getDoubleDigit(this.initialMinutes) + ':' + this._getDoubleDigit(this.initialHours)}:00`;

    }

    _getDoubleDigit(number) {
        const filledNumber = '0' + number.toString();
        return filledNumber.length >= 3 ? filledNumber.slice(1, filledNumber.length) : filledNumber;
    }

    _initializePomotime() {
        if (this.minutes == this.initialMinutes && this.seconds == this.initialSeconds) {
            this.pomodoroTime = this.minutes * this.seconds;
        } else {
            this.pomodoroTime = this.minutes * 60 + this.seconds;
        }
    }
}

document.addEventListener('click', (event) => {
    if (event.target.href) {
        // Open links in external browser
        shell.openExternal(event.target.href)
        event.preventDefault()
    }
})


let normalTimer = new Timer(0, 0);
var display = document.querySelector('#time');

$('#start').click(() => {

    normalTimer.startTimer(display);
    $('#stop').show();
    $('#start').hide();
})

$('#stop').click(() => {
    normalTimer.stopTimer();
    $('#start').show();
    $('#stop').hide();
});

$('#reset').click(() => {
    normalTimer.resetTimer('#time');

    $('#start').show();
    $('#stop').hide();
});



