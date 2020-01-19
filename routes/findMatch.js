//@ts-check
var express = require("express");
var router = express.Router();

var http = require("http");
var websocket = require("ws");

var port = process.argv[3];
var app = express();

var messages = require("../public/javascripts/messages");

app.get("/Connect4FindMatch", function(req, res){

    res.render('Connect4FindMatch', { title: 'Find Match' });
    

});

var server = http.createServer(app);

const wss = new websocket.Server({server});

//keeps track of active games
var numberOfGames = 0;
var games = {};    

//the game that isn't filled at this moment
var currentGame = new Game(numberOfGames);
var connectionID = 0;

wss.on("connection", function(ws){

    //con.id = connectionID++;
    currentGame.addPlayer(ws);

    if(currentGame.isFull() == true){
        
        var ws1 = currentGame.getWS1();
        var ws2 = currentGame.getWS2();

        var object = messages.O_GAME_STARTED;
        object["gameID"] = currentGame.getID;
        var messageGame = JSON.stringify(object);

        ws1.send(messageGame);
        ws2.send(messageGame);

        ws1.send(JSON.stringify(messages.O_YOUR_TURN));
        
        ++numberOfGames;
        currentGame = new Game(numberOfGames);
        
    };

    games[numberOfGames] = currentGame;
   //console.log(games);
    
    ws.on("message", function incoming(message){

        console.log(message);
        var object = JSON.parse(message);
        console.log(object);

        if(object["type"] === "POSSIBLE_MOVE"){

            var nr = object["nr"];
            var col = object["col"];
            var row = dropPiece(object["col"], object["nr"]);

            if(row == null){

                ws.send(JSON.stringify(messages.O_INVALID_MOVE));

            }else{
                
                var gameID = object["gameID"];
                var game = games[gameID];
                var counter = game.getCounter;

                if((counter-1)%2 == 0){
                
                    grid[nr][row] = "y";
                }

                if((counter-1)%2 == 1){
                   
                   grid[nr][row] = "r";
                }

                var check = check(counter, gameID);

                if(check === "DRAW"){

                    ws1 = game.getWS1;
                    ws2 = game.getWS2;

                    ws1.send(messages.S_DRAW);
                    ws2.send(messages.S_DRAW);

                }else if(check === "CONTINUE"){
                    
                    var valid = messages.O_VALID_MOVE;
                    valid["col"] = col;
                    valid["row"] = row;
                    
                    ws1.send(JSON.stringify(valid));
                    ws2.send(JSON.stringify(valid));
                    
                    
                    if((counter-1)%2 == 0){
                        
                        ws1.send(JSON.stringify(messages.O_YOUR_TURN))

                    }
    
                    if((counter-1)%2 == 1){
                       
                        ws2.send(JSON.stringify(messages.O_YOUR_TURN))

                    }

                }else{


                }

            }


        }

        

    });
    
    //ws.close();


});

server.listen(port);

function Game(id){
    
    this.id = id;
    this.player1 = null;
    this.player2 = null;
    this.scorePlayer1 = 0;
    this.scorePlayer2 = 0;
    this.counter = 0;
    
    this.board = [["x", "x", "x", "x", "x", "x"], 
    ["x", "x", "x", "x", "x", "x"], 
    ["x", "x", "x", "x", "x", "x"], 
    ["x", "x", "x", "x", "x", "x"], 
    ["x", "x", "x", "x", "x", "x"], 
    ["x", "x", "x", "x", "x", "x"], 
    ["x", "x", "x", "x", "x", "x"]];
    
    this.addPlayer = function(socket){if(this.player1 == null && this.player2 == null){
       
        this.player1 = socket;
        return true;

    }else if(this.player1 != null && this.player2 == null){
       
        this.player2 = socket;
        return true;

    }else {
        
        return false;

    }}

    this.isFull = function(){
        if(this.player1 != null && this.player2 != null){ 
            return true
        }
        else{
            return false
        }
    }

    this.getWS1 = function(){return this.player1};
    this.getWS2 = function(){return this.player2};
    
    this.getID = function(){ return this.id; };
    this.setID = function(id){ this.id = id; };
    this.getPlayer1Score = function(){ return this.scorePlayer1;};
    this.getPlayer2Score = function(){ return this.scorePlayer2;};
    this.incrPlayer1Score = function(){ this.scorePlayer1++;};
    this.incrPlayer2Score = function(){ this.scorePlayer2++;};

    this.dropPiece = function(x, y, piece){ this.board[x][y] = piece};
    this.getPiece = function(x, y){return this.board[x][y]};

    this.ressetCounter = function(){this.counter = 0};
    this.getCounter =  function(){return this.counter};
    this.incrCounter = function(){this.counter++};
    
}

