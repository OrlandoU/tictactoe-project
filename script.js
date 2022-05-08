
const match = (()=>{
    let _mode;
    const setMatch = (event)=>{
        if(_mode == 'PvP'){
            if(gameboard.addNewMove(players[_getTurn()],event.target.dataset.positionx,event.target.dataset.positiony,event)){
                _updateTurn()
            }
        }
        else if(_mode == 'PvE'){
            if(gameboard.addNewMove(player1,event.target.dataset.positionx,event.target.dataset.positiony,event)){
                setTimeout(ai.aiTurn,300)
            }
        }
    }

    const setMode =(newMode='Pvp')=>{
        _mode = newMode;
        gameboard.clearBoard()
        displayController.updateBoard()
    }

    //Keep track of match's turn
    let _turn = 0;
    const _getTurn = ()=> _turn;
    const _updateTurn =()=>{
        _turn = _turn == 0 ? 1 : 0;//turn
        return _turn
    }


    const updatePlayers =()=>{

    }
    return {setMode,setMatch,updatePlayers, _getTurn}
})()

const boardSpots = document.querySelectorAll('.board-position')
boardSpots.forEach(spot=>{
    spot.addEventListener('click', match.setMatch)
})

const ai = (()=>{
    let playerName = "CPU";
    const getName =()=> playerName;

    const aiTurn =()=>{
        //Random New Position
        let _randomNum =()=> Math.floor(Math.random()*3);
        //Check if that position is available and register it
        while(true){
            if(gameboard.addNewMove(ai,_randomNum(),_randomNum())){
                break
            }
        }
    }
    //sets sign and return it on getSign()
    let _sign = 'O';
    let getSign = () => _sign;

    let winStreak = 0;

    //Updates winStreak counter
    const registerWin = () => winStreak++;
    
    //Restarts winStreak 
    const restartStreak = ()=>winStreak = 0;
    
    return {getSign,registerWin,restartStreak,getName,aiTurn}
})()

//Gameboard Module with IIFE
const gameboard = (()=>{
    let _board = [['','',''],['','',''],['','','']];

    //Add new move on board
    const addNewMove = (player,row,column,event) =>{
        //Check if Available Spaces
        if (checkTie()) {
            console.log('TIE')
            clearBoard()
            displayController.updateBoard()
            return false
        }

        //Check if this position is available
        if(_board[row][column]){
            return false
        }
        //Save move
        _board[row][column] = player.getSign();
        displayController.animateMove(player.getSign(),event)
        // displayController.updateBoard()

        //Check if this player has met winning condition
        if(_checkEndGame(player)){
            return false
        }
        return true
    }

    const getSignOnPosition =(x,y)=>{
        return _board[x][y]
    }

    const checkTie=()=>{
        for(let i = 0;i < 3;i++){
            for(let j = 0;j<3;j++){
                if(!_board[i][j]) return false
            }
        }
        return true
    }

    //Checks whether the player that made the move has met the winning condition
    const _checkEndGame = (player)=>{
        
        //Diagonal and Opposite Winning Condition
        if((_board[0][0] == player.getSign()) && (_board[1][1] == player.getSign()) && (_board[2][2] == player.getSign())){
            console.log(player.getName())

            displayController.animateWin(match._getTurn(),player)
            clearBoard()
            return true
        }
        else if((_board[0][2] == player.getSign()) && (_board[1][1] == player.getSign()) && (_board[2][0] == player.getSign())){
            console.log(player.getName())

            displayController.animateWin(match._getTurn(),player)
            clearBoard()
            return true
        }
        //Horizontal or Vertical winning condition
        for(let i = 0; i < 3;i++){
            if((_board[i][0] == player.getSign()) && (_board[i][1] == player.getSign()) && (_board[i][2] == player.getSign())){
                console.log(player.getName())

                displayController.animateWin(match._getTurn(),player)
                clearBoard()
                return true
            }
            else if((_board[0][i] == player.getSign()) && (_board[1][i] == player.getSign()) && (_board[2][i] == player.getSign())){
                console.log(player.getName())

                displayController.animateWin(match._getTurn(),player)
                clearBoard()
                return true
            }
        }
    }

    const clearBoard = ()=>{
        _board = [['','',''],['','',''],['','','']];
        setInterval(()=>displayController.updateBoard(),1000)
    };
    
    const log =()=>{
        console.log(_board[0])
        console.log(_board[1])
        console.log(_board[2])
    }

    return {addNewMove,log,clearBoard,getSignOnPosition,checkTie}
})()

const displayController = (() =>{
    const updateBoard =()=>{
        boardSpots.forEach(spot=>{
            spot.textContent = gameboard.getSignOnPosition(spot.dataset.positionx,spot.dataset.positiony)
        })
    }

    const animateMove = (sign,event) => {
        let tile = document.createElement('div')
        tile.textContent = sign
        tile.classList.add('animate')

        console.log(event.target)
        event.target.appendChild(tile)

        let audio = new Audio('./assets/p1.mp3')
        audio.play()
    }

    const animateWin = (turn,player) => {
        const counter = document.querySelector(`.turn${turn}>.counter`)
        counter.textContent = player.registerWin()
    }
    return {updateBoard, animateMove, animateWin}
})();

//Factory function for players
function Player(name,tag){
    let playerName = name;
    const getName =()=> playerName;

    //sets sign and return it on getSign()
    let _sign = tag;
    let getSign = () => _sign;

    let _winCounter = 0;

    //Updates winStreak counter
    const registerWin = () => ++_winCounter;
        
    return {getSign,registerWin,getName}
}

let player1 = Player('Orlando','X')
let player2 = Player('Gabriel','O')
const players = [player1,player2]

gameboard.log() 
//TODO naming and winning event
displayController.updateBoard()
