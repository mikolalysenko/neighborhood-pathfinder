var orthogonalMovement = require('./orthagonal-movement.js')
var diagonalMovement = require('./diagonal-movement.js')

module.exports = {
  findPath: findPath,
  // TODO: Move the defaults in here
  helpers: {
  },
  getOrthoganalNeighbors: orthogonalMovement.getNeighbors,
  orthagonalHeuristic: orthogonalMovement.heuristic,
  getOrthogonalAndDiagonalNeighbors: diagonalMovement.getNeighbors,
  orthogonalAndDiagonalHeuristic: diagonalMovement.heuristic,
  calculateCost: function (grid, tileIndex) { return grid[tileIndex] }
}

/**
 * Use the A* search algorithm to find a path between start and end coordinate
 */
function findPath (opts) {
  var cameFrom = {}
  cameFrom[`${opts.start[0]}x${opts.start[1]}`] = []
  var costSoFar = {}
  costSoFar[`${opts.start[0]}x${opts.start[1]}`] = 0

  // TODO: After we have benchmarks see if we can find or make a faster implementation for our needs
  var Heap = require('heap')
  var frontier = new Heap(function (a, b) {
    return opts.heuristic(a.tile, opts.end) > opts.heuristic(b.tile, opts.end)
  })
  frontier.push({
    cost: 0,
    tile: opts.start
  })

  var current = frontier.pop()
  while (true) {
    // If the frontier is empty and we haven't yet found a path then there
    // is no valid path and we return null
    if (!current) {
      return null
    }

    var neighbors = opts.getNeighbors(current.tile, opts)

    if (current.tile[0] === opts.end[0] && current.tile[1] === opts.end[1]) {
      break
    }

    for (var i = 0; i < neighbors.length; i += 2) {
      var newCost = costSoFar[current.tile[0] + 'x' + current.tile[1]] + 1
      if (
        (
          !cameFrom[`${neighbors[i]}x${neighbors[i + 1]}`] ||
            costSoFar[neighbors[i] + 'x' + neighbors[i + 1]] > newCost
        ) &&
          (!opts.maxCost || newCost < opts.maxCost)
      ) {
        costSoFar[neighbors[i] + 'x' + neighbors[i + 1]] = newCost
        cameFrom[`${neighbors[i]}x${neighbors[i + 1]}`] = current.tile
        frontier.push({tile: [neighbors[i], neighbors[i + 1]], cost: newCost})
      }
    }

    current = frontier.pop()
  }

  var path = []
  var nodeSource = opts.end
  while (nodeSource) {
    // TODO: Make it so that we don't need this check
    if (nodeSource.length > 0) {
      // Pushing them backwards since we're reversing
      // TODO: If nodeSource is an array we will know the length and won't need to reverse
      path.push(nodeSource[1])
      path.push(nodeSource[0])
    }
    nodeSource = cameFrom[nodeSource[0] + 'x' + nodeSource[1]]
  }

  return path.reverse()
}

// TODO: Move into orthoganal-movement.js
