import React, { Component } from 'react';
import './App.css';
import './fontawesome-all.js';


const randomTable = () => {
  //creates a table of 50x30 cells with random numbers (1 or 0)
  //1 - live, 0 - dead
  //for example table 3x2: [ [0, 1, 1],
  //                         [1, 0, 1] ]
  const table = [];
  for (let row = 0; row < 30; row++) {
    table.push([]);
    for(let column = 0; column < 50; column++) {
      //push random numbers (0 or 1)
      table[row].push( Math.floor(Math.random() * 2) );
    }
  }
  return table;
}

const clearTable = () => {
  const table = [];
  for (let row = 0; row < 30; row++) {
    table.push([]);
    for(let column = 0; column < 50; column++) {
      table[row].push(0);
    }
  }
  return table;
}

//================================================

const Buttons = (props) => {
  return (
    <React.Fragment>
      <div className="buttons-block">

        <div className="buttons-block__shadows">
          <i className="fas fa-play fa-2x"></i>
          <i className="fas fa-pause fa-2x"></i>
          <p>/ </p>
          <i className="fas fa-stop fa-2x"></i>
        </div>

        <div className="buttons-block__buttons">
          <button className="play"
                  onClick={props.handlePlayClick}
                  style={{ transform: !props.gameOnPause ?
                                        'translate(1px, 3px)' : '' }}>
            <i className="fas fa-play fa-2x"></i>
          </button>

          <button className="pause"
                  onClick={props.handlePauseClick}
                  style={{ transform: props.gameOnPause ?
                                        'translate(1px, 3px)' : '' }}>
            <i className="fas fa-pause fa-2x"></i>
          </button>

          <p>Generation: {props.generation}</p>

          <button className="stop" onClick={props.handleStopClick}>
            <i className="fas fa-stop fa-2x"></i>
          </button>
        </div>
      </div>
    </React.Fragment>

  );
}


const Table = ({ table, onClickCell }) => {
  return (
    <table>
      <tbody>
        {
          table.map((row, rowIndex) =>
            <tr key={rowIndex}>
              {
                row.map((cellAlive, columnIndex) => {
                  return (
                    <td onClick={onClickCell}
                        style={{ backgroundColor: cellAlive ? '#ff4d6c' : '' }}
                        id={rowIndex + '-' + columnIndex}
                        key={rowIndex + '' + columnIndex}
                    />
                  );
                })
              }
            </tr>
          )
        }
      </tbody>
    </table>
  );
}


class TheGameOfLife extends Component {
  constructor(props) {
    super(props);
    this.state = {
      table: randomTable(),
      generation: 0,
      gameOnPause: false,
    };
    this.updatedTable = null;
    this.lastTableUpdateHasChanges = true;
    this.updatingTableSetIntervalFunc = null;
  }

  handlePlayClick = (e) => {
    e.preventDefault();
    if (this.state.gameOnPause) {
      this.updatingTableWithIntervals();
      this.setState({ gameOnPause: false });
    }
  }

  handlePauseClick = (e) => {
    e.preventDefault();
    clearInterval(this.updatingTableSetIntervalFunc);
    this.setState({ gameOnPause: true });
  }

  handleStopClick = (e) => {
    e.preventDefault();
    clearInterval(this.updatingTableSetIntervalFunc);
    this.setState({
      table: clearTable(),
      generation: 0,
      gameOnPause: true
    })
  }

  handleCellClick = (e) => {
    e.preventDefault();
    //for example the cell id: 0-2
    //this means that the cell exists in row 0 and column 2
    const cellIndex = e.nativeEvent.path[0].id.split('-');
    const row = cellIndex[0];
    const column = cellIndex[1];

    const table = this.state.table;
    //copy table
    const newTable = JSON.parse(JSON.stringify(table));

    //if (1) then (0), if (0) -> (1)
    newTable[row][column] = table[row][column] ? (0) : (1);

    this.setState({ table: newTable });
    this.lastTableUpdateHasChanges = true;
  }

  updatingTable = () => {
      const table = this.state.table;
      this.updatedTable = JSON.parse(JSON.stringify(table));

      this.lastTableUpdateHasChanges = false;

      table.forEach((row, rowIndex) => {
        row.forEach((cellAlive, columnIndex) => {
          // we need to check value of neighbors cells:
          // 8 neighbors: (8-point compass rose)
          let N, NE, E, SE, S, SW, W, NW;

          // if the index of the neighbor is larger than the size of the array,
          // then we use first index (0) of the array
          let isLastColumn = (columnIndex === row.length - 1);
          let rightColumnIndex = isLastColumn ?
            (0) : (columnIndex + 1);

          let isLastRow = (rowIndex === table.length - 1);
          let topRowIndex = isLastRow ?
            (0) : (rowIndex + 1);

          // if the index of the neighbor is [-1],
          // then we use last index of the array
          let isFirstColumn = (columnIndex === 0);
          let leftColumnIndex = isFirstColumn ?
            (row.length - 1) : (columnIndex - 1);

          let isFirstRow = (rowIndex === 0);
          let bottomRowIndex = isFirstRow ?
            (table.length - 1) : (rowIndex - 1);

          N = table[topRowIndex][columnIndex];
          NE = table[topRowIndex][rightColumnIndex];
          E = table[rowIndex][rightColumnIndex];
          SE = table[bottomRowIndex][rightColumnIndex];
          S = table[bottomRowIndex][columnIndex];
          SW = table[bottomRowIndex][leftColumnIndex];
          W = table[rowIndex][leftColumnIndex];
          NW = table[topRowIndex][leftColumnIndex];

          let neighbors = N + NE + E + SE + S + SW + W + NW;

          if (cellAlive) {
            if (neighbors < 2 || neighbors > 3) {
              //cell will die
              this.updatedTable[rowIndex][columnIndex] = 0;
              this.lastTableUpdateHasChanges = true;
            }
          } else {
            if (neighbors === 3) {
              //cell will come to life
              this.updatedTable[rowIndex][columnIndex] = 1;
              this.lastTableUpdateHasChanges = true;
            }
          }
        })
      });
  }

  updatingTableWithIntervals = () => {
    this.updatingTableSetIntervalFunc = setInterval(() => {
        if (this.lastTableUpdateHasChanges) {
          this.updatingTable();
          this.setState({
            table: this.updatedTable,
            generation: this.state.generation + 1
          });
        }
      }, 100)
  }

  componentDidMount() {
    this.updatingTableWithIntervals();
  }

  render() {
    return (
      <React.Fragment>
        <header>
          <a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life"
             target="_blank">
            <i className="fas fa-info-circle"></i>
          </a>
        </header>
        <div className="game">
          <Buttons handlePlayClick={this.handlePlayClick}
                   handlePauseClick={this.handlePauseClick}
                   handleStopClick={this.handleStopClick}
                   gameOnPause={this.state.gameOnPause}
                   generation={this.state.generation}
          />

          <Table table={this.state.table}
                 onClickCell={this.handleCellClick} />
        </div>
      </React.Fragment>
    );
  }
}

export default TheGameOfLife;
