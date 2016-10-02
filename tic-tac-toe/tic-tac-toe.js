
//Each line is one way to win (connecting three squares)
function Line(squaresIndexes){

	//number of squares containing an X
	this.x = 0;

	//number of squares containing an O
	this.o = 0;

	//squares contained in this line (by index)
	this.squares = squaresIndexes;
}
Line.prototype.resetForNewGame = function(){
	this.x = 0;
	this.o = 0;
}
Line.prototype.isCompleted = function(){
	return this.x === 3 || this.o === 3;
}

//each square of the game _, X, or O
function Square(htmlId, type, relativeIndex){
	this.htmlId = htmlId;
	this.token = null;
	this.type = type;

	//position on relativeBoard (internally can be flipped)
	this.relativeIndex = relativeIndex;

	//lines that contain this square (by index)
	this.lines = [];
}
Square.prototype.resetForNewGame = function(){
	this.token = null;
}


function Game(id){
	this.gameCount = 0;
	this.currentTurnNumber = 1;
	this.userCanPlay = false;// click handlers on board, should make sure this is true
	this.difficulty = 2; //0 easy (random), 1 medium(defensive only, not smart), 2 hard(user can't win, tries to win if going first)... see if any square shares two lines with one computer thing
	this.winner = 'draw';
	this.squares = []; // 0-8 in array %2 >> corner, == 4 center
	this.lines = [];
	this.firstChoice = null;
	//relativeBoard is the board flipped to a certain orientation
	//contains indices of squares for this orientation 
	this.relativeBoard = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8]
	];


	//make squares
	var i;
	var type;
	var that = this;
	for( i = 0; i < 9; i++){
		if( i === 4)
			type = 'center';
		else if( i % 2 === 0)
			type = 'corner';
		else
			type = 'side';
		this.squares.push(new Square('square-' + i, type, i));
		document.getElementById('square-' + i).onclick = function(){
			that.doUserTurn(parseInt(this.id.charAt(7)));
		}
	}

	//make lines
	this.lines.push( new Line( [0, 1, 2] ));
	this.lines.push( new Line( [3, 4, 5] ));
	this.lines.push( new Line( [6, 7, 8] ));
	this.lines.push( new Line( [0, 3, 6] ));
	this.lines.push( new Line( [1, 4, 7] ));
	this.lines.push( new Line( [2, 5, 8] ));
	this.lines.push( new Line( [0, 4, 8] ));
	this.lines.push( new Line( [2, 4, 6] ));

	this.addLinesToSquares();

	//put lines in squares
	//for lines:
	//	for square in line: square.lines.push(line);
	;
}
Game.prototype.addLinesToSquares = function(){
	//8 = lines.length, 3 = lines.squares.length
	for(var i = 0; i < 8 ; i++){
		for(var j = 0; j < 3; j++){
			this.squares[this.lines[i].squares[j]].lines.push(i);
		}
	}
}
Game.prototype.setDifficulty = function(difficulty) {
	//should be 0-2
	this.difficulty = difficulty;
}
Game.prototype.setUserToken = function(token){
	if(!this.userToken){
		if( token === 'x'){
			this.computerToken = 'o';
			this.userToken = 'x';
			this.userCanPlay = true;
			document.getElementById('board').className = 'player-is-' + this.userToken;
		}
		else{
			this.computerToken = 'x';
			this.userToken = 'o';
			setTimeout(function(){game.doComputerTurn();}, 600);
		}
	}
}
Game.prototype.chooseSquare = function(index, token){
	var square = this.squares[index];
	square.token = token;
	for( var i = 0; i < square.lines.length; i++){
		var lineIndex = square.lines[i];
		this.lines[lineIndex][token] += 1;
	}
	document.getElementById(square.htmlId).className += ' has-' + token;
}
Game.prototype.strategy = function(playerChoiceIndex){
	var x, y, squareIndex;
	//console.log(this.currentTurnNumber);
	switch( this.currentTurnNumber ){
		case 1: //pick corner
			if( Math.floor(Math.random() * 2) > 0){
				x = Math.floor(Math.random() * 2) === 1 ? 0 : 2;
				y = Math.floor(Math.random() * 2) === 1 ? 0 : 2;
				squareIndex = this.relativeBoard[y][x];
				while( this.relativeBoard[0][2] !== squareIndex){
					this.flipBoard('vertical');
					if( this.relativeBoard[0][2] !== squareIndex)
						this.flipBoard('horizontal');
				}
				this.firstChoice = 'corner';
				return squareIndex;
			}
			else{ //pick center
				this.firstChoice = 'center';
				return this.relativeBoard[1][1];
			}
		case 2:
			if( this.squares[playerChoiceIndex].type == 'corner' ){
				while( this.relativeBoard[0][2] !== playerChoiceIndex){
					this.flipBoard('vertical');
					if( this.relativeBoard[0][2] !== playerChoiceIndex)
						this.flipBoard('horizontal');
				}
				this.firstChoice = 'corner';
				return 4; //if you don't choose center, you will lose if player knows what's up
			}
			else if( this.squares[playerChoiceIndex].type == 'side' ){
				while( this.relativeBoard[0][1] !== playerChoiceIndex){
					this.flipBoard('positiveDiagonal');
					if( this.relativeBoard[0][1] !== playerChoiceIndex)
						this.flipBoard('negativeDiagonal');
				}
				this.firstChoice = 'side';
				return this.relativeBoard[0][2];
			}
			else{ //they chose center
				x = Math.floor(Math.random() * 2) === 1 ? 0 : 2;
				y = Math.floor(Math.random() * 2) === 1 ? 0 : 2;
				squareIndex = this.relativeBoard[y][x];
				while( this.relativeBoard[0][2] !== squareIndex){
					this.flipBoard('vertical');
					if( this.relativeBoard[0][2] !== squareIndex)
						this.flipBoard('horizontal');
				}
				this.firstChoice = 'center';
				return squareIndex;
			}
		case 3:
			if( this.firstChoice === 'center' ){
				if( this.squares[playerChoiceIndex].type == 'corner' ){
					while( this.relativeBoard[0][2] !== playerChoiceIndex){
						this.flipBoard('vertical');
						if( this.relativeBoard[0][2] !== playerChoiceIndex)
							this.flipBoard('horizontal');
					}
					return this.relativeBoard[2][0];
				}
				else if( this.squares[playerChoiceIndex].type == 'side' ){
					while( this.relativeBoard[0][1] !== playerChoiceIndex){
						this.flipBoard('positiveDiagonal');
						if( this.relativeBoard[0][1] !== playerChoiceIndex)
							this.flipBoard('negativeDiagonal');
					}
					x = Math.floor(Math.random() * 2) === 1 ? 0 : 2;
					y = Math.floor(Math.random() * 3);
					return this.relativeBoard[y][x];
				}
			}
			else{ // corner
				if( playerChoiceIndex === this.relativeBoard[1][2] || 
					playerChoiceIndex === this.relativeBoard[2][1] || 
					playerChoiceIndex === this.relativeBoard[2][2] )
					this.flipBoard('positiveDiagonal');
				if( this.squares[playerChoiceIndex].type == 'center' ){
					return this.relativeBoard[2][0];
				}
				else if( this.squares[playerChoiceIndex].type == 'side' ){
					return 4;
				}
				else{ //corner
					return this.relativeBoard[2][2];
				}
			}
		case 4:
			if( this.firstChoice === 'center'){
				return null; //normal algorithm can catch all cases here
			}
			else if( this.firstChoice === 'side'){
				if( playerChoiceIndex === this.relativeBoard[2][0] || 
					playerChoiceIndex === this.relativeBoard[2][2] )
					return 4;
				else if( playerChoiceIndex === this.relativeBoard[0][0] )
					return this.relativeBoard[1][2];
				else if( playerChoiceIndex === this.relativeBoard[1][0] )
					return this.relativeBoard[2][2];
				else if( playerChoiceIndex === this.relativeBoard[1][2] )
					return this.relativeBoard[2][1];
				else
					return null;
			}
			else{ //corner
				if( playerChoiceIndex === this.relativeBoard[1][2] || 
					playerChoiceIndex === this.relativeBoard[2][1] || 
					playerChoiceIndex === this.relativeBoard[2][2] )
					this.flipBoard('positiveDiagonal');
				if( playerChoiceIndex === this.relativeBoard[1][0] )
					return this.relativeBoard[2][0];
				else if( playerChoiceIndex === this.relativeBoard[2][0] )
					return this.relativeBoard[0][1];

			}
		default:
			return null;
	}
}
Game.prototype.doComputerTurn = function(playerChoiceIndex){
	var square = null;
	var i, j;
	switch(this.difficulty){
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


			//seeing if computer can win this turn
			for( i = 0; i < 8; i++){
				if( this.lines[i][this.computerToken] === 2 &&
					this.lines[i][this.userToken] === 0 ){
							console.log(i);
					for( j = 0; j < 3; j++){
						if( !this.squares[ this.lines[i].squares[j]].token ){
							console.log(j);
							square = this.lines[i].squares[j];
							break;
						}
					}
				}
			}
			//then test to see if computer needs to block the opponent from winning
			if( square === null ){
				for( i = 0; i < 8; i++){
					if( this.lines[i][this.computerToken] === 0 &&
						this.lines[i][this.userToken] === 2 ){
						for( j = 0; j < 3; j++){
							if( !this.squares[ this.lines[i].squares[j]].token ){
								square = this.lines[i].squares[j];
								break;
							}
						}
					}
				}
			}
			if( square === null){
				//for turns 1-4 check strategy to see where to go			
				if( this.currentTurnNumber <= 4){ 
					square = this.strategy(playerChoiceIndex);
				}
			}
			var compLines, userLines;
			var c2u0 = [];
			var c1u2 = [];
			var c0u2 = [];
			var c1u0 = [];
			if( square === null ){
				//then test squares
				for( i = 0; i < 9; i++){
					compLines = 0;
					userLines = 0;
					for(j = 0; j < this.squares[i].lines.length && !this.squares[i].token; j++){
						if( this.lines[ this.squares[i].lines[j] ][this.computerToken] === 1 &&
							this.lines[ this.squares[i].lines[j] ][this.userToken] === 0 ){
							compLines += 1;
						}
						else if( this.lines[ this.squares[i].lines[j] ][this.computerToken] === 0 &&
							this.lines[ this.squares[i].lines[j] ][this.userToken] === 1 ){
							userLines += 1;
						}
					}
					if( compLines === 2 )
						c2u0.push(i);
					else if(compLines === 1 && userLines === 2)
						c1u2.push(i);
					else if( compLines === 0 && userLines === 2)
						c0u2.push(i);
					else if( compLines === 1 )
						c1u0.push(i);

				}
				if( c2u0.length > 0 ){
					square = c2u0[ Math.floor( Math.random() * c2u0.length ) ];
				}
				else if( c1u2.length > 0 ){
					square = c1u2[ Math.floor( Math.random() * c1u2.length ) ];
				}
				else if( c0u2.length > 0 ){
					square = c0u2[ Math.floor( Math.random() * c0u2.length ) ];
				}
				else if( c1u0.length > 0 ){
					square = c1u0[ Math.floor( Math.random() * c1u0.length ) ];
				}
				else{//choose first available square
					for( i = 0; i < 9; i++){
						if( !this.squares[i].token ){
							square = i;
							break;
						}
					}
				}
			}
			break;
	}
	console.log(square);
	this.chooseSquare(square, this.computerToken);

	
	if( this.checkForGameOver('computer') ){
		this.showGameOver();
	}
	else{
		
		setTimeout(function(){
			game.userCanPlay = true;
			document.getElementById('board').className = 'player-is-' + game.userToken;
		}, 500);
		this.currentTurnNumber += 1;
	}
	this.printRelativeBoard();
}
Game.prototype.doUserTurn = function(squareIndex){
	console.log(squareIndex);
	if( this.userCanPlay && !this.squares[squareIndex].token ){
		this.userCanPlay = false;
		document.getElementById('board').className = '';
		this.chooseSquare(squareIndex, this.userToken);

		
		//if won/game over
		if( this.checkForGameOver('user') ){
			this.showGameOver();
		}
		else{
			this.currentTurnNumber += 1;
			var that = this;
			setTimeout(function(){that.doComputerTurn(squareIndex);}, 500);//maybe slight timeout
		}
	}
}
Game.prototype.checkForGameOver = function(player){
	for( var i = 0; i < this.lines.length; i++){
		if( this.lines[i].isCompleted() ){
			this.winner = player;
			this.winningLine = i;
			return true;
		}
	}
	return this.currentTurnNumber === 9;
}
Game.prototype.showGameOver = function(){
	document.getElementById('board').className = 'game-over';
	if( this.winner === 'draw'){
		document.getElementById('game-over-text').innerHTML = "You Tie!";
	}
	else if( this.winner === 'user' ){
		document.getElementById('game-over-text').innerHTML = "You Win!";
		for(var i = 0; i < 3; i++){
			document.getElementById(this.squares[this.lines[this.winningLine].squares[i]].htmlId ).className += ' winning-square'
		}
	}
	else{
		document.getElementById('game-over-text').innerHTML = "You Lose!";
		for(var i = 0; i < 3; i++){
			document.getElementById(this.squares[this.lines[this.winningLine].squares[i]].htmlId ).className += ' winning-square'
		}
	}
	document.getElementById('game-end-screen').setAttribute('style', 'display: block');
	setTimeout(function(){
		document.getElementById('game-end-screen').className = 'shown';
		game.canPlayAgain = true;
	}, 1500);
	setTimeout(function(){
		//call reset on all lines and squares
		for( var i = 0; i < 8; i++){
			game.lines[i].resetForNewGame();
		}
		for( i = 0; i < 9; i++){
			game.squares[i].resetForNewGame();
			document.getElementById('square-' + i).className = 'square';
		}
	}, 1600);
}
Game.prototype.startNewGame = function(){
	this.canPlayAgain = false;
	this.winner = 'draw';
	this.currentTurnNumber = 1;
	this.relativeBoard = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8]
	];
	this.gameCount += 1;
	document.getElementById('game-end-screen').className = 'hidden';
	document.getElementById('board').className = 'game-playing';
	setTimeout(function(){
		document.getElementById('game-end-screen').setAttribute('style', 'display: none');
	}, 500);
	if(this.gameCount % 2 === 1 && this.userToken === 'x' || 
		this.gameCount % 2 === 0 && this.userToken === 'o' ){
		setTimeout(function(){game.doComputerTurn();}, 1000);
	}
	else{
		this.userCanPlay = true;
		document.getElementById('board').className = 'player-is-' + this.userToken;
	}
}
Game.prototype.flipBoard = function(direction){
	var board = this.relativeBoard
	var swapIndexes = function(ax, ay, bx, by){
		var tmp = board[ax][ay];
		board[ax][ay] = board[bx][by];
		board[bx][by] = tmp;
	}
	switch(direction){
		case 'horizontal':
			swapIndexes(0, 0, 0, 2);
			swapIndexes(1, 0, 1, 2);
			swapIndexes(2, 0, 2, 2);
			break;
		case 'vertical':
			swapIndexes(0, 0, 2, 0);
			swapIndexes(0, 1, 2, 1);
			swapIndexes(0, 2, 2, 2);
			break;
		case 'positiveDiagonal':
			swapIndexes(0, 1, 1, 2);
			swapIndexes(0, 0, 2, 2);
			swapIndexes(1, 0, 2, 1);
			break;
		case 'negativeDiagonal':
			swapIndexes(0, 1, 1, 0);
			swapIndexes(0, 2, 2, 0);
			swapIndexes(1, 2, 2, 1);
			break;
	}
}
Game.prototype.printBoard = function(){
	console.log(
		' ' + (this.squares[0].token || '-') +
		' ' + (this.squares[1].token || '-') +
		' ' + (this.squares[2].token || '-') + '\n' +
		' ' + (this.squares[3].token || '-') +
		' ' + (this.squares[4].token || '-') +
		' ' + (this.squares[5].token || '-') + '\n' +
		' ' + (this.squares[6].token || '-') +
		' ' + (this.squares[7].token || '-') +
		' ' + (this.squares[8].token || '-') 
		);
}
Game.prototype.printRelativeBoard = function(){
	console.log(
		' ' + (this.squares[this.relativeBoard[0][0]].token || '-') +
		' ' + (this.squares[this.relativeBoard[0][1]].token || '-') +
		' ' + (this.squares[this.relativeBoard[0][2]].token || '-') + '\n' +
		' ' + (this.squares[this.relativeBoard[1][0]].token || '-') +
		' ' + (this.squares[this.relativeBoard[1][1]].token || '-') +
		' ' + (this.squares[this.relativeBoard[1][2]].token || '-') + '\n' +
		' ' + (this.squares[this.relativeBoard[2][0]].token || '-') +
		' ' + (this.squares[this.relativeBoard[2][1]].token || '-') +
		' ' + (this.squares[this.relativeBoard[2][2]].token || '-') + '\n\n\n' +
		' ' + (this.relativeBoard[0][0]) +
		' ' + (this.relativeBoard[0][1]) +
		' ' + (this.relativeBoard[0][2]) + '\n' +
		' ' + (this.relativeBoard[1][0]) +
		' ' + (this.relativeBoard[1][1]) +
		' ' + (this.relativeBoard[1][2]) + '\n' +
		' ' + (this.relativeBoard[2][0]) +
		' ' + (this.relativeBoard[2][1]) +
		' ' + (this.relativeBoard[2][2]) 
		);
}

document.getElementById('choose-x').onclick = function(){
	game.setUserToken('x');
	document.getElementById('choose-token').className = 'hidden';
	setTimeout(function(){
		document.getElementById('choose-token').setAttribute('style', 'display: none');
	}, 500);
}
document.getElementById('choose-o').onclick = function(){
	game.setUserToken('o');
	document.getElementById('choose-token').className = 'hidden';
	setTimeout(function(){
		document.getElementById('choose-token').setAttribute('style', 'display: none');
	}, 500);
}
document.getElementById('play-again').onclick = function(){
	game.startNewGame();
}

var game = new Game();