module.exports = router;

function dropPiece(col, nr){
    
    var rows = 5;
    
    var flag = true;
    var number = 0;

    for(var i = rows; i >= 0; i--){
        
        if(grid[nr][i].localeCompare("x") == 0){
        
            number = i;
            flag = false;          
            break;

       } 
    }
    if(flag){
       alert("Invalid move. Try again.");
       return null;
    }

    return number;
   
};

    
function check(counter, gameID){

    if(counter < 7){

        return "CONTINUE";
    }

    if(counter == 42){
        return "DRAW";
    }

    //vertical check
    for(var i = 0; i < grid.length; i++){
        var yInCol = 0;
        var rInCol = 0;
        for(var j = 0; j < grid[i].length; j++){
            if(grid[i][j].localeCompare("y") == 0){
                yInCol++;
                rInCol = 0;
            }
            else if(grid[i][j].localeCompare("r") == 0){
                rInCol++;
                yInCol = 0;
            }
            else{
                rInCol = 0;
                yInCol = 0;
            }
            if(yInCol > 3){
                
                return games[gameID].getWS1;
            }
            if(rInCol > 3){
                
                return games[gameID].getWS2;
            }
            
        }    
        
    }
    // horizontal check

    // grid[x][y]
    // x = select column
    // y = select row

    for(var i = 0; i < grid[0].length; i++){
        var rInRow = 0;
        var yInRow = 0;
        for(var j = 0; j < grid.length; j++){
            if(grid[j][i].localeCompare("y") == 0){
                yInRow++;
                rInRow = 0;
            }
            if(grid[j][i].localeCompare("r") == 0){
                rInRow++;
                yInRow = 0;
            }
            if(grid[j][i].localeCompare("x") == 0){
                rInRow = 0;
                yInRow = 0;
            }
    
            if(yInRow > 3){
                
                return games[gameID].getWS1;

            }
            
            if(rInRow > 3){
               
                return games[gameID].getWS2;
        
            }
        }
    }

    // diagonal check
    
    for(var k = 0; k < 3; k++){
    for(var i = 0; i < 4; i++){
        yInDia = 0;
        rInDia = 0;
        for(var j = 0; j < 4; j++){
            if(grid[j+i][j+k].localeCompare("y") == 0){
                yInDia++;
                //rInDia = 0;
            }
            if(grid[j+i][j+k].localeCompare("r") == 0){
                rInDia++;
                
                //yInDia = 0;
            }  
            if(yInDia > 3){
                
                return games[gameID].getWS1;

            }
            
            if(rInDia > 3){
              
                return games[gameID].getWS2;

            }
        }
    }
    
    }
    for(var k = 0; k < 3; k++){
        for(var i = 0; i < 4; i++){
            yInDia = 0;
            rInDia = 0;
            for(var j = 0; j < 4; j++){
                if(grid[j+i][5-j-k].localeCompare("y") == 0){
                    yInDia++;
                    //rInDia = 0;
                }
                if(grid[j+i][5-j-k].localeCompare("r") == 0){
                    rInDia++;
                    
                    //yInDia = 0;
                }  
                if(yInDia > 3){
                    
                    return games[gameID].getWS1;

                }
                
                if(rInDia > 3){
                   
                    return games[gameID].getWS2;
 
                }
            }
       }   
    }
}
    

/*function exit(){

    player1.addToTotal(game.getPlayer1Score);
    player2.addToTotal(game.getPlayer2Score);

}
*/

