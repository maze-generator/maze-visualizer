// a pipe-maze is much more simple to make.
// a player must follow lines to complete the maze.
// while less traditional, it is very easy to make.
// each vertex determinse a unicode character.
export const createPipeGraphic = (graph) => {
	// initialize result string with linebreak.
	let graphic = '\n'

	// loop through maze.
	for (const [id, cell] of graph.data.entries()) {
		const passages = cell.passages
		graphic += getGlyph(passages)

		// add line break if end of line is reached
		if (graph.findCoordinates(id)[0] === graph.dimensions[0]-1) {
			graphic += '\n'
		}
	}

	return graphic
}

// an edge-maze is a traditional-looking maze.
// a player must follow the space between lines to finish.
// however, this algorithm is also more complex.
// it must look at 4 nodes to determine 1 unicode glyph.
export const createEdgeGraphic = (graph) => {
	// store result item
	let result = ''

	// the padding helps analyze corners and boundaries.
	const [length, height] = graph.dimensions
	const paddedLength = length + 2
	const paddedHeight = height + 2
	const paddedMaze = new Array(paddedLength * paddedHeight).fill(null)

	// graphics are ultimately what we are aiming to find.
	const graphicLength = length + 1
	const graphicHeight = height + 1
	const graphicMaze = new Array(graphicLength * graphicHeight).fill(null)

	// this thing preps for calculations with graphics.
	for (let [locationStr, reference] of Object.entries(paddedMaze)) {
		const location = parseInt(locationStr)
		// determine row and column
		const row = Math.floor(location / paddedLength)
		const column = location % (paddedLength)

		// checks if the item is padding for the boundary.
		if ( row !== 0
			&& column !== 0
			&& row !== paddedHeight - 1
			&& column !== paddedLength - 1
		) {
			// This location has data; its not just padding.
			reference = location - paddedLength + 1 - row * 2
			paddedMaze[location] = reference
		}
	}

	// this thing calculates the graphics.
	for (const [locationStr, reference] of Object.entries(graphicMaze)) {
		let location = parseInt(locationStr)
		// determine row and column
		const row = location // (graphicLength)
		const column = location % (graphicLength)
		location = location + row

		// determines locations of items in the paddedMaze.
		const nwLoc = paddedMaze[location]
		const neLoc = paddedMaze[location + 1]
		const swLoc = paddedMaze[location + paddedLength]
		const seLoc = paddedMaze[location + paddedLength + 1]

		// initialize hallway passageways.
		// if there is a passway, then its true, else false.
		// `null` indicates an undeterminate value.
		let nHall = null
		let sHall = null
		let eHall = null
		let wHall = null

		/* this section is looking at edge pieces.
		there is only empty space beyond an edge.
		these ternary operators determines this. */
		// north boundary
		if ( nwLoc !== null
			&& neLoc !== null
		) {
			nHall = true
		}
		// south boundary
		if ( swLoc !== null
			&& seLoc !== null
		) {
			sHall = true
		}
		// east boundary
		if ( neLoc !== null
			&& seLoc !== null
		) {
			eHall = true
		}
		// west boundary
		if ( nwLoc !== null
			&& swLoc !== null
		) {
			wHall = true
		}

		/*
		verify if there is a path in any direction.
		remember, this glyph represents a wall, not a space.
		this is checking each path adjacent to the wall.
		*/
		// north path
		if ( neLoc !== null
			&& neLoc !== undefined
			&& nwLoc !== null
			&& nwLoc !== undefined
		) {
			const east = graph.data[neLoc]
			const west = graph.data[nwLoc]
			if ( east.neighbors['west'] === west
				&& west.neighbors['east'] === east
			) {
				nHall = true
			}
		}
		// south path
		if ( seLoc !== null
			&& seLoc !== undefined
			&& swLoc !== null
			&& swLoc !== undefined
		) {
			const east = graph.data[seLoc]
			const west = graph.data[swLoc]
			if ( east.neighbors['west'] === west
				&& west.neighbors['east'] === east
			) {
				sHall = true
			}
		}
		// east path
		if ( neLoc !== null
			&& neLoc !== undefined
			&& seLoc !== null
			&& seLoc !== undefined
		) {
			const north = graph.data[neLoc]
			const south = graph.data[seLoc]
			if ( north.neighbors['south'] === south
				&& south.neighbors['north'] === north
			) {
				eHall = true
			}
		}
		// west path
		if ( nwLoc !== null
			&& nwLoc !== undefined
			&& swLoc !== null
			&& swLoc !== undefined
		) {
			const north = graph.data[nwLoc]
			const south = graph.data[swLoc]
			if ( north.neighbors['south'] === south
				&& south.neighbors['north'] === north
			) {
				wHall = true
			}
		}

		// add a line break if its an end-of-line.
		if (location % paddedLength === 0 && location !== 0) {
			result += '\n'
		}
		// construct passages object
		const passages = {
			'north': !nHall,
			'south': !sHall,
			'east': !eHall,
			'west': !wHall,
		}

		// get unicode glyph symbol box-drawing element.
		result += getGlyph(passages, 'edge')
	}
	// return maze drawing.
	return result
}

const getGlyph = (
	passages,
	type = 'pipe',
) => {

	// this function returns a maze drawing character.
	let glyph = ''

	// deconstruct cell.
	const {north, south, east, west} = passages

	// four passages
	if (north && south && east && west) {
		glyph = '┼─'
	}

	// three passages
	else if (south && east && west && !(north)) {
		glyph = '┬─'
	}
	else if (north && east && west && !(south)) {
		glyph = '┴─'
	}
	else if (north && south && west && !(east)) {
		glyph = '┤ '
	}
	else if (north && south && east && !(west)) {
		glyph = '├─'
	}

	// two passages
	else if (north && south && !(east || west)) {
		glyph = '│ '
	}
	else if (north && east && !(south || west)) {
		glyph = '└─'
	}
	else if (north && west && !(south || east)) {
		glyph = '┘ '
	}
	else if (south && east && !(north || west)) {
		glyph = '┌─'
	}
	else if (south && west && !(north || east)) {
		glyph = '┐ '
	}
	else if (east && west && !(north || south)) {
		glyph = '──'
	}

	// one passage
	else if (north && !(south || east || west)) {
		glyph = '╵ '
	}
	else if (south && !(north || east || west)) {
		glyph = '╷ '
	}
	else if (east && !(north || south || west)) {
		glyph = '╶─'
	}
	else if (west && !(north || south || east)) {
		glyph = '╴ '
	}

	// zero passages
	else if (!(north || south || east || west)) {
		glyph = '  '
	}

	return glyph
}
