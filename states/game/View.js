class View {
  constructor(model, rootElement) {
    this.model = model;
    this.root = rootElement;
    this.statusLine = document.createElement('div');
  }

  displayOwnField() {
    const container1 = this.root.querySelector('#player1-container');
    const table = document.createElement('table');
    for (let i = 0; i < size; i++) {
      const row = document.createElement('tr');
      for (let j = 0; j < size; j++) {
        const cell = document.createElement('td');
        cell.innerText = this.model.ownField[i][j];
        if (this.model.ownField[i][j] === 'H') {
          cell.classList.add('hit');
        } else if (this.model.ownField[i][j] === 'M') {
          cell.classList.add('miss');
        }
        cell.setAttribute('data-value', `${j}${i}`);
        row.appendChild(cell);
      }
      table.appendChild(row);
    }
    container1.appendChild(table);
  }

  displayEnemyField() {
    const container2 = this.root.querySelector('#player2-container');
    const table1 = document.createElement('table');
    for (let i = 0; i < size; i++) {
      const row = document.createElement('tr');
      for (let j = 0; j < size; j++) {
        const cell = document.createElement('td');
        cell.innerText = this.model.enemyField[i][j];
        if (this.model.enemyField[i][j] === 'H') {
          cell.classList.add('hit');
        } else if (this.model.enemyField[i][j] === 'M') {
          cell.classList.add('miss');
        }
        cell.classList.add('player');
        cell.setAttribute('data-value', `${j}${i}`);
        row.appendChild(cell);
      }
      table1.appendChild(row);
    }
    container2.appendChild(table1);
  }

  displayAll() {
    this.displayOwnField();
    this.displayEnemyField();
    this.root.appendChild(this.statusLine);
  }

  updateOwnField() {
    const field = this.root.querySelector('#player1-container table');
    field.remove();
    this.displayOwnField();
  }

  updateEnemyField() {
    const field = this.root.querySelector('#player2-container table');
    field.remove();
    this.displayEnemyField();
  }

  notify(event) {
    if (event.type === 'start') {
      this.statusLine.innerText = 'Player 1 turn...';
    } else if (event.type === 'turnEnd') {
      if (event.detail.playerName === 'Player 1') {
        this.statusLine.innerText = 'Player 2 turn...';
      } else {
        this.statusLine.innerText = 'Player 1 turn...';
      }
      this.updateOwnField();
      this.updateEnemyField();
    }
  }
}
