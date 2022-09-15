class View {
  constructor(model, rootElement) {
    this.model = model;
    this.root = rootElement;
  }

  displayOwnField() {
    const container1 = this.root.querySelector('#player1-container');
    const table = document.createElement('table');
    for (let i = 0; i < size; i++) {
      const row = document.createElement('tr');
      for (let j = 0; j < size; j++) {
        const cell = document.createElement('td');
        cell.innerText = this.model.ownField[i][j];
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
    if (event.type === 'turnEnd') {
      this.updateOwnField();
      this.updateEnemyField();
    }
  }
}
