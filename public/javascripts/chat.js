$( document ).ready(function() {
    var socket = io.connect();
    var $messageForm = $('#sendMessage');
    var $message = $('#message');
    var $chat = $('#chat');
    var $users = $('#users');
    var $nick = $('#nickName');
    var $setNick = $('#setNick');
    var typing = false;
    var timeout = undefined;

    function timeoutFunction() {
        typing = false;
        socket.emit("typing", false);
      }

    $setNick.click(function (event){
        event.preventDefault();
        if($nick.val() == ""){
            $('#loginBlank').show();
            $('#loginBlank').hide(5000);
        }else{
            socket.emit('newUser', $nick.val(), function(data){
                if(data){
                    $('#nickController').hide();
                    $('#content').show();
                }else{
                    $('#loginError').show();
                    $('#loginError').hide(5000);
                }
            });
        }
    });

    $messageForm.submit(function (event){
        event.preventDefault();
        if($message.val()!=''){
            //console.log($message.val());
            socket.emit('sendMessage', $message.val());
            $message.val('');
        }
    });

    socket.on('newMessage', function(data){
    	// console.log(data.nick+': '+data.msg);
        $chat.append(data.nick+': '+data.msg+'<br>');
    });

    socket.on('userNames', function(data){
        var $userNamesString = "";
        for(var $username in data){
            $userNamesString += $username+"<br>";
        }
        //$users.html("");
        $users.empty();
        $users.append($userNamesString);
    });

    $("#message").keypress(function(e){
        if (e.which !== 13) {
          if (typing === false && $("#message").is(":focus")) {
            typing = true;
            socket.emit("typing", true);
          } else {
            clearTimeout(timeout);
            timeout = setTimeout(timeoutFunction, 5000);
          }
        }
      });
      
      socket.on("isTyping", function(data) {
        if (data.isTyping) {
          $("#updates").append("<li id=\""+data.nick+"\">"+data.nick+" esta escribiendo</li>");
          timeout = setTimeout(timeoutFunction, 5000);
        } else {
          $("#"+data.nick+"").remove();
        }
      });


});