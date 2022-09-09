const size = 3

// Shoot functions

const playerShoot = (x, y, field) => {
    if (field[x][y].innerText === 'S') {
        field[x][y].innerText = 'H'
        field[x][y].classList.add('hit')
    } else {
        field[x][y].innerText = 'M'
        field[x][y].classList.add('miss')
    }
    const event = new Event('playerShoot')
    document.dispatchEvent(event)
}

const botShoot = (field) => {
    let x, y;
    do {
        x = Math.floor(Math.random()*size)
        y = Math.floor(Math.random()*size)
    } while (field[x][y].innerText === 'M' || field[x][y].innerText === 'H')

    if (field[x][y].innerText === 'S') {
        field[x][y].innerText = 'H'
        field[x][y].classList.add('hit')
    } else {
        field[x][y].innerText = 'M'
        field[x][y].classList.add('miss')
    }
    const event = new Event('botShoot')
    document.dispatchEvent(event)
}

const checkFieldForShips = (field) => {
    return field.flat().some((cell)=>cell.innerText === 'S')
}

const createPlayerField = (element) => {
    const field = []
    const table = document.createElement('table');
    for (let i = 0; i< size; i++) {
        const refrow = []
        const row = document.createElement('tr')
        for (let j = 0; j< size; j++) {
            const cell = document.createElement('td')
            cell.innerText = 'E'
            row.appendChild(cell);
            refrow.push(cell)
        }
        table.appendChild(row)
        field.push(refrow)
    }
    
    element.appendChild(table)
    return field
}

const createBotField = (element) => {
    const field = []
    const table = document.createElement('table');
    for (let i = 0; i< size; i++) {
        const row = document.createElement('tr')
        const refrow = []
        for (let j = 0; j< size; j++) {
            const cell = document.createElement('td')
            cell.innerText = 'E'
            cell.classList.add('player')
            cell.setAttribute('data-value', `${i}${j}`)
            cell.addEventListener('click', (event)=>{
                console.log(event.target.dataset.value);
                const [x, y] = event.target.dataset.value.split('');
                playerShoot(parseInt(x), parseInt(y), p2field)
            })
            row.appendChild(cell);
            refrow.push(cell)

        }
        table.appendChild(row)
        field.push(refrow)
    }
    element.appendChild(table)
    return field
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

const p1field = createPlayerField(container1);

const p2field = createBotField(container2);

// Place ships

p1field[1][1].innerText = 'S'
p1field[0][0].innerText = 'S'
p2field[2][2].innerText = 'S'
p2field[0][2].innerText = 'S'

const game = () => {
    document.addEventListener('playerShoot', ()=>{
        botShoot(p1field)
    })
    document.addEventListener('botShoot', ()=>{
        if (checkFieldForShips(p1field) && checkFieldForShips(p2field)) {
            console.log('next round')
        } else {
            let winner;
            if (checkFieldForShips(p1field)) {
                winner = 'Player';
            } else {
                winner = 'Bot'
            }
            showVictory(winner, gameField, victoryContainer)
        }
    })
}

game();