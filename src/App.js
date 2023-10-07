import React from 'react';
import "bootstrap/dist/css/bootstrap.css";
import Row from "./Row";
import './App.css';

var symbolsMap = {
  2: ["marking", "32"],
  0: ["marking marking-x", 9587],
  1: ["marking marking-o", 9711]
};

var patterns = [
  //horizontal
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  //vertical
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  //diagonal
  [0, 4, 8],
  [2, 4, 6]
];

var AIScore = { 2: 1, 0: 2, 1: 0 };

class App extends React.Component {

  constructor(props) {
    super(props);

    const bluePlayerScore2P = localStorage.getItem('bluePlayerScore2P') || 0;
    const redPlayerScore2P = localStorage.getItem('redPlayerScore2P') || 0;
    const bluePlayerScoreAI = localStorage.getItem('bluePlayerScoreAI') || 0;
    const redPlayerScoreAI = localStorage.getItem('redPlayerScoreAI') || 0;

    this.state = {
      boardState: new Array(9).fill(2),
      turn: 0,
      active: true,
      mode: "2P",
      bluePlayerScore2P: parseInt(bluePlayerScore2P),
      redPlayerScore2P: parseInt(redPlayerScore2P),
      bluePlayerScoreAI: parseInt(bluePlayerScoreAI),
      redPlayerScoreAI: parseInt(redPlayerScoreAI),
      player1Name: "Red",
      player2Name: "Green"
    };

    this.handleNewMove = this.handleNewMove.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleModeChange = this.handleModeChange.bind(this);
    this.processBoard = this.processBoard.bind(this);
    this.updateScores = this.updateScores.bind(this);
  }

  updateScores(winner) {
    if (this.state.mode === "AI") {
      if (winner === 0) {
        this.setState(prevState => ({
          bluePlayerScoreAI: prevState.bluePlayerScoreAI + 1
        }), () => {
          localStorage.setItem('bluePlayerScoreAI', this.state.bluePlayerScoreAI);
        });
      } else if (winner === 1) {
        this.setState(prevState => ({
          redPlayerScoreAI: prevState.redPlayerScoreAI + 1
        }), () => {
          localStorage.setItem('redPlayerScoreAI', this.state.redPlayerScoreAI);
        });
      }
    } else {
      if (winner === 0) {
        this.setState(prevState => ({
          bluePlayerScore2P: prevState.bluePlayerScore2P + 1
        }), () => {
          localStorage.setItem('bluePlayerScore2P', this.state.bluePlayerScore2P);
        });
      } else if (winner === 1) {
        this.setState(prevState => ({
          redPlayerScore2P: prevState.redPlayerScore2P + 1
        }), () => {
          localStorage.setItem('redPlayerScore2P', this.state.redPlayerScore2P);
        });
      }
    }
  }


  processBoard() {
    var won = false;
    patterns.forEach(pattern => {
      var firstMark = this.state.boardState[pattern[0]];

      if (firstMark !== 2) {
        var marks = this.state.boardState.filter((mark, index) => {
          return pattern.includes(index) && mark === firstMark;
        });

        if (marks.length === 3) {
          // Update scores before changing the game state
          this.updateScores(firstMark);
          document.querySelector("#message1").innerHTML =
            String.fromCharCode(symbolsMap[marks[0]][1]) + " wins!";
          document.querySelector("#message1").style.display = "block";
          pattern.forEach(index => {
            var id = index + "-" + firstMark;
            document.getElementById(id).parentNode.style.background = "#d4edda";
          });
          this.setState({ active: false });
          won = true;
        }
      }
    });

    if (!this.state.boardState.includes(2) && !won) {
      document.querySelector("#message2").innerHTML = "Game Over - It's a draw";
      document.querySelector("#message2").style.display = "block";
      this.setState({ active: false });
    } else if (this.state.mode === "AI" && this.state.turn === 1 && !won) {
      this.makeAIMove();
    }
  }


