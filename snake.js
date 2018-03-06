var okrag = function (x, y, promien, wypelnijO) {
	kontekst.beginPath();
	kontekst.arc(x, y, promien, 0, Math.PI * 2, false);
	if (wypelnijO) {
		kontekst.fill();
	} else {
		kontekst.stroke();
	}
};	

	
var plotno = document.getElementById("plotno");//canvas
var kontekst = plotno.getContext("2d");//drawingContext
var szerokosc = plotno.width;//canvasWidth
var wysokosc = plotno.height;//canvasHeight

var rozmiarBloku = 10;
var szerokoscWBlokach = szerokosc / rozmiarBloku;
var wysokoscWBlokach = wysokosc / rozmiarBloku;//10pixelsPerSquare on canvas, 

var score = 0;//gameScore

var drawBorder = function () {
	kontekst.fillStyle = "Gray";
	kontekst.fillRect(0, 0, szerokosc, rozmiarBloku);
	kontekst.fillRect(0, wysokosc - rozmiarBloku, szerokosc, rozmiarBloku);
	kontekst.fillRect(0, 0, rozmiarBloku, wysokosc);
	kontekst.fillRect(szerokosc - rozmiarBloku, 0, rozmiarBloku, wysokosc);
};//border

var drawScore = function () {
	kontekst.font = "20px Courier";
	kontekst.fillStyle = "Black";
	kontekst.textAlign = "left";
	kontekst.textBaseline = "top";
	kontekst.fillText("Wynik: " + score, rozmiarBloku, rozmiarBloku);
};//printing Score On The Canvas

var GameOver = function () {
	clearInterval(IdPrzedzialu);
	kontekst.font = "60px Courier";
	kontekst.fillStyle = "Black";
	kontekst.textAlign = "center";
	kontekst.textBaseline = "middle";
	kontekst.fillText("Game Over", szerokosc / 2, wysokosc / 2);
};

var Blok = function (kolumna, wiersz) {
	this.kolumna = kolumna;
	this.wiersz = wiersz;
}; //block contructor, paramethers specify its position on the canvas

Blok.prototype.drawSquare = function (color) {
	var x = this.kolumna * rozmiarBloku;
	var y = this.wiersz * rozmiarBloku;
	kontekst.fillStyle = color;
	kontekst.fillRect(x, y, rozmiarBloku, rozmiarBloku);
}; //Blok method for drawing square on the canvas

Blok.prototype.drawCircle = function (color) {
	var srodekX = this.kolumna * rozmiarBloku + rozmiarBloku / 2;
	var srodekY = this.wiersz * rozmiarBloku + rozmiarBloku / 2;
	kontekst.fillStyle = color;
	okrag(srodekX, srodekY, rozmiarBloku / 2, true);
}; //Blok method for drawing disc

Blok.prototype.compare = function (anotherBlok) {
	return this.kolumna === anotherBlok.kolumna && this.wiersz === anotherBlok.wiersz;
}; //Blok method that checks if two blocks share the same position on the canvas
	
var Snake = function () {
	this.segments = [
		new Blok(7, 5),
		new Blok(6, 5),
		new Blok(5, 5)
	]; 
	
	this.Direction = "prawa";
	this.nextDirection = "prawa";
};//Snake constructor that uses an array of blocks with defined position at the start of the game

Snake.prototype.draw = function () {
	for (var i = 0; i < this.segments.length; i++) {
		this.segments[i].drawSquare("Blue");
	}
}; //Snake method for drawing snake; loops through segments array and draws a block for every segment
    

