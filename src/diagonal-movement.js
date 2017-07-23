module.exports = {
  getNeighbors: getOrthogonalAndDiagonalNeighbors,
  heuristic: heuristic
}

function getOrthogonalAndDiagonalNeighbors (currentTile, opts) {
  var lowestRow = 0
  var highestRow = opts.grid.length / opts.gridWidth - 1
  var lowestColumn = 0
  var highestColumn = opts.gridWidth - 1

  var acceptedIndices = {}
  var currentTileIndex = (currentTile[0] % opts.gridWidth) + (currentTile[1] * opts.gridWidth)

  var potentialNeighbors = [
    // Above
    currentTile[0], currentTile[1] + 1,
    // Below
    currentTile[0], currentTile[1] - 1,
    // Left
    currentTile[0] - 1, currentTile[1],
    // Right
    currentTile[0] + 1, currentTile[1]
  ]

  // Upper right
  pushDiagonalTile(1, 1)
  // Lower Right
  pushDiagonalTile(1, -1)
  // Lower left
  pushDiagonalTile(-1, -1)
    // Upper left
  pushDiagonalTile(-1, 1)

  function pushDiagonalTile (offsetX, offsetY) {
    var firstCrossedTileIndex = ((currentTile[0]) % opts.gridWidth) + ((currentTile[1] + offsetY) * opts.gridWidth)
    var secondCrossedTileIndex = ((currentTile[0] + offsetX) % opts.gridWidth) + ((currentTile[1]) * opts.gridWidth)
    if (opts.dontCrossAboveCost !== 0 && !opts.dontCrossAboveCost) {
      potentialNeighbors.push(currentTile[0] + offsetX)
      potentialNeighbors.push(currentTile[1] + offsetY)
    } else if (
      opts.grid[firstCrossedTileIndex] <= opts.dontCrossAboveCost &&
      opts.grid[secondCrossedTileIndex] <= opts.dontCrossAboveCost
    ) {
      potentialNeighbors.push(currentTile[0] + offsetX)
      potentialNeighbors.push(currentTile[1] + offsetY)
    }
  }

  // TODO: This is probably slow since it creates a new array
  potentialNeighbors = potentialNeighbors
  .filter(function (potentialNeighbor, index) {
    // If this is an off number index and the even number index
    // right before it was accepted then this tile is accepted
    if (index % 2) {
      return acceptedIndices[index - 1]
    }

    var potentialNeighborIndexInGrid = (potentialNeighbor % opts.gridWidth) + (potentialNeighbors[index + 1] * opts.gridWidth)

    if (
      // Potential neighbor is within the corners of the opts.grid
      potentialNeighbor >= lowestColumn &&
        potentialNeighbors[index + 1] >= lowestRow &&
          potentialNeighbor <= highestColumn &&
            potentialNeighbors[index + 1] <= highestRow &&
              // Value of potentialNeighbor is equal to zero
              opts.isNextTileTraversable(opts.grid, currentTileIndex, potentialNeighborIndexInGrid)
    ) {
      acceptedIndices[index] = true
      return true
    }
  })

  return potentialNeighbors
}

// For our diagonal and orthogonal movement heuristic we use the chebychev distance
// @see https://en.wikipedia.org/wiki/Chebyshev_distance
function heuristic (start, end) {
  return Math.max(Math.abs(start.tile[0] - end[0]), Math.abs(start.tile[1] - end[1])) +
    start.cost
}
