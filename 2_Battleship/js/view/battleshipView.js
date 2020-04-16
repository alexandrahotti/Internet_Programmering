'use-strict'

var BattleshipView = function (container) { // eslint-disable-line no-unused-vars
  var model = new BattleshipModel() // eslint-disable-line no-undef
  runGame(container, model)
}

function runGame (container, model) {
  generateBoard(container, model.getBoardSize())
  var phase = model.getPhase()

  container.find('#gameButton')[0].addEventListener('click', function (event) {
    var turn = model.getTurn()
    var noShipsPlaced = model.getShipsPlaced(turn)
    var noShips = model.getNoShips()

    if (event.target.innerHTML === 'PLAY') {
      model.setPhase(2)
      phase = model.getPhase()
    }

    // End of placement turn for player
    if ((noShipsPlaced === noShips) && phase === 1) {
      model.setTurn()
      turn = model.getTurn()
      noShipsPlaced = model.getShipsPlaced(turn)
      clearTileImages(container)

      // End of placement turn for both players
      if (turn === 1 && (noShipsPlaced === noShips)) {
        model.setGameButtonMsg('PLAY')
        container.find('#instructions')[0].innerHTML = '<strong>Are both players ready to rumble?!?!</strong>'
        container.find('#gameButton')[0].innerHTML = model.getGameButtonMsg()
      }
    }

    // Start of placement turn
    if ((noShipsPlaced === 0) && phase === 1) {
      var shipString = model.getShips().join(', ')
      container.find('#instructions')[0].innerHTML = `<strong>Player ${turn + 1} place your ${model.getShips().length} ships of size  ${shipString}! <br>
                                                      Press ready when you are.. ready!</strong>`
      container.find('#gameButton')[0].innerHTML = model.getGameButtonMsg()
    }

    // Placement turn
    if (phase === 1 && event.target.innerHTML !== 'PLAY') {
      var tiles = container.find('.tile')
      for (var j = 0; j < tiles.length; j++) {
        tiles[j].removeEventListener('click', phaseOne)
        tiles[j].addEventListener('click', phaseOne)
      }
    } else if (phase === 2) {
      this.removeEventListener('click', arguments.callee, false) // eslint-disable-line
      phaseTwo()
    }
  })

  function phaseOne (tile) {
    // Place ships
    var buttonID = tile.target.id.split('_')
    var currentPlayer = parseInt(buttonID[0]) - 1

    var row = buttonID[1]
    var col = buttonID[2]
    var ships = model.getShips()
    var noShips = model.getNoShips()
    var noShipsPlaced = model.getShipsPlaced(model.getTurn())
    if ((model.emptyTile(model.getTurn(), row, col) && (noShipsPlaced < noShips)) && (model.getTurn() === currentPlayer)) {
      // if the tile is empty,      if not all ships are placed yet    if correct board for the current player
      if (model.getFirstTile()) {
        placeFirstTile(currentPlayer, row, col, ships, container, model)
      } else {
        placeSecondTile(currentPlayer, row, col, ships, container, model)
      }
    } else if ((model.getTileValue(currentPlayer, row, col) >= 0) && (model.getTurn() === currentPlayer) && model.getFirstTile()) {
      removeTile(row, col, model, container)
    } else {}
  }

  function phaseTwo () {
    clearTileImages(container)
    container.find('#instructions')[0].innerHTML = ''
    var tiles = container.find('.tile')
    for (var i = 0; i < tiles.length; i++) {
      tiles[i].addEventListener('click', shoot)
    }
  }

  function shoot (tile) {
    var currentPlayer = model.getCurrentPlayer()
    var buttonID = tile.target.id.split('_')
    var player = parseInt(buttonID[0]) - 1
    if (currentPlayer === player) {
      var row = buttonID[1]
      var col = buttonID[2]
      var tileValue = model.getTileValue(player, row, col)

      if (tileValue === 'empty') { // Empty tile
        model.setTileValue(player, row, col, '-')
        container.find('#' + tile.target.id)[0].innerHTML = `<img src='images\\hole.png' />`
        model.setCurrentPlayer(player)
        container.find('#gameMessages')[0].innerHTML = 'Ouch! Not even close...'
        model.setShotsFired(player)
        renderShotsFired(player, model.getShotsFired(player), container)
      } else if (tileValue === '-' || tileValue === 'x') { // Already shot (-) or already hit (x)
        container.find('#gameMessages')[0].innerHTML = 'Invalid shot sergeant. Shoot Again!'
      } else {
        model.setTileValue(player, row, col, 'x')
        container.find('#' + tile.target.id)[0].innerHTML = `<img src='images\\explosion.png' />`
        container.find('#gameMessages')[0].innerHTML = `BOOOMCHAKALAKA! You're going down son!`
        var opponent = model.getOpponentPlayer(currentPlayer)
        model.setPlayerDictIncreaseNoHits(opponent, tileValue)
        model.setShotsFired(player)
        renderShotsFired(player, model.getShotsFired(player), container)

        if (model.ifShipIsSunk(opponent, tileValue)) {
          model.setIncrementShipsSunk(opponent)
          renderShipsSunked(opponent, model.getShipsSunk(opponent), container)
          if (model.allShipsShot(opponent)) {
            var tiles = container.find('.tile')
            for (var i = 0; i < tiles.length; i++) {
              tiles[i].removeEventListener('click', shoot)
            }
            gameOver(opponent, container)
          }
        }
      }
    }
  }
}

