class Puzzle{
	id;
	puzzle;
	block;
	board;
	image;
	emptyPosition;
	solveButton;
	moveTracker = 0;

	constructor(id, boardSize, solveButton = false){
		this.id = id;
		this.puzzle = document.querySelector('#' + this.id + ' .puzzle');
		this.image = this.getImage();
		this.block = {size: Math.round(this.image.size / boardSize), qty: this.square(boardSize)}
		this.board = this.getBoard(boardSize, this.image);
		this.solveButton = solveButton;
	}

	//Method to get puzzle image
	getImage(){
		const puzzle = this.puzzle;
		const img = puzzle.querySelector(".puzzleImg");
		const image = {uri: img.src, size:img.width};
		return image;
	}

	//Method to get puzzle board
	getBoard(size, image){
		const pieces = this.organizePieces(size, image);
		const structure = this.disociateImages(pieces.positions, pieces.structure);
		return structure;
	}

	//Method to get empty piece position
	getEmptyPosition(order, randomEmpty){
		let empty = false;
		if(order === randomEmpty){
			this.emptyPosition = {order:order};
			empty = true;
		}
		return empty;
	}

	//Method to organize pieces and set empty space
	organizePieces(size, image){
		const randomEmpty = this.randomNumber(0, this.block.qty);
		let blockSize = this.block.size;
		let piecesPosition = this.createPiecesPosition(image, blockSize);
		let positions = [];
		let structure = [];
		let order = 0;

		for (let i = 0; i < size; i++) {
			for (let y = 0; y < size; y++) {
				positions.push({top:piecesPosition[i], left:piecesPosition[y], order: order});
				structure.push({
					top:piecesPosition[i], 
					left:piecesPosition[y], 
					size: blockSize,
					empty: this.getEmptyPosition(order, randomEmpty)
				});
				order++;
			}
		}		
		return {positions: positions, structure: structure}
	}

	//Method to disociate images and positions in puzzle
	disociateImages(positions, structure){
		this.shuffle(positions).forEach((element, s) => {
			structure[s].topBackground = element.top;
			structure[s].leftBackground = element.left;
			structure[s].order = element.order;
			if(structure[s].empty){
				this.emptyPosition.top = structure[s].top;
				this.emptyPosition.left = structure[s].left; 
			}
		});
		return structure;
	}

	//Method to create pieces position
	createPiecesPosition(image, blockSize){
		let piecesPosition = [];
		let i = 0;
		while (i < image.size) {
			piecesPosition.push(i);
			i = blockSize + i;
		}	
		return piecesPosition;
	}

	//Method to create puzzle background image
	createBackground(size, puzzleContainer){
		const backgroundTransparentDiv = document.createElement('div');
		backgroundTransparentDiv.style.backgroundImage = 'url('+ this.image.uri +')';
		backgroundTransparentDiv.style.width = size;
		backgroundTransparentDiv.style.height = size;
		backgroundTransparentDiv.style.opacity = '0.2';
		puzzleContainer.appendChild(backgroundTransparentDiv);
	}

	//Method to create Puzzle Pieces
	createPieces(puzzleContainer){
		this.board.forEach((element, i) => {
			if(element.empty){
				return;
			}
			const iDiv = document.createElement('div');
			const iSpan = document.createElement('span');
			iSpan.textContent = element.order;
			iDiv.className = 'piece piece'+i;
			iDiv.style.width = element.size; 
			iDiv.style.height = element.size; 
			iDiv.style.top = element.top; 
			iDiv.style.left = element.left; 
			iDiv.setAttribute('data-correct-order-top', element.topBackground);
			iDiv.setAttribute('data-correct-order-left', element.leftBackground);
			iDiv.style.backgroundPositionY = '-' + element.topBackground + 'px';
			iDiv.style.backgroundPositionX = '-' + element.leftBackground + 'px';
			iDiv.style.backgroundImage = 'url('+ this.image.uri +')';

			puzzleContainer.appendChild(iDiv);
			iDiv.appendChild(iSpan);
		});
	}

	//Method to create Puzzle Container div
	createPuzzleContainer(size){
		const puzzle = this.puzzle;
		puzzle.style.position = 'relative';
		puzzle.style.width = size;
		puzzle.style.height = size;
		puzzle.style.backgroundColor = '#445';
		puzzle.style.margin = '20px 0px';
		return puzzle;
	}

	//Method to create Solve button
	createSolveButton(){
		const generalContainer = document.getElementById(this.id);
		const button = document.createElement('button');
		button.textContent = 'Solve puzzle';
		button.className = 'solveButton';
		generalContainer.appendChild(button);
		this.trackSolveButtonClick();
	}

	//Method to create Qty moves tracker
	createQtyMoves(){
		const generalContainer = document.getElementById(this.id);
		const moveTracker = document.createElement('div');
		moveTracker.textContent = 'Moves: ' + this.moveTracker;
		moveTracker.className = 'moveTracker';
		moveTracker.setAttribute('data-move-tracker', this.moveTracker);
		generalContainer.appendChild(moveTracker);
	}

