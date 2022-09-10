const size = 3

// Shoot functions

const playerShoot = (x, y) => {
    const result = getHitMiss(x, y, botField)
    botField[x][y] = (result === 'H' ? 'H' : 'M')
    const cell = getElementByCoords(x, y, container2)
    cell.innerText = (result === 'H' ? 'H' : 'M')
    cell.classList.add(result === 'H' ? 'hit' : 'miss')
    const event = new Event('playerShoot')
    document.dispatchEvent(event)
}

const botShoot = () => {
    let x, y;
    do {
        x = Math.floor(Math.random()*size)
        y = Math.floor(Math.random()*size)
    } while (ownField[x][y] === 'M' || ownField[x][y] === 'H')

    const result = getHitMiss(x, y, ownField)
    ownField[x][y] = (result === 'H' ? 'H' : 'M')
    const cell = getElementByCoords(x, y, container1)
    cell.innerText = (result === 'H' ? 'H' : 'M')
    cell.classList.add(result === 'H' ? 'hit' : 'miss')
    const event = new Event('botShoot')
    document.dispatchEvent(event)
}

const checkFieldForShips = (field) => {
    return field.flat().some((cell)=>cell === 'S')
}

const displayOwnField = (field, element) => {
    const table = document.createElement('table');
    for (let i = 0; i< size; i++) {
        const row = document.createElement('tr')
        for (let j = 0; j< size; j++) {
            const cell = document.createElement('td')
            cell.innerText = field[j][i]
            row.appendChild(cell);
        }
        table.appendChild(row)
    }
    
    element.appendChild(table)
}

const displayEnemyField = (element) => {
    const table = document.createElement('table');
    for (let i = 0; i< size; i++) {
        const row = document.createElement('tr')
        for (let j = 0; j< size; j++) {
            const cell = document.createElement('td')
            cell.innerText = '?';
            cell.classList.add('player')
            cell.setAttribute('data-value', `${j}${i}`)
            cell.addEventListener('click', (event)=>{
                console.log(event.target.dataset.value);
                const [x, y] = event.target.dataset.value.split('');
                playerShoot(parseInt(x), parseInt(y))
            })
            row.appendChild(cell);
        }
        table.appendChild(row)
    }
    
    element.appendChild(table)
}

const getElementByCoords = (x, y, root) => {
    const rows = root.querySelectorAll('tr');
    const cells = rows[y].querySelectorAll('td')
    return cells[x]
}

const getHitMiss = (x, y, field) => {
    if (field[x][y] === 'S') {
        return 'H'
    } else {
        return 'M'
    }
}

const showVictory = (winner, gameField, victoryContainer) => {
    gameField.classList.add('hide')
    victoryContainer.classList.remove('hide')
    victoryContainer.innerText = `${winner} Wins!`
}

const gameField = document.querySelector('#game-field');
const container1 = document.querySelector('#player1-container')
const container2 = document.querySelector('#player2-container')
const victoryContainer = document.querySelector('#victory')

const ownField = Array(size).fill(null).map(()=>Array(size).fill('E'))
const botField = Array(size).fill(null).map(()=>Array(size).fill('E'))

// Place ships

ownField[1][1] = 'S'
ownField[0][0] = 'S'
botField[2][2] = 'S'
botField[0][2] = 'S'

const game = () => {
    displayOwnField(ownField, container1);
    displayEnemyField(container2)
    document.addEventListener('playerShoot', ()=>{
        botShoot()
    })
    document.addEventListener('botShoot', ()=>{
        if (checkFieldForShips(ownField) && checkFieldForShips(botField)) {
            console.log('next round')
        } else {
            let winner;
            if (checkFieldForShips(ownField)) {
                winner = 'Player';
            } else {
                winner = 'Bot'
            }
            showVictory(winner, gameField, victoryContainer)
        }
    })
}

game();