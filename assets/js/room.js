var socket = io();
var offset = 0;
var h = 0;
var sentmsg = ''; // to be change later


var name = prompt("your name");
socket.emit('addUser', name);

var room = prompt("select room");
socket.emit('addRoom', room);

function scrollToBottom() {
  var h = $('#msgpane')[0].scrollHeight;
  $('#msgpane').animate({ scrollTop: h }, 100);
}

$('form').submit(function(){
  if (!$('#m').val().trim()){
    return false;
  }
  socket.emit('chatmsg', $('#m').val());
  sentmsg = $('#m').val();
  $('#m').val('');
  $('#m').focus();
  return false;
});


socket.on('chatmsg', function(msg){
  if (sentmsg == msg) {
    $('#messages').append($('<div>').text(msg).addClass('mymsg'));
  } else {
    $('#messages').append($('<div>').text(msg));
  }
  $('#messages').append('<br>');
  scrollToBottom();
});