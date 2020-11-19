import Graph, {Cell} from 'tessellatron'

// a pipe-maze is much more simple to make.
// a player must follow lines to complete the maze.
// while less traditional, it is very easy to make.
// each vertex determinse a unicode character.
export const createPipeMaze = (
	graph: any
) => {
	// initialize result string with linebreak.
	let graphic: string = '\n'

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

export const edge_maze = (graph: any) => {
	/*
	an edge-maze is a traditional-looking maze.
	a player must follow the space between lines to finish.
	however, this algorithm is also more complex.
	it must look at 4 nodes to determine 1 unicode glyph.
	*/

	// HACK reassigning self for convenience.
	const self = graph

	// store result item
	let result = ''
	// the padding helps analyze corners and boundaries.
	const padded_length = self.length + 2
	const padded_height = self.height + 2
	const padded_maze = new Array(padded_length * padded_height).fill(null)

	// graphics are ultimately what we are aiming to find.
	const graphic_length = self.length + 1
	const graphic_height = self.height + 1
	const graphic_maze = new Array(graphic_length * graphic_height).fill(null)

	// this thing preps for calculations with graphics.
	for (let [locationStr, reference] of Object.entries(padded_maze)) {
		const location = parseInt(locationStr)
		// determine row and column
		const row = Math.floor(location / padded_length)
		const column = location % (padded_length)

		// checks if the item is padding for the boundary.
		if (row == 0
			|| column == 0
			|| row == padded_height - 1
			|| column == padded_length - 1) {
			// pass
		} else {
			reference = location - padded_length + 1 - row * 2
			padded_maze[location] = reference
		}
	}

	// this thing calculates the graphics.
	for (const [locationStr, reference] of Object.entries(graphic_maze)) {
		let location = parseInt(locationStr)
		// determine row and column
		const row = location // (graphic_length)
		const column = location % (graphic_length)
		location = location + row

		// determines locations of items in the padded_maze.
		const nw_loc = padded_maze[location]
		const ne_loc = padded_maze[location + 1]
		const sw_loc = padded_maze[location + padded_length]
		const se_loc = padded_maze[location + padded_length + 1]

		// initialize hallway passageways.
		// if there is a passway, then its true, else false.
		// `null` indicates an undeterminate value.
		let n_hall = null
		let s_hall = null
		let e_hall = null
		let w_hall = null

		/* this section is looking at edge pieces.
		there is only empty space beyond an edge.
		these ternary operators determines this. */
		// north boundary
		if (nw_loc !== null
				&& ne_loc !== null) {
			n_hall = true}
		// south boundary
		if (sw_loc !== null
				&& se_loc !== null) {
			s_hall = true}
		// east boundary
		if (ne_loc !== null
				&& se_loc !== null) {
			e_hall = true}
		// west boundary
		if (nw_loc !== null
				&& sw_loc !== null) {
			w_hall = true}

		/*
		verify if there is a path in any direction.
		remember, this glyph represents a wall, not a space.
		this is checking each path adjacent to the wall.
		*/
		// north path
		if (ne_loc !== null && nw_loc !== null) {
			const east = self.maze[ne_loc]
			const west = self.maze[nw_loc]
			if (east.neighbors['west'] == west
				&& west.neighbors['east'] == east) {
				n_hall = true
			}
		}
		// south path
		if (se_loc !== null && sw_loc !== null) {
			const east = self.maze[se_loc]
			const west = self.maze[sw_loc]
			if (east.neighbors['west'] == west
				&& west.neighbors['east'] == east) {
				s_hall = true
			}
		}
		// east path
		if (ne_loc !== null && se_loc !== null) {
			const north = self.maze[ne_loc]
			const south = self.maze[se_loc]
			if (north.neighbors['south'] == south
				&& south.neighbors['north'] == north) {
				e_hall = true
			}
		}
		// west path
		if (nw_loc !== null && sw_loc !== null) {
			const north = self.maze[nw_loc]
			const south = self.maze[sw_loc]
			if (north.neighbors['south'] == south
				&& south.neighbors['north'] == north) {
				w_hall = true
			}
		}

		// add a line break if its an end-of-line.
		if (location % padded_length == 0 && location != 0) {
			result += '\n'
		}
		// construct passages object
		const passages = {
			'north': !n_hall,
			'south': !s_hall,
			'east': !e_hall,
			'west': !w_hall,
		}

		// get unicode glyph symbol box-drawing element.
		result += getGlyph(passages, 'edge')
	}
	// return maze drawing.
	return result
}

const getGlyph = (
	passages: Record<string, boolean>,
	type: string = 'pipe',
): string => {

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
