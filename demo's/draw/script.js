var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

$(document).on('mouseover click', '#canvas', function (event) {
    if (event.type == "mouseover" && event.type == "click") {
        alert("e");
    }
});

$("#canvas").mousemove(function (arg) {
    context.fillStyle = "#1477CC";
    var pos = getMousePos(canvas, arg);
    context.beginPath();
    context.arc(pos.x, pos.y, 5, 0, 2 * Math.PI);
    context.fill();
});

function getMousePos(canvas, e) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

//Clear

$("#clear").click(function () {
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, 950, 1000);
});