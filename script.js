

const match = (() => {
    let _mode;
    const playRound = (event) => {
        if (_mode == 'pvp') {
            if (gameboard.addNewMove(players[getTurn()], event.target.dataset.positionx, event.target.dataset.positiony, event)) {
                _updateTurn()
                displayController.animateTurn()

            }
        }
        else if (_mode == 'pve') {
            if (gameboard.addNewMove(players[0], event.target.dataset.positionx, event.target.dataset.positiony, event)) {
                _updateTurn()
                displayController.animateTurn()

                setTimeout(() => {
                    players[1].aiTurn(players[1])
                }, 300)
                setTimeout(() => {
                    _updateTurn()
                    displayController.animateTurn()
                }, 300)
            }
            
        }
        else if (_mode == 'evp') {
        
            if (gameboard.addNewMove(players[1], event.target.dataset.positionx, event.target.dataset.positiony, event)) {
                _updateTurn()
                displayController.animateTurn()

                setTimeout(() => {
                    players[0].aiTurn(players[0])
                }, 300)
                setTimeout(()=>{
                    _updateTurn()
                    displayController.animateTurn()
                },300)
            }
            else{
                _turn = 1;
                displayController.animateTurn()
            }
        }
        else{
            setInterval(()=>{
                setTimeout(() => {
                    players[0].aiTurn(players[0])
                }, 300)
                setTimeout(()=>{
                    _updateTurn()
                    displayController.animateTurn()
                },300)

                setTimeout(() => {
                    players[1].aiTurn(players[1])
                }, 600)
                setTimeout(()=>{
                    _updateTurn()
                    displayController.animateTurn()
                },600)
            },1000)
        }
    }

    const setMode = (p1, p2) => {
        if (p1 == 'player' && p2 == 'player') {
            _mode = 'pvp'
        }
        else if (p1 == 'player' && p2 == 'cpu') {
            _mode = 'pve'
        }
        else if (p1 == 'cpu' && p2 == 'player') {
            _mode = 'evp'
            setTimeout(() => {
                players[0].aiTurn(players[0])
            }, 2000)
            setTimeout(() => {
                _updateTurn()
                displayController.animateTurn()
            }, 2000)
        }
        else {
            _mode = 'eve'
            playRound()
        }
        gameboard.clearBoard()
        displayController.animateTurn()
        displayController.updateBoard()
    }

    //Keep track of match's turn
    let _turn = 0;
    const getTurn = () => {
        return _turn;
    };
    const _updateTurn = () => {
        _turn = _turn == 0 ? 1 : 0;//turn
        return _turn
    }
    const restartTurn = () => {
        _turn = 0;
    }

    let players = []

    const savePlayers = (formPlayers) => {
        console.log(formPlayers)

        let player1, player2;

        if (formPlayers['player1-type'] == 'player') {
            //Saving player 1 name and sign and updating displayed names
            if (!formPlayers['player1Name']) {
                player1 = Player('Player 1', 'X')
            }
            else {
                player1 = Player(formPlayers['player1Name'], 'X')
                displayController.updateNames(formPlayers['player1Name'], 1)
            }
            players.push(player1)
        }
        else if (formPlayers['player1-type'] == 'cpu') {
            players.push(ai('X'))
            displayController.updateNames('CPU', 1)
        }

        if (formPlayers['player2-type'] == 'player') {
            //Saving player 2 name and sign and updating displayed names
            if (!formPlayers['player2Name']) {
                player2 = Player('Player 2', '0')
            }
            else {
                player2 = Player(formPlayers['player2Name'], '0')
                displayController.updateNames(formPlayers['player2Name'], 2)
            }
            players.push(player2)
        }
        else if (formPlayers['player2-type'] == 'cpu') {
            players.push(ai('O'))
            displayController.updateNames('CPU', 2)
        }


        setMode(formPlayers['player1-type'], formPlayers['player2-type'])
    }
    return { setMode, playRound, savePlayers, getTurn, restartTurn, _updateTurn }
})()

const boardSpots = document.querySelectorAll('.board-position')
boardSpots.forEach(spot => {
    spot.addEventListener('click', match.playRound)
})

const ai = (sign) => {
    let playerName = "CPU";
    const getName = () => playerName;

    const aiTurn = (ai) => {
        //Random New Position
        let _randomNum = () => Math.floor(Math.random() * 3);
        //Check if that position is available and register it
        while (true) {
            if (gameboard.addNewMove(ai, _randomNum(), _randomNum())) {
                return
            }
        }
    }

    //sets sign and return it on getSign()
    let _sign = sign;
    let getSign = () => _sign;

    let winCounter = 0;

    //Updates winCounter counter
    const registerWin = () => ++winCounter;


    return { getSign, registerWin, getName, aiTurn }
}

