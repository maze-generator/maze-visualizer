/* EDGED TEXT GRAPHIC FUNCTION */
// Conceptually, an edge maze is much more simple to make.
// However it is not the conventional maze style.
// Players must follow edge-lines to complete the maze.
// This is opposed to a traditional pipe-style maze.
//
// While less traditional, it has an easier function.
// Each "vertex", or space on the maze,
// 	is represented by one single unicode character.

export const createEdgedTextGraphic = (graph) => {
	// Our return value is going to be a multi-line string.
	// Here we'll initialize the graphic with a linebreak.
	let graphic = '\n'

	// Loop through each cell of the maze or graph.
	for (const [id, cell] of graph.data.entries()) {
		// Get the symbol that represents this cell, and add it.
		graphic += getGlyph(cell.passages)

		// If the end of the row is reached, add a new visual row.
		if (graph.findCoordinates(id)[0] === graph.dimensions[0] - 1) {
			// We can add a new row with a new linebreak.
			graphic += '\n'
		}
	}

	// That's it!
	return graphic
}

/* PIPED TEXT GRAPHIC FUNCTION */
// A pipe maze is a traditional-looking maze.
// In order to complete this style of maze,
// 	players must travel the empty space between walls.
//
// The algorithm to make this with unicode is complex.
// We must look at 4 nodes to determine a single wall glyph!
//
// You see, an intersection in an edge-maze looks like this:
//   ╷
// ──┼──
//   ╵
// ^^^^^ it sort of looks like a plus.
// Maybe a representation of an intersection on a road map.
// This is way easier to code out.
//
// But with a pipe-maze, it uses empty spaces, like this:
//   ╷ ╷
// ──┘ └──
// ──┐ ┌──
//   ╵ ╵
// ^^^^^^^ it has empty spaces!
// It looks like the birds-eye view of an intersection.
// Figuring out the symbol for the corners is difficult.