	//Method to create puzzle
	createPuzzle(){
		const size = this.image.size;
		const puzzleContainer = this.createPuzzleContainer(size);
		this.createBackground(size, puzzleContainer);
		this.createPieces(puzzleContainer);
		this.trackGameClicks();
		this.createQtyMoves();	
	}

	//Method to try move
	tryMove(e) {
		const leftPosition = e.target.offsetLeft;
		const topPosition = e.target.offsetTop;
		this.checkIfCanMove(e, leftPosition, topPosition);
		this.checkIfWin();
	}

	//Method to check if can move
	checkIfCanMove(e, leftPosition, topPosition){
		const p1 = leftPosition + this.block.size;
		const p2 = leftPosition - this.block.size;
		const p3 = topPosition + this.block.size;
		const p4 = topPosition - this.block.size;
	
		if(p4 === this.emptyPosition.top && leftPosition === this.emptyPosition.left 
		|| p3 === this.emptyPosition.top && leftPosition === this.emptyPosition.left
		|| p2 === this.emptyPosition.left && topPosition === this.emptyPosition.top
		|| p1 === this.emptyPosition.left && topPosition === this.emptyPosition.top
		){
			this.move(e, leftPosition, topPosition);
		}
	}

	//Method to call move pieces and increment move qty
	move(e, leftPosition, topPosition){
		this.movePiecePosition(e, leftPosition, topPosition);
		this.incrementMoveQty();
	}

	//Method to move pieces
	movePiecePosition(e, leftPosition, topPosition){
		e.target.style.left = this.emptyPosition.left;
		e.target.style.top = this.emptyPosition.top;
		this.emptyPosition.left = leftPosition;
		this.emptyPosition.top = topPosition;
	}

	//Method to get moves qty
	getQtymoves(){
		const generalContainer = document.getElementById(this.id);
		const moveTracker = generalContainer.getElementsByClassName('moveTracker');
		return moveTracker;
	}

	//Method to increment move qty
	incrementMoveQty(){
		const moveTracker = this.getQtymoves();
		const newQty = parseInt(moveTracker[0].getAttribute('data-move-tracker')) + 1;
		moveTracker[0].setAttribute('data-move-tracker', newQty);
		moveTracker[0].textContent = 'Moves: ' + newQty;
	}

	//Method to get pieces
	getPieces(){
		const puzzle = this.puzzle;
		const puzzlePieces = puzzle.getElementsByClassName("piece");
		return puzzlePieces;
	}

	//Method to track solve button click
	trackSolveButtonClick(){
		const button = this.getSolveButton();
		button[0].addEventListener('click', this.solve.bind(this));
	}

	//Method to get solve button click
	getSolveButton(){
		const generalContainer = document.getElementById(this.id);
		const button = generalContainer.getElementsByClassName('solveButton');
		return button;
	}

	//Method to track game clicks in puzzle
	trackGameClicks(){
		const puzzlePieces = this.getPieces();
		for (var i = 0; i < puzzlePieces.length; i++) {
			puzzlePieces[i].addEventListener('click', this.tryMove.bind(this));
		}
	}

	//Method to check if win
	checkIfWin(){
		const puzzle = this.puzzle;
		const puzzlePieces = this.getPieces();
		setTimeout(function () {
			for (let i = 0; i < puzzlePieces.length; i++) {
				if(puzzlePieces[i].offsetTop !== parseInt(puzzlePieces[i].getAttribute('data-correct-order-top'))
				|| puzzlePieces[i].offsetLeft !== parseInt(puzzlePieces[i].getAttribute('data-correct-order-left'))
				){
					return;
				}
			}
			puzzle.classList.add("donePuzzle");
			alert('WIN');
		}, 500);
	}

	//Method to solve puzzle automatically
	solve(){
		const puzzle = this.puzzle;
		const puzzlePieces = this.getPieces();
		for (let i = 0; i < puzzlePieces.length; i++) {
			puzzlePieces[i].style.top = parseInt(puzzlePieces[i].getAttribute('data-correct-order-top'));
			puzzlePieces[i].style.left = parseInt(puzzlePieces[i].getAttribute('data-correct-order-left'));
		}	
		puzzle.classList.add("donePuzzle");
		alert('WIN');
	}

	//Helper method to mix positions
	shuffle(positions) {
		let currentIndex = positions.length, temporaryValue, randomIndex;
		while (0 !== currentIndex) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
	
			temporaryValue = positions[currentIndex];
			positions[currentIndex] = positions[randomIndex];
			positions[randomIndex] = temporaryValue;
		}
		return positions;
	}

	//Helper method to create random number
	randomNumber(min, max){
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min;
	}

	//Helper method to get math square
	square(size){
		return size * size;
	}

	//Method to init game
	init(){
		this.createPuzzle();
		this.checkIfWin();
	
		if(this.solveButton)
			this.createSolveButton();

	}
}
