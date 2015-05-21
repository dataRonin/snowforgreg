/**
 * Front-end core
 */
(function ($) {

    // Receive messages through websocket from server
    function socket_listeners(socket) {
        // console.log(data);
        socket.on("refresh-data", function (data) {
            $("#snowpic").attr("src", "/images/" + data.img);
            $("#coverage").val(data.coverage);
            $('#datepicker').val(data.dt);
            $('#notes').val(data.notes);
            $('#depth').val(data.depth);
        });
        socket.on('updated-date', function (data) {
            console.log(data);
        });

    }

    // Send messages through websocket to server
    function socket_emitters(socket) {
        socket.emit('display-initial-data');

        $('#next').click(function (event) {
            event.preventDefault();
            var data = {
                coverage: $("#coverage").val(),
                dt: $('#datepicker').val(),
                notes: $('#notes').val(),
                depth: $('#depth').val()
            };
            console.log(data);
            socket.emit("update-data", data);
        });

        $('#datepicker').change(function () {
            var date = $('#datepicker').val();
            socket.emit("get-date-data", { date: date });
        });
    }

    /* the main function */
    $(document).ready(function () {
        var socket_url, socket;
        
        socket_url = window.location.protocol + '//' + document.domain + ':' + location.port;
        socket = io.connect(socket_url);

        socket.on('connect', function () {
            socket_listeners(socket);
            socket_emitters(socket);            
        });
    });

}(jQuery));
