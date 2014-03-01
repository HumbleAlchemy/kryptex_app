var seconds_left;
var socket = io.connect();
function startTime(){
    var target_date = new Date().getTime() + <%= timer %>;
    var days, hours, minutes, seconds;
    setInterval(function () {
        var current_date = new Date().getTime();
        seconds_left = (target_date - current_date) / 1000;
        days = parseInt(seconds_left / 86400);
        seconds_left = seconds_left % 86400; 
        hours = parseInt(seconds_left / 3600);
        seconds_left = seconds_left % 3600;
        minutes = parseInt(seconds_left / 60);
        seconds = parseInt(seconds_left % 60);
        if( seconds_left <= 0){
        }
    }, 1000);
}