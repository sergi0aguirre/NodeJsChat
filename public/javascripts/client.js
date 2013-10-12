var host = "http://"+window.location.hostname;
$(document).ready(function(){
	$('.chat_bubble').hide();
	$('#join').click(function(){
		name=prompt('Enter your display name');
		if(name!=""){	
			$('.chat_bubble').show();
			var server= io.connect(host);	
			$('#welcome_chat').html('');
			$('#chat_container').append("<li>Connecting ...!</li>");
			server.on('connect', function(data){				
				$('#chat_container').append("<li>Connected to the Server!</li>");
				server.emit('join', name);
			});


			server.on('messages', function(data){
				$('#chat_container').append("<li>"+data+"</li>");
			});

			$('#message').keypress(function(e) {
				if(e.which == 13) {
					emitMessage(server,$(this));
				}
			});

			$('#send').click(function(){
				emitMessage(server,$('#message'));
			});


		}else{
			alert('You must enter a Display name');
		}
		return false;
	});


});


function emitMessage(server,message){
	message= message.val();
	$('#message').val('');
	server.emit('messages',message);

}