//Gameboard Module with IIFE
const gameboard = (() => {
    let _board = [['', '', ''], ['', '', ''], ['', '', '']];

    //Add new move on board
    const addNewMove = (player, row, column, event) => {
        
        //Check if Available Spaces
        if (checkTie()) {
            console.log('TIE')
            clearBoard()
            match.restartTurn()
            displayController.animateTurn()
            displayController.updateBoard()
            return false
        }

        //Check if this position is available
        if (_board[row][column]) {
            return false
        }
        //Save move
        _board[row][column] = player.getSign();
        displayController.animateMove(player.getSign(), row, column)
        // displayController.updateBoard()


        //Check if this player has met winning condition
        if (_checkEndGame(player)) {
            return false
        }
        if (checkTie()) {
            console.log('TIE')
            window.alert("It's a TIE!!")
            clearBoard()
            match.restartTurn()
            displayController.animateTurn()
            displayController.updateBoard()
            return false
        }
        else {
            return true
        }
    }

    const getSignOnPosition = (x, y) => {
        return _board[x][y]
    }
    //Returns false if available space
    const checkTie = () => {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (!_board[i][j]) {
                    return false
                }
            }
        }
        return true
    }

    //Checks whether the player that made the move has met the winning condition
    const _checkEndGame = (player) => {

        //Diagonal and Opposite Winning Condition
        if ((_board[0][0] == player.getSign()) && (_board[1][1] == player.getSign()) && (_board[2][2] == player.getSign())) {
            displayController.animateWin(match.getTurn(), player)
            clearBoard()
            displayController.updateBoard()
            match.restartTurn()
            displayController.animateTurn()
            return true
        }
        else if ((_board[0][2] == player.getSign()) && (_board[1][1] == player.getSign()) && (_board[2][0] == player.getSign())) {

            displayController.animateWin(match.getTurn(), player)
            clearBoard()
            displayController.updateBoard()
            match.restartTurn()
            displayController.animateTurn()
            return true
        }
        //Horizontal or Vertical winning condition
        for (let i = 0; i < 3; i++) {
            if ((_board[i][0] == player.getSign()) && (_board[i][1] == player.getSign()) && (_board[i][2] == player.getSign())) {

                displayController.animateWin(match.getTurn(), player)
                clearBoard()
                displayController.updateBoard()
                match.restartTurn()
                displayController.animateTurn()
                return true

            }
            else if ((_board[0][i] == player.getSign()) && (_board[1][i] == player.getSign()) && (_board[2][i] == player.getSign())) {


                displayController.animateWin(match.getTurn(), player)
                clearBoard()
                displayController.updateBoard()
                match.restartTurn()
                displayController.animateTurn()
                return true

            }
        }
    }

    const clearBoard = () => {
        _board = [['', '', ''], ['', '', ''], ['', '', '']];
        setTimeout(() => displayController.updateBoard(), 1000)
    };

    const log = () => {
        console.log(_board[0])
        console.log(_board[1])
        console.log(_board[2])
    }

    return { addNewMove, log, clearBoard, getSignOnPosition, checkTie }
})()

const displayController = (() => {
    const updateBoard = () => {
        boardSpots.forEach(spot => {
            spot.textContent = gameboard.getSignOnPosition(spot.dataset.positionx, spot.dataset.positiony)
        })
    }
    const animateTurn = () => {
        let players = document.querySelectorAll('.player')
        players.forEach(player => player.classList.remove('active-turn'))

        document.querySelector(`.turn${match.getTurn()}`).classList.add('active-turn')
    }
    const animateMove = (sign, row, column) => {
        let tile = document.createElement('div')
        tile.textContent = sign
        tile.classList.add('animate')

        document.querySelector(`[data-positionx='${row}'][data-positiony='${column}']`).appendChild(tile)


        if (match.getTurn() == 0) {
            let audio = new Audio('./assets/p1.mp3')
            audio.play()
        }
        else {
            let audio = new Audio('./assets/p2.wav')
        }

    }

    const animateWin = (turn, player) => {
        const counter = document.querySelector(`.turn${turn}>.counter`)
        counter.textContent = player.registerWin()

        counter.parentNode.classList.add('win-round')
        setTimeout(() => counter.parentNode.classList.remove('win-round'), 1000)
    }
    const updateNames = (name, position) => {
        document.querySelector(`.tag${position}`).textContent = name;
    }

    const _renderGame = (name1, name2) => {
        document.querySelector('.main-container').classList.toggle('renderGame')
        document.querySelector('.selection-menu').classList.toggle('renderMenu')
    }

    const renderMenu = () => {
        //Select Menu
        document.querySelector('#right-side-player').addEventListener('click', () => {
            document.querySelector('.right-side-text').disabled = false;
            document.querySelector('.right-side-text').placeholder = 'Player';
        })
        document.querySelector('#left-side-player').addEventListener('click', () => {
            document.querySelector('.left-side-text').disabled = false;
            document.querySelector('.left-side-text').placeholder = 'Player';
        })


        //Select Menu
        document.querySelector('#left-side-cpu').addEventListener('click', (event) => {
            document.querySelector('.left-side-text').disabled = true;
            document.querySelector('.left-side-text').value = '';
            document.querySelector('.left-side-text').placeholder = 'CPU';


        })
        document.querySelector('#right-side-cpu').addEventListener('click', (event) => {
            document.querySelector('.right-side-text').disabled = true;
            document.querySelector('.right-side-text').placeholder = 'CPU';
            document.querySelector('.right-side-text').value = '';
        })

        document.querySelector('.btnR').addEventListener('click', _renderGame)
        const form = document.querySelector('#form')
        form.addEventListener('submit', (event) => {
            event.preventDefault()
            _renderGame()
            let data = Object.fromEntries(new FormData(event.target).entries());
            match.savePlayers(data)

        })

    }

    return { updateBoard, animateMove, animateWin, animateTurn, renderMenu, updateNames }
})();

//Factory function for players
function Player(name, tag) {
    let playerName = name;
    const getName = () => playerName;

    //sets sign and return it on getSign()
    let _sign = tag;
    let getSign = () => _sign;

    let _winCounter = 0;

    //Updates winStreak counter
    const registerWin = () => ++_winCounter;

    return { getSign, registerWin, getName }
}




gameboard.log()
displayController.renderMenu()
//TODO naming and winning event