  makeAIMove() {
    var emptys = [];
    var scores = [];
    this.state.boardState.forEach((mark, index) => {
      if (mark == 2) emptys.push(index);
    });

    emptys.forEach(index => {
      var score = 0;
      patterns.forEach(pattern => {
        if (pattern.includes(index)) {
          var xCount = 0;
          var oCount = 0;
          pattern.forEach(p => {
            if (this.state.boardState[p] == 0) xCount += 1;
            else if (this.state.boardState[p] == 1) oCount += 1;
            score += p == index ? 0 : AIScore[this.state.boardState[p]];
          });
          if (xCount >= 2) score += 10;
          if (oCount >= 2) score += 20;
        }
      });
      scores.push(score);
    });

    var maxIndex = 0;
    scores.reduce(function (maxVal, currentVal, currentIndex) {
      if (currentVal >= maxVal) {
        maxIndex = currentIndex;
        return currentVal;
      }
      return maxVal;
    });
    this.handleNewMove(emptys[maxIndex]);
  }

  handleReset(e) {
    if (e) e.preventDefault();
    document
      .querySelectorAll(".alert")
      .forEach(el => (el.style.display = "none"));
    this.setState({
      boardState: new Array(9).fill(2),
      turn: 0,
      active: true
    });
  }
  handleNewMove(id) {
    this.setState(
      prevState => {
        return {
          boardState: prevState.boardState
            .slice(0, id)
            .concat(prevState.turn)
            .concat(prevState.boardState.slice(id + 1)),
          turn: (prevState.turn + 1) % 2
        };
      },
      () => {
        this.processBoard();
      }
    );
  }

  handleModeChange(e) {
    e.preventDefault();
    if (e.target.getAttribute("href").includes("AI")) {
      e.target.style.color = "blue";
      document.querySelector("#twop").style.color = "rgb(83, 83, 83)";
      this.setState({ mode: "AI" });
      this.handleReset(null);
    } else if (e.target.getAttribute("href").includes("2P")) {
      e.target.style.color = "blue";
      document.querySelector("#ai").style.color = "rgb(83, 83, 83)";
      this.setState({ mode: "2P" });
      this.handleReset(null);
    }
  }
  componentDidMount() {
    // Check the current mode and update button text color accordingly
    if (this.state.mode === '2P') {
      document.querySelector("#twop").style.color = "blue";
      document.querySelector("#ai").style.color = "rgb(83, 83, 83)";
    }
  }

  render() {
    const rows = [];
    const mode = this.state.mode;
    const player1Name = this.state.player1Name;
    const player2Name = this.state.player2Name;

    for (var i = 0; i < 3; i++)
      rows.push(
        <Row
          row={i}
          boardState={this.state.boardState}
          onNewMove={this.handleNewMove}
          active={this.state.active}
        />
      );
    return (
      <div className='parent'>
        <div className="container jumbotron" id="container">
          <h3 className='heading'>TIC TAC TOE</h3>
          <div className='buttons'>
            <button className={`aibtn ${mode === 'AI' ? 'active' : ''}`} ><a href="./?AI" id="ai" onClick={this.handleModeChange}>Versus AI</a></button> {" "}
            <button className={`aibtn ${mode === '2P' ? 'active' : ''}`} ><a href="./?2P" id="twop" onClick={this.handleModeChange}>2 Players</a></button> {" "}
            <button className='aibtn' > <a href="#" id="reset" onClick={this.handleReset}>Reset board</a></button>
          </div>
          <p style={{ marginTop: "10px" }}>{String.fromCharCode(symbolsMap[this.state.turn][1])}'s turn</p>
          <div className="board">{rows}</div>
          <p class="alert alert-success" role="alert" id="message1"></p>
          <p class="alert alert-info" role="alert" id="message2"></p>
          <div className="player-scores">
            {mode === 'AI' ? (
              <>
                <div className='main'>
                  <p>Score: </p>
                  <div className='score'>
                    <p className='coredetails'>Your Score: {this.state.bluePlayerScoreAI}</p>
                    <p className='coredetails'>AI Score: {this.state.redPlayerScoreAI}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className='main'>
                  <p>Score: </p>
                  <div className='score'>

                    <p className='coredetails'>{player2Name} : {this.state.bluePlayerScore2P}</p>
                    <p className='coredetails'>{player1Name} : {this.state.redPlayerScore2P}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
