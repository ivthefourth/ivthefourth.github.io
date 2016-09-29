
//Each line is one way to win (connecting three squares)
function Line(squaresArray){

	//number of squares containing an X
	this.x = 0;

	//number of squares containing an O
	this.o = 0;

	//squares contained in this line
	this.squares = squaresArray;
}
Line.prototype.resetForNewGame = function(){
	;
}
Line.prototype.isCompleted = function(){
	return this.x === 3 || this.o === 3;
}

//each square of the game _, X, or O
function Square(htmlId, type){
	this.htmlId = htmlId;
	this.isTaken = false;

	//lines that contain this square
	this.lines = [];
}
Square.prototype.resetForNewGame = function(){
	;
}


function Game(id){
	this.currentTurnNumber = 1;
	this.userCanPlay = false;// click handlers on board, should make sure this is true
	this.difficulty = null; //0 easy (random), 1 medium(defensive only, not smart), 2 hard(user can't win, tries to win if going first)... see if any square shares two lines with one computer thing
	this.winner = 'draw';
	this.squares = []; // 0-8 in array %2 >> corner, == 4 center
	this.lines = [];


	//make squares
	;

	//make lines
	;

	//put lines in squares
	//for lines:
	//	for square in line: square.lines.push(line);
	;
}
Game.prototype.setDifficulty = function(difficulty) {
	//should be 0-2
	this.difficulty = difficulty;
}
Game.prototype.setUserLetter = function(letter){
	if( letter === 'x'){
		this.userCanPlay = true;
	}
	else{
		this.doComputerTurn();
	}
}
Game.prototype.doComputerTurn = function(playerChoice){
	var square;
	switch(difficulty){
		case 0: //easy
			//check for any lines that computer can win
			//pick a random, available square
			break;
		case 1: //medium
			//if turn number 1, set self up for win
			//check for any lines that computer can win
			//check for any lines that the user could win on and block them
			//if no lines, pick a random square
			break;
		case 2: //hard
			//if turn number is 1, play in center... or corner
			//center wins if they pick a middle
			//corner wins if they pick anywhere but center or opp corner.. can win if they pick center
			//if turn number is 2, see what playerChoice is and play in center if possible otherwise corner
			//if turn number is 3, play in any available corner
			//if turn is >3 check for any lines that the comp could win on and chose the square
			//if none of these, check for any lines that the user could win on and block them
			//if none of these, check for any squares that have two lines with no O's and one X
			//if none of these, pick random... or the square with the most lines with no O
			//find square with most lines with one x and no O, if tie, find which of those has most empty lines.. if tie, which has most lines, if tie just pick one
			//MAYBE ONLY DO THE TEST ABOVE AND NOT ALL THE OTHERS
			//NOO ^^ this won't work if player picks opoiste corners
			break;
	}

	
	if( this.checkForGameOver('computer') ){
		;
	}
	else{
		
		this.userCanPlay = true;//maybe on update interface call with slight timeout
		this.turnNumber += 1;
	}
}
Game.prototype.doUserTurn = function(square){
	if( this.userCanPlay ){
		userCanPlay = false;

		
		//if not won
		if( this.checkForGameOver('user') ){
			;
		}
		else{
			this.turnNumber += 1;
			this.doComputerTurn(square);//maybe slight timeout
		}
	}
}
Game.prototype.checkForGameOver = function(player){
	for( var i = 0; i < this.lines.length; i++){
		if( this.lines[i].isCompleted() ){
			this.winner = player;
			return true;
		}
	}
	return this.currentTurnNumber === 9;
}
Game.prototype.startNewGame = function(){
	this.winner = 'draw';
	this.currentTurnNumber = 1;
	//clear board and show difficulty on top of player choice
	;
	//call reset on all lines and squares
}

var game = new Game();