function placeSecondTile (currentPlayer, row, col, ships, container, model) {
  var shipKey = model.getcurrentShip()
  var shipSize = ships[shipKey]

  // Get key of the ship (it's number) and row column for the first tile
  var tiles = model.getBoarderTiles(row, col)
  shipKey = tiles[0] // Ship key (e.g 0, 1, 2)
  var firstTileCell = tiles[1] // row_col for first tile

  var lastTileCell = row + '_' + col // row_col for second tile
  var placedTiles = model.validateShip(firstTileCell, lastTileCell, shipSize) // Returns array of the valid tiles, or Invalid if not valid

  if (placedTiles !== 'Invalid') {
    updateShipTiles(placedTiles, currentPlayer, shipSize, shipKey, model, container)

    model.setPlayerDictPlaced(currentPlayer, shipKey, true)
    model.setPlayerDictEnd(currentPlayer, shipKey, lastTileCell)
    model.setShipsPlaced(currentPlayer, true)
    model.setFirstTile(true)

    renderShipsPlaced(currentPlayer, model.getShipsPlaced(currentPlayer), container)
  }
}

function updateShipTiles (placedTiles, currentPlayer, shipSize, shipKey, model, container) {
  for (var j = 0; j < placedTiles.length; j++) {
    var currTile = placedTiles[j]
    var tileId = (currentPlayer + 1).toString() + '_' + currTile
    var tileInfo = currTile.split('_')
    if (shipSize > 2) {
      container.find('#' + tileId)[0].innerHTML = `<img src='images\\giantFerry.png' />`
    } else {
      container.find('#' + tileId)[0].innerHTML = `<img src='images\\ferry.png' />`
    }

    var rowp = tileInfo[0]
    var colp = tileInfo[1]

    model.setTileValue(currentPlayer, rowp, colp, shipKey)
  }
}

