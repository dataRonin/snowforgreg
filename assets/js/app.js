/**
 * CLIENT
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
            $("#snowpic").attr("src", "/images/" + data.img);
            $("#coverage").val(data.coverage);
            $('#datepicker').val(data.dt);
            $('#notes').val(data.notes);
            $('#depth').val(data.depth);
        });

        socket.on("modal1", function(data){
            console.log("you clicked modal1");
            $("#snowpic_modal1").attr("src", "/images/" + data);
        });

        socket.on("modal2", function(data){
            console.log("you clicked modal2");
            $("#snowpic_modal2").attr("src", "/images/" + data);
        });

    }

    // Send messages through websocket to server
    function socket_emitters(socket) {
        socket.emit('display-initial-data');
        socket.emit('modal9');
        socket.emit('modal3');

        $('#nine').click(function (event) {
            //event.preventDefault();
            var date = $('#datepicker').val();
            console.log("the date in datepicker is " + date);
            socket.emit('modal9', { date: date });
        });

        $('#three').click(function (event) {
            //event.preventDefault();
            var date = $('#datepicker').val();
            console.log("the date in datepicker is " + date);
            socket.emit('modal3', { date: date });
        });

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
            console.log('the date i am changing to is ' + date )
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
