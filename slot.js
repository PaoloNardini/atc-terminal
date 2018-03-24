/*
 * Slot
 * handle timers
 */
function Slot() {
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
}

Slot.prototype.setSlotTime = function (h,m,s) {
    this.hours = h;
    this.minutes = m;
    this.seconds = s;
}

Slot.prototype.setTimer = function (h,m,s) {
    var t = s + (m * 60) + (h * 3600);
    this.seconds = (clock_seconds + t) % 60;
    this.minutes = Math.floor((clock_minutes + (t / 60))) % 60;
    this.hours = Math.floor((clock_hours + (t / 3600))) % 24;
}

Slot.prototype.hasPassed = function(shift) {
    var h = clock_hours;
    var m = clock_minutes;
    var s = clock_seconds;
    if (shift != undefined) {
        var t = s + (m * 60) + (h * 3600);
        t = t + shift;
        s = t % 60;
        m = Math.floor(t / 60) % 60;
        h = Math.floor(t / 3600) % 24;
    }
    if (h > this.hours || (this.hours - h) == 23) {
        return true;
    }
    if (h == this.hours && m > this.minutes) {
        return true;
    }
    if (h == this.hours && m == this.minutes && s > this.seconds) {
        return true;
    }
    return false;
}

