class Puzzle{
	id;
	pieceBlock;
	imageSize;
	blockStructure;
	blocksQty;
	emptyPosition;

	constructor(id, boardSize, imageSize){
		this.id = id;
		let size = imageSize / boardSize;
		this.pieceBlock =  Math.round(size);
		this.imageSize = imageSize;
		this.blocksQty = this.sizeQube(boardSize);
		this.blockStructure = this.getBlockStructure(boardSize, imageSize);
	}

	getBlockStructure(size, imageSize){
		let blockStructure = [];
		let fBlockStructure = [];
		let positions = [];
		let i = 0;
		let y = 0;
		let order = 0;
		let pieceBlock = this.pieceBlock;
		let randomEmpty = this.getRandomInt(0, this.blocksQty);
		let empty;

		while (i < imageSize) {
			blockStructure.push(i);
			i = pieceBlock + i;
		}
		
		for (i = 0; i < size; i++) {
			for (y = 0; y < size; y++) {
				empty = false;
				if(order === randomEmpty){
					empty = true;
					this.emptyPosition = {order:order};
				}

				positions.push({top:blockStructure[i], left:blockStructure[y], order: order});
				fBlockStructure.push({
					top:blockStructure[i], 
					left:blockStructure[y], 
					size: pieceBlock,
					empty: empty,
					topBackground: 0,
					leftBackground: 0
				});
				order++;
			}
		}

		this.shuffle(positions).forEach((element, s) => {
			fBlockStructure[s].topBackground = element.top;
			fBlockStructure[s].leftBackground = element.left;
			fBlockStructure[s].order = element.order;
			if(fBlockStructure[s].empty){
				this.emptyPosition.top = fBlockStructure[s].top;
				this.emptyPosition.left = fBlockStructure[s].left; 
			}
		});

		return fBlockStructure;
	}

	createBackground(size, container){
		let backgroundTransparentDiv = document.createElement('div');
		backgroundTransparentDiv.style.backgroundImage = 'url("images/monks.jpg")';
		backgroundTransparentDiv.style.width = size;
		backgroundTransparentDiv.style.height = size;
		backgroundTransparentDiv.style.opacity = '0.2';
		container.appendChild(backgroundTransparentDiv);
	}

	createMiniBlocks(container){
		this.blockStructure.forEach((element, i) => {
			if(!element.empty){
				let iDiv = document.createElement('div');
				let iSpan = document.createElement('span');
				iSpan.textContent = element.order;

				iDiv.className = 'puzzle piece'+i;
				iDiv.style.width = element.size; 
				iDiv.style.height = element.size; 
				iDiv.style.top = element.top; 
				iDiv.style.left = element.left; 
				iDiv.setAttribute('data-correct-order-top', element.topBackground);
				iDiv.setAttribute('data-correct-order-left', element.leftBackground);
				iDiv.style.backgroundPositionY = '-' + element.topBackground + 'px';
				iDiv.style.backgroundPositionX = '-' + element.leftBackground + 'px';
				container.appendChild(iDiv);
				iDiv.appendChild(iSpan);
			}
		});
	}

	createPuzzleBlock(){
		let container = document.getElementById(this.id);
		let sizeFixed = this.imageSize + 2;
		container.style.position = 'relative';
		container.style.width = sizeFixed;
		container.style.height = sizeFixed;
		container.style.backgroundColor = '#445';

		this.createBackground(sizeFixed, container);
		this.createMiniBlocks(container);
	}

	shuffle(array) {
		var currentIndex = array.length, temporaryValue, randomIndex;
		while (0 !== currentIndex) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
	
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		return array;
	}

	getRandomInt(min, max){
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min;
	}

	sizeQube(size){
		return size * size;
	}

	move(e) {
		let leftPosition = e.target.offsetLeft;
		let topPosition = e.target.offsetTop;
		this.canMove(e, leftPosition, topPosition);
		this.win();
	}

	win(){
		setTimeout(function () {
			let puzzle = document.getElementById(this.id);
			let puzzlePiece = puzzle.getElementsByClassName("puzzle");

			for (var i = 0; i < puzzlePiece.length; i++) {
				if(puzzlePiece[i].offsetTop !== parseInt(puzzlePiece[i].getAttribute('data-correct-order-top'))
				|| puzzlePiece[i].offsetLeft !== parseInt(puzzlePiece[i].getAttribute('data-correct-order-left'))
				){
					return false;
				}
			}

			alert('WIN');
		}, 500);

	}

	canMove(e, leftPosition, topPosition){
		let p1 = leftPosition + this.pieceBlock;
		let p2 = leftPosition - this.pieceBlock;
		let p3 = topPosition + this.pieceBlock;
		let p4 = topPosition - this.pieceBlock;
	
		if(p4 === this.emptyPosition.top && leftPosition === this.emptyPosition.left 
		|| p3 === this.emptyPosition.top && leftPosition === this.emptyPosition.left
		|| p2 === this.emptyPosition.left && topPosition === this.emptyPosition.top
		|| p1 === this.emptyPosition.left && topPosition === this.emptyPosition.top
		){
			e.target.style.left = this.emptyPosition.left;
			e.target.style.top = this.emptyPosition.top;
			this.emptyPosition.left = leftPosition;
			this.emptyPosition.top = topPosition;
		}
	}

	create(){
		this.createPuzzleBlock();
		let puzzle = document.getElementById(this.id);
		let puzzlePiece = puzzle.getElementsByClassName("puzzle");
		for (var i = 0; i < puzzlePiece.length; i++) {
			puzzlePiece[i].addEventListener('click', this.move.bind(this));
		}
		this.win();
	}

}

var id = 'containerPuzzle';
var boardSize = 3;
var imageSize = 500;
let puzzle = new Puzzle(id, boardSize, imageSize);

puzzle.create();
