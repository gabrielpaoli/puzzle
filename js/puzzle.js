class Puzzle{
	id;
	block;
	board;
	image;
	emptyPosition;

	constructor(id, boardSize){
		this.id = id;
		this.loadImage().then(image => {
			this.image = {size: image.size, uri: image.uri};
			this.block = {size: Math.round(this.image.size / boardSize), qty: this.square(boardSize)}
			this.board = this.getBoard(boardSize, this.image);
		});
	}

	async loadImage(){
		const puzzle = document.getElementById(this.id);
		const img = puzzle.querySelector(".puzzleImg");
		const width = img.clientWidth;
		const uri = img.src;
		return {uri: uri,size: width};
	}

	getBlockPositions(image, blockSize){
		let blockPositions = [];
		let i = 0;
		while (i < image.size) {
			blockPositions.push(i);
			i = blockSize + i;
		}	
		return blockPositions;
	}

	getBoard(size, image){
		const pieces = this.organizePieces(size, image);
		const structure = this.disociateImages(pieces.positions, pieces.structure);
		return structure;
	}

	getEmptyPosition(order, randomEmpty){
		let empty = false;
		if(order === randomEmpty){
			this.emptyPosition = {order:order};
			empty = true;
		}
		return empty;
	}

	organizePieces(size, image){
		const randomEmpty = this.randomNumber(0, this.block.qty);
		let blockSize = this.block.size;
		let blockPositions = this.getBlockPositions(image, blockSize);
		let positions = [];
		let structure = [];
		let order = 0;

		for (let i = 0; i < size; i++) {
			for (let y = 0; y < size; y++) {
				positions.push({top:blockPositions[i], left:blockPositions[y], order: order});
				structure.push({
					top:blockPositions[i], 
					left:blockPositions[y], 
					size: blockSize,
					empty: this.getEmptyPosition(order, randomEmpty)
				});
				order++;
			}
		}		
		return {positions: positions, structure: structure}
	}

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

	createBackground(size, container){
		const backgroundTransparentDiv = document.createElement('div');
		backgroundTransparentDiv.style.backgroundImage = 'url('+ this.image.uri +')';
		backgroundTransparentDiv.style.width = size;
		backgroundTransparentDiv.style.height = size;
		backgroundTransparentDiv.style.opacity = '0.2';
		container.appendChild(backgroundTransparentDiv);
	}

	createPieces(container){
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

			container.appendChild(iDiv);
			iDiv.appendChild(iSpan);
		});
	}

	createContainer(sizeFixed	){
		const container = document.getElementById(this.id);
		container.style.position = 'relative';
		container.style.width = sizeFixed;
		container.style.height = sizeFixed;
		container.style.backgroundColor = '#445';
		container.style.margin = '20px';
		return container;
	}

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

	randomNumber(min, max){
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min;
	}

	square(size){
		return size * size;
	}

	tryMove(e) {
		const leftPosition = e.target.offsetLeft;
		const topPosition = e.target.offsetTop;
		this.checkIfCanMove(e, leftPosition, topPosition);
		this.checkIfWin();
	}

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

	move(e, leftPosition, topPosition){
		e.target.style.left = this.emptyPosition.left;
		e.target.style.top = this.emptyPosition.top;
		this.emptyPosition.left = leftPosition;
		this.emptyPosition.top = topPosition;
	}

	getPieces(){
		const puzzle = document.getElementById(this.id);
		const puzzlePieces = puzzle.getElementsByClassName("piece");
		return puzzlePieces;
	}

	createPuzzle(){
		const sizeFixed = this.image.size + 2;
		const container = this.createContainer(sizeFixed);
		this.createBackground(sizeFixed, container);
		this.createPieces(container);
	}

	trackGameClicks(){
		const puzzlePieces = this.getPieces();
		for (var i = 0; i < puzzlePieces.length; i++) {
			puzzlePieces[i].addEventListener('click', this.tryMove.bind(this));
		}
	}

	checkIfWin(){
		const puzzle = document.getElementById(this.id);
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

	async init(){
		this.loadImage().then(() => {
			this.createPuzzle();
			this.trackGameClicks();
			this.checkIfWin();
		});
	}
}