export const createPipedTextGraphic = (graph) => {
	// Our return value is going to be a multi-line string.
	// Here we'll initialize the graphic with a linebreak.
	let graphic = '\n'

	// == NOTE ==
	// For this problem, we'll analyze four nodes at a time.
	// To determine the shape of a wall, we'll have to know
	// 	whether the northeast, northwest, southeast,
	// 	and southwest nodes are connected -- or not.
	//
	// The first edge case you will run into are cells with
	// 	void neighbors, like nodes at corners have.
	// They are neighboring nothing; the edge of the map!
	//
	// We have to represent those void areas to still come up
	// 	with walls that go all the way around the graphic.

	// We'll first determine the "padding" for the edges.
	// the padding helps analyze corners and boundaries.
	// Remember; the graph is 2D (length, height).
	const [length, height] = graph.dimensions
	const paddedLength = length + 2
	const paddedHeight = height + 2
	const paddedMaze = new Array(paddedLength * paddedHeight).fill(null)

	// The graphics are ultimately what we are aiming to find.
	// This following variables stores info about graphics.
	//
	// Notice there is a "+1" length for this array, NOT "+2".
	// It's because the walls are BETWEEN cells.
	// That's including void cells as mentioned earlier.
	const graphicLength = length + 1
	const graphicHeight = height + 1

	// This thing preps for calculations with graphics.
	for (let [locationStr, reference] of Object.entries(paddedMaze)) {
		const location = parseInt(locationStr)

		// Determine cell's row and column.
		// Remember: if length of a row is 10,
		// 	then columns 0 and 11 are void.
		const row = Math.floor(location / paddedLength)
		const column = location % (paddedLength)

		// Check if the node is just padding for the boundaries.
		if ( row !== 0
			&& column !== 0
			&& row !== paddedHeight - 1
			&& column !== paddedLength - 1
		) {
			// This location has data; its not just padding!
			// Determine the "real" cell reference ID.
			reference = location - paddedLength + 1 - row * 2

			// Set the reference from null to this ID.
			paddedMaze[location] = reference
		}
	}


	// This thing calculates the graphics.
	// We'll iterate every length item, plus length for nulls.
	for (
		let location = 0; // initializer
		location < graphicLength * graphicHeight + length; // while clause
		location++ // iterator
	) {
		// Determine graphic symbol's row and column.
		// There are no void graphic locations.
		const row = Math.floor(location / graphicLength)
		const column = location % (graphicLength + 1)

		// Determine nearby IDs of nodes in the paddedMaze.
		// These are not ACTUAL cells. They are "padded".
		// This means, it includes edge-nodes or void cells.
		// Non-void cells reference an actual graph cell!
		const nwCellID = paddedMaze[location]
		const neCellID = paddedMaze[location + 1]
		const swCellID = paddedMaze[location + paddedLength]
		const seCellID = paddedMaze[location + paddedLength + 1]

		// Ignore void situations (between two lines)
		if ( nwCellID === null
			&& neCellID === null
			&& swCellID === null
			&& seCellID === null
		) {
			continue
		}

		// Initialize hallway passageways as booleans.
		// If there is a passway, then its true, else false.
		// `null` indicates an undeterminate value.
		let nHall = null
		let sHall = null
		let eHall = null
		let wHall = null

		/* this section is looking at edge pieces.
		there is only empty space beyond an edge.
		these ternary operators determines this. */
		// north boundary
		if ( nwCellID === null
			&& neCellID === null
		) {
			nHall = true
		}
		// south boundary
		if ( swCellID === null
			&& seCellID === null
		) {
			sHall = true
		}
		// east boundary
		if ( neCellID === null
			&& seCellID === null
		) {
			eHall = true
		}
		// west boundary
		if ( nwCellID === null
			&& swCellID === null
		) {
			wHall = true
		}

		/*
		verify if there is a path in any direction.
		remember, this glyph represents a wall, not a space.
		this is checking each path adjacent to the wall.
		*/

		// north path
		if ( nwCellID !== null
			&& neCellID !== null
		) {
			const nwCell = graph.data[nwCellID]
			const neCell = graph.data[neCellID]
			if ( nwCell.neighbors['east'] === neCell.id
				&& neCell.neighbors['west'] === nwCell.id
				&& nwCell.passages['east']
				&& neCell.passages['west']
			) {
				nHall = true
			}
		}

		// south path
		if ( swCellID !== null
			&& seCellID !== null
		) {
			const swCell = graph.data[swCellID]
			const seCell = graph.data[seCellID]
			if ( swCell.neighbors['east'] === seCell.id
				&& seCell.neighbors['west'] === swCell.id
				&& swCell.passages['east']
				&& seCell.passages['west']
			) {
				sHall = true
			}
		}

		// west path
		if ( nwCellID !== null
			&& swCellID !== null
		) {
			const nwCell = graph.data[nwCellID]
			const swCell = graph.data[swCellID]
			if ( nwCell.neighbors['south'] === swCell.id
				&& swCell.neighbors['north'] === nwCell.id
				&& nwCell.passages['south']
				&& swCell.passages['north']
			) {
				wHall = true
			}
		}

		// east path
		if ( neCellID !== null
			&& seCellID !== null
		) {
			const neCell = graph.data[neCellID]
			const seCell = graph.data[seCellID]
			if ( neCell.neighbors['south'] === seCell.id
				&& seCell.neighbors['north'] === neCell.id
				&& neCell.passages['south']
				&& seCell.passages['north']
			) {
				eHall = true
			}
		}

		// add a line break if its an end-of-line.
		if (location % paddedLength === 0) {
			graphic += '\n'
		}

		// construct passages object
		const passages = {
			'north': !nHall,
			'south': !sHall,
			'east': !eHall,
			'west': !wHall,
		}

		// get unicode glyph symbol box-drawing element.
		graphic += getGlyph(passages, 'edge')
	}

	// return maze drawing.
	return graphic
}


const getGlyph = (passages) => {

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
