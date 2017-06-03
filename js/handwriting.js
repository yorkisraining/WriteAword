var canvasWidth = Math.min(600, $(window).width()-20);
var canvasHeight = canvasWidth;

var isMouseDown = false;
var lastLoc = {x:0, y:0};
var lastTimestamp = 0;
var lastLineWidth = -1;
var strokeColor = 'black';

var canvas = document.getElementById("canvas");
var cxt = canvas.getContext('2d');
canvas.width = canvasWidth;
canvas.height = canvasHeight;

window.onload = function() {
	drawGrid();
	mouse(event);
	touchIt(event);
	$('#controller').css('width', canvasWidth);
	//windowToCanvas();
}

function windowToCanvas(x,y) {
	var bbox = canvas.getBoundingClientRect();
	var left = bbox.left;
	var top = bbox.top;
	return {x:(x-left)>>0, y:(y-top)>>0};
}

function beginStroke(point) {
	isMouseDown = true;
	lastLoc = windowToCanvas(point.x, point.y);
	lastTimestamp = new Date().getTime();
}

function stopStroke() {
	isMouseDown = false;
}

function moveStroke(point) {
	var curLoc = windowToCanvas(point.x, point.y);
	var curTimestamp = new Date().getTime();
	var s = calcDistance(curLoc, lastLoc);
	var t = curTimestamp - lastTimestamp;			
	var lineWidth = calcLineWidth(t, s);
	
	cxt.beginPath();
	cxt.moveTo(lastLoc.x, lastLoc.y);
	cxt.lineTo(curLoc.x, curLoc.y);
	
	cxt.strokeStyle = strokeColor;
	cxt.lineCap = 'round';
	cxt.lineJoin = 'round';
	cxt.lineWidth = lineWidth;
	cxt.stroke();
	
	lastLoc = curLoc;
	lastTimestamp = curTimestamp;
	lastLineWidth = lineWidth;	
}

function mouse(e) {
	var e = window.event || e;
	canvas.onmousedown = function(e) {
		e.preventDefault();
		beginStroke({x:e.clientX, y:e.clientY});
	};
	canvas.onmouseup = function(e) {
		e.preventDefault();
		stopStroke();
	};
	canvas.onmouseout = function(e) {
		e.preventDefault();
		stopStroke();
	};
	canvas.onmousemove = function(e) {
		e.preventDefault();
		if (isMouseDown) {
			moveStroke({x:e.clientX, y:e.clientY});
		}
	};
}

function touchIt(e) {
	var e = window.event || e;
	canvas.addEventListener('touchstart', function(e){
		e.preventDefault();
		touchs = e.touches[0];
		beginStroke({x:touchs.pageX, y:touchs.pageY});
	});
	canvas.addEventListener('touchmove', function(e){
		e.preventDefault();
		if (isMouseDown) {
			touchs = e.touches[0];
			moveStroke({x:touchs.pageX, y:touchs.pageY});
		}
	});
	canvas.addEventListener('touchend', function(e){
		e.preventDefault();
		stopStroke();
	});
}

function calcDistance(loc1, loc2) {
	return Math.sqrt( (loc1.x - loc2.x) * (loc1.x - loc2.x) + (loc1.y - loc2.y) * (loc1.y - loc2.y) );
}

function calcLineWidth(t, s) {
	
	var v = s/t;
	var resultLinewidth;
	var maxLineWidth = 30;
	var minLineWidth = 1
	var maxStrokeV = 10;
	var minStrokeV = 0.1
	var per = 1/4;
	
	if (v <= minStrokeV) {
		resultLinewidth = maxLineWidth;
	} else if (v >= maxStrokeV) {
		resultLinewidth = minLineWidth;
	} else {
		resultLinewidth = maxLineWidth - (v-minStrokeV)/(maxStrokeV-minLineWidth)*(maxLineWidth-minLineWidth);
	}
	
	if (lastLineWidth == -1) {
		return resultLinewidth;
	} else {
		return lastLineWidth*(1-per) + resultLinewidth*per;
	}
	
}

function drawGrid() {
	cxt.save();
	cxt.strokeStyle = 'rgb(230,11,9)';
	cxt.beginPath();
	cxt.moveTo(3,3)
	cxt.lineTo(canvasWidth-3, 3);
	cxt.lineTo(canvasWidth-3, canvasHeight-3);
	cxt.lineTo(3, canvasHeight-3);
	cxt.closePath();
	cxt.lineWidth = 6;
	cxt.stroke();
	
	cxt.beginPath()
	cxt.moveTo(0, 0);
	cxt.lineTo(canvasWidth, canvasHeight);
	
	cxt.moveTo(canvasWidth, 0);
	cxt.lineTo(0, canvasHeight);
	
	cxt.moveTo(canvasWidth/2, 0);
	cxt.lineTo(canvasWidth/2, canvasHeight);
	
	cxt.moveTo(0, canvasHeight/2);
	cxt.lineTo(canvasWidth, canvasHeight/2);
	
	cxt.lineWidth = 1;
	cxt.stroke();
	
	cxt.restore();
}


$('#clear_btn').click(
	function(e) {
		cxt.clearRect(0, 0, canvasWidth, canvasHeight);
		drawGrid();
	}
)

$('.color_btn').click(
	function(e) {
		$('.color_btn').removeClass('color_btn_selected');
		$(this).addClass('color_btn_selected');
		strokeColor = $(this).css('background-color');
	}
)