function placeFirstTile (currentPlayer, row, col, ships, container, model) {
  var shipKey = model.firstTilePlaced(currentPlayer, row, col)
  model.setCurrentShip(shipKey)

  var shipSize = ships[shipKey]
  var cell = row + '_' + col

  if (model.checkEnoughSpace(currentPlayer, cell, shipSize)) {
    // Is there enough space to place the ship here
    model.setPlayerDictStart(currentPlayer, shipKey, cell) // player ship cell

    var tileId = (currentPlayer + 1).toString() + '_' + cell

    if (shipSize > 1) { // If ship longer than 1, continue to second tile placement
      container.find('#' + tileId)[0].innerHTML = `<img src='images\\arrow.png' />`
      model.setFirstTile(false)
      model.setTileValue(currentPlayer, row, col, shipKey) // update board
    } else {
      // If size is equal to 1 place tile
      model.setPlayerDictPlaced(currentPlayer, shipKey, true)
      model.setPlayerDictEnd(currentPlayer, shipKey, cell)
      model.setTileValue(currentPlayer, row, col, shipKey) // update board
      model.setShipsPlaced(currentPlayer, true)
      model.setFirstTile(true)

      container.find('#' + tileId)[0].innerHTML = `<img src='images\\ship.png' />`

      renderShipsPlaced(currentPlayer, model.getShipsPlaced(currentPlayer), container)
    }
  } else {
    container.find('#gameMessages')[0].innerHTML = 'Not enough space to place the ship here. Try again'
  }
}

function removeTile (row, col, model, container) {
  var shipKey = model.getBoards()[model.getTurn()][row][col]
  var boardSize = model.getBoardSize()

  model.setPlayerDictPlaced(model.getTurn(), shipKey, false)
  model.setPlayerDictStart(model.getTurn(), shipKey, 'empty')
  model.setPlayerDictEnd(model.getTurn(), shipKey, 'empty')
  model.setShipsPlaced(model.getTurn(), false)
  renderShipsPlaced(model.getTurn(), model.getShipsPlaced(model.getTurn()), container)

  for (var r = 0; r < boardSize; r++) {
    for (var c = 0; c < boardSize; c++) {
      if (shipKey === model.getBoards()[model.getTurn()][r][c]) {
        model.setTileValue(model.getTurn(), r, c, 'empty')
        var currTile = r + '_' + c
        var tileId = (model.getTurn() + 1).toString() + '_' + currTile
        container.find('#' + tileId)[0].innerHTML = ''
      }
    }
  }
}

function gameOver (player, container) {
  container.find('#instructions')[0].innerHTML = `<strong>Player ${player + 1} has won!</strong>`
  container.find('#gameMessages')[0].innerHTML = 'Press the button the play again.'
  container.find('#gameButton').click(function (event) {
    window.location.reload(true)
  })
}

function renderShipsPlaced (player, shipsPlaced, container) {
  if (player === 0) {
    container.find('#noPlacedShips_1')[0].innerHTML = shipsPlaced
  } else {
    container.find('#noPlacedShips_2')[0].innerHTML = shipsPlaced
  }
}

function renderShipsSunked (player, shipsSunked, container) {
  if (player === 0) {
    container.find('#noShotShips_1')[0].innerHTML = shipsSunked
  } else {
    container.find('#noShotShips_2')[0].innerHTML = shipsSunked
  }
}

function renderShotsFired (player, shotsFired, container) {
  if (player === 0) {
    container.find('#noShotsFired_2')[0].innerHTML = shotsFired
  } else {
    container.find('#noShotsFired_1')[0].innerHTML = shotsFired
  }
}

function clearTileImages (container) {
  var tiles = container.find('.tile')
  for (var i = 0; i < tiles.length; i++) {
    tiles[i].innerHTML = ''
  }
}

function generateBoard (container, boardSize) {
  for (var r = 0; r < boardSize; r++) {
    for (var c = 0; c < boardSize; c++) {
      container.find('#player1').append(`<button class='tile', id='1_${r}_${c}'></button>`)
      container.find('#player2').append(`<button class='tile', id='2_${r}_${c}'></button>`)
    }
    container.find('#player1').append(`<br>`)
    container.find('#player2').append(`<br>`)
  }
  var computedHW = 100 / boardSize

  var tiles = document.getElementsByClassName('tile')
  for (var i = 0; i < tiles.length; i++) {
    tiles[i].style.height = computedHW.toString() + '%'
    tiles[i].style.width = computedHW.toString() + '%'
  }
}