Snake.prototype.move = function () {
	var snakeHead = this.segments[0];
	var newSnakeHead;
	
	this.Direction = this.nextDirection;
	if (this.Direction === "prawa") {
		newSnakeHead = new Blok(snakeHead.kolumna + 1, snakeHead.wiersz);
	} else if (this.Direction === "dol") {
		newSnakeHead = new Blok(snakeHead.kolumna, snakeHead.wiersz + 1);
	} else if (this.Direction === "lewa") {
		newSnakeHead = new Blok(snakeHead.kolumna - 1, snakeHead.wiersz);
	} else if (this.Direction === "gora") {
		newSnakeHead = new Blok(snakeHead.kolumna, snakeHead.wiersz - 1);
	}
	
	if (this.checkForColision(newSnakeHead)) {
		GameOver();
		return;
	}
	
	this.segments.unshift(newSnakeHead);
	
	if (newSnakeHead.compare(apple.pozycja)) {
		score++;
		apple.teleprot();
	} else {
		this.segments.pop();
	}
};//Snake method for moving; creates new block (snake head) and unshifts it to the snake segments array, depending on the current direction; 
    //also calls for a Snake .checkForColision method, that checks if snake head collided with walls or its tail, and if so, calls for a GameOver function;
    //then using Blok .compare method checks if snake ate an apple, if so - score is incremented and Apple .teleprot method is called to generate new position for the apple
    //otherwise last segment from snake body array (segments) is popped, so the snake length stays the same

Snake.prototype.checkForColision = function (snakeHead) {
	var lewoColision = (snakeHead.kolumna === 0);
	var goraColision = (snakeHead.wiersz === 0);
	var prawoColision = (snakeHead.kolumna === szerokoscWBlokach - 1);
	var dolColision = (snakeHead.wiersz === wysokoscWBlokach - 1);
	
	var scianaColision = lewoColision || goraColision || prawoColision || dolColision;
	
	var tailColision = false;
	
	for (var i = 0; i < this.segments.length; i++) {
		if (snakeHead.compare(this.segments[i])) {
			tailColision = true;
		}
	}
	return scianaColision || tailColision;
};//Snake method that checks if snake head collided with either one of the walls (border) or its tail

var directionKeyCode = {
	37: "lewa",
	38: "gora",
	39: "prawa",
	40: "dol"
};//an object used to convert arrow key codes to a string, for more readable usage

$("body").keydown(function (press) {
	var newDirection = directionKeyCode[press.keyCode];
	if (newDirection !== undefined) {
		snake.callDirection(newDirection);
	}
});//jQuery event listener that sets new direction depending on the user action (arrow key pressed) and calls Snake .callDirection method

Snake.prototype.callDirection = function (newDirection) {
	if (this.Direction === "gora" && newDirection === "dol") {
		return;
	} else if (this.Direction === "dol" && newDirection === "gora") {
		return;
	} else if (this.Direction === "prawa" && newDirection === "lewa") {
		return;
	} else if (this.Direction === "lewa" && newDirection === "prawa") {
		return;
	}
this.nextDirection = newDirection;
};//Snake method that sets next direction of the snake; also checks if the move isn't illegal (the opposite of the current direction)

var Apple = function () {
	this.pozycja = new Blok(10, 10);
};//an apple contructor

Apple.prototype.draw = function () {
	this.pozycja.drawCircle("LimeGreen");
};//Apple method for drawing the apple

Apple.prototype.teleprot = function () {
	var randomKolumna = Math.floor(Math.random() * (szerokoscWBlokach - 2)) + 1;
	var randomWiersz = Math.floor(Math.random() * (wysokoscWBlokach - 2)) + 1;
	this.pozycja = new Blok(randomKolumna, randomWiersz);
};//Apple method that moves the apple to new, random position on the canvas

var apple = new Apple();
var snake = new Snake();// new snake and apple objects are created using their constructors

var IdPrzedzialu = setInterval(function () {
	kontekst.clearRect(0, 0, szerokosc, wysokosc);
	drawScore();
	snake.move();
	snake.draw();
	apple.draw();
	drawBorder();
}, 100); //game interval, clears and fills the canvas every 100 miliseconds causing the gameflow; depending on the time interval the snake will appear to move either slower or faster