var BattleshipModel = function () { // eslint-disable-line no-unused-vars
  var ships = [1, 2, 3]
  var boardSize = 5
  var shipsPlaced = [0, 0]
  var phase = 1
  var playerTurn = 0
  var firstTile = true
  var noShips = ships.length
  var currentPlayer = 0
  var currentShip = -1
  var gameButtonMsg = 'READY'
  var shipsSunk = [0, 0]
  var shotsFired = [0, 0]

  this.setGameButtonMsg = function (msg) {
    gameButtonMsg = msg
  }

  this.getGameButtonMsg = function () {
    return gameButtonMsg
  }

  this.setShotsFired = function (player) {
    shotsFired[player]++
  }

  this.getShotsFired = function (player) {
    return shotsFired[player]
  }

  this.getShipsPlaced = function (player) {
    return shipsPlaced[player]
  }

  this.getcurrentShip = function () {
    return currentShip
  }

  this.setCurrentShip = function (newShip) {
    currentShip = newShip
  }

  this.getNoShips = function () {
    return noShips
  }

  this.getShips = function () {
    return ships
  }

  this.getTurn = function () {
    return playerTurn
  }

  this.setTurn = function () {
    // After player 1 is done it is player 2:s turn. There is no going back
    playerTurn = 1
  }

  this.getPhase = function () {
    return phase
  }

  this.setPhase = function (newPhase) {
    phase = newPhase
  }

  this.getShipsPlaced = function (player) {
    return shipsPlaced[player]
  }

  this.setShipsPlaced = function (player, increment) {
    // If remove inc is negative. if place inc is positive
    if (increment) {
      shipsPlaced[player]++
    } else {
      shipsPlaced[player]--
    }
  }

  this.getShipsSunk = function (player) {
    return shipsSunk[player]
  }

  this.setIncrementShipsSunk = function (player) {
    shipsSunk[player]++
  }

  this.getBoardSize = function () {
    return boardSize
  }

  this.getTileValue = function (player, row, col) {
    var element = this.getBoards()[player][row][col]
    return element
  }

  this.setTileValue = function (player, row, col, val) {
    boards[player][parseInt(row)][parseInt(col)] = val
  }

  this.initialize_player_ships = function () {
    var playerShipInfo = new Map()

    for (var i = 0; i < ships.length; i++) {
      playerShipInfo.set(i, new Map())
      playerShipInfo.get(i).set('placed', false)

      playerShipInfo.get(i).set('row_col_start', 'empty')
      playerShipInfo.get(i).set('row_col_end', 'empty')

      playerShipInfo.get(i).set('length', ships[i])
      playerShipInfo.get(i).set('no_hits', 0)
    }
    return playerShipInfo
  }

  this.initializeMatrix = function () {
    var matrix = []

    for (var i = 0; i < boardSize; i++) {
      var row = []
      for (var j = 0; j < boardSize; j++) {
        row.push('empty')
      }
      matrix.push(row)
    }
    return matrix
  }

  this.getCurrentPlayer = function () {
    return currentPlayer
  }

  this.getOpponentPlayer = function (player) {
    if (player === 0) {
      return 1
    } else {
      return 0
    }
  }

  this.setCurrentPlayer = function (player) {
    currentPlayer = this.getOpponentPlayer(player)
  }

  this.setFirstTile = function (bool) {
    firstTile = bool
  }

  this.getFirstTile = function () {
    return firstTile
  }

  var boardPlayer1 = this.initializeMatrix()
  var boardPlayer2 = this.initializeMatrix()

  var boards = [boardPlayer1, boardPlayer2]

  var playerShipDict1 = this.initialize_player_ships()
  var playerShipDict2 = this.initialize_player_ships()

  var playerShipDicts = [playerShipDict1, playerShipDict2]

  this.getPlayerDict = function (player) {
    return playerShipDicts[player]
  }

  this.checkNextTurn = function (placedShips, noShips) {
    var nextTurn = false
    if (placedShips === noShips) {
      nextTurn = true
    }
    return nextTurn
  }

  this.getPlayerDictPlaced = function (player, ship) {
    return playerShipDicts[player].get(ship).get('placed')
  }

  this.getPlayerDictStart = function (player, ship) {
    return playerShipDicts[player].get(ship).get('row_col_start')
  }

  this.getPlayerDictEnd = function (player, ship) {
    return playerShipDicts[player].get(ship).get('row_col_end')
  }

  this.ifShipIsSunk = function (player, ship) {
    if (playerShipDicts[player].get(ship).get('length') === playerShipDicts[player].get(ship).get('no_hits')) {
      return true
    }
  }

  this.setPlayerDictStart = function (player, ship, cell) {
    playerShipDicts[player].get(ship).set('row_col_start', cell)
  }

  this.setPlayerDictPlaced = function (player, ship, placed) {
    playerShipDicts[player].get(ship).set('placed', placed)
  }

  this.setPlayerDictEnd = function (player, ship, cell) {
    playerShipDicts[player].get(ship).set('row_col_end', cell)
  }
  this.setPlayerDictIncreaseNoHits = function (player, ship) {
    var hits = playerShipDicts[player].get(ship).get('no_hits')
    hits++
    playerShipDicts[player].get(ship).set('no_hits', hits)
  }

  this.firstTilePlaced = function (row, col) {
    // Extracts the first tile of a ship
    var tileKey = -1
    loop1: // eslint-disable-line no-labels
    for (var j = 0; j < this.getNoShips(); j++) {
      if (this.getPlayerDictPlaced(this.getTurn(), j) === false && (this.getPlayerDictStart(this.getTurn(), j) === 'empty')) {
        tileKey = j
        break loop1 // eslint-disable-line no-labels
      }
    }
    return tileKey
  }

  this.getBoarderTiles = function (row, col) {
    var shipKey = -1
    var firstTileCell = -1
    loop1: // eslint-disable-line no-labels
    for (var j = 0; j < this.getNoShips(); j++) {
      if ((this.getPlayerDictPlaced(this.getTurn(), j) === false) && (this.getPlayerDictStart(this.getTurn(), j) !== 'empty') && (this.getPlayerDictEnd(this.getTurn(), j) === 'empty')) {
        shipKey = j
        firstTileCell = this.getPlayerDictStart(this.getTurn(), j)
        break loop1 // eslint-disable-line no-labels
      }
    }
    return [shipKey, firstTileCell]
  }

  this.validateShip = function (cell1, cell2, shipSize) {
    var tileInfo1 = cell1.split('_')
    var tileInfo2 = cell2.split('_')

    var row1 = parseInt(tileInfo1[0])
    var col1 = parseInt(tileInfo1[1])

    var row2 = parseInt(tileInfo2[0])
    var col2 = parseInt(tileInfo2[1])

    var numTilesBetween = shipSize - 1

    var tilesBetween = this.getTilesBetween(row1, row2, col1, col2, numTilesBetween)
    return tilesBetween
  }

  this.getTilesBetween = function (row1, row2, col1, col2, noTilesBetween) {
    var tiles = []
    var msg = 'Invalid'

    if (row1 === row2) { // horizontal ship
      var orderedCols = this.getDescendingOrder(col1, col2)
      var colL = orderedCols[0]
      var colS = orderedCols[1]

      tiles.push(row1 + '_' + colS)
      var nextTile = colS

      for (var t = 0; t < noTilesBetween; t++) {
        nextTile++
        tiles.push(row1 + '_' + nextTile)
      }
      if (nextTile === colL) {
        return tiles
      } else {
        return msg
      }
    } else if (col1 === col2) {
      var orderedRows = this.getDescendingOrder(row1, row2)
      var rowL = orderedRows[0]
      var rowS = orderedRows[1]
      var nextTile2 = rowS
      tiles.push(nextTile2 + '_' + col1)

      for (var t2 = 0; t2 < noTilesBetween; t2++) {
        nextTile2++
        tiles.push(nextTile2 + '_' + col1)
      }

      if (nextTile2 === rowL) {
        return tiles
      } else {
        return msg
      }
    } else {
      return msg
    }
  }

  this.getDescendingOrder = function (v1, v2) {
    if (v1 > v2) {
      return [v1, v2]
    } else {
      return [v2, v1]
    }
  }

  this.allShipsShot = function (player) {
    if (this.getShipsSunk(player) === ships.length) {
      return true
    } else {
      return false
    }
  }

  this.getBoards = function () {
    return boards
  }

  this.emptyTile = function (player, row, col) {
    var b = this.getBoards()[player]
    var element = b[parseInt(row)][parseInt(col)]
    if (element === 'empty') {
      return true
    } else {
      return false
    }
  }

  this.checkEnoughSpace = function (player, cell, shipSize) {
    var board = this.getBoards()[player]
    var cellInfo = cell.split('_')
    var row = parseInt(cellInfo[0])
    var rowU = parseInt(cellInfo[0])
    var rowD = parseInt(cellInfo[0])

    var col = parseInt(cellInfo[1])
    var colR = parseInt(cellInfo[1])
    var colL = parseInt(cellInfo[1])

    var enoughSpaceHorL = true
    var enoughSpaceHorR = true

    var enoughSpaceVerU = true
    var enoughSpaceVerD = true

    var boardContentRD = 'init'
    var boardContentLU = 'init'

    for (var t = 0; t < shipSize; t++) {
      try {
        boardContentLU = board[rowU][col]
      } catch (err) {
        // outside of board
        enoughSpaceVerU = false
      }
      try {
        boardContentRD = board[rowD][col]
      } catch (err) {
        enoughSpaceVerD = false
      }
      rowD++
      rowU--
      if (boardContentLU !== 'empty') {
        enoughSpaceVerU = false
      }
      if (boardContentRD !== 'empty') {
        enoughSpaceVerD = false
      }
    }

    boardContentRD = 'init'
    boardContentLU = 'init'

    loopHor: // eslint-disable-line no-labels
    for (var t2 = 0; t2 < shipSize; t2++) {
      try {
        boardContentRD = board[row][colR]
      } catch (err) { // outside of board
        enoughSpaceHorR = false
      }
      try {
        boardContentLU = board[row][colL]
      } catch (err) { // outside of board
        enoughSpaceHorL = false
      }
      colR++
      colL--
      if (boardContentLU !== 'empty') {
        enoughSpaceHorL = false
      }
      if (boardContentRD !== 'empty') {
        enoughSpaceHorR = false
      }
    }

    if (enoughSpaceHorL || enoughSpaceHorR || enoughSpaceVerU || enoughSpaceVerD) {
      return true
    } else {
      return false
    }
  }
}
