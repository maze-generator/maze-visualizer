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
		graphic += getGlyph(cell)

		// add line break if end of line is reached
		if (graph.findCoordinates(id)[0] === graph.dimensions[0]-1) {
			graphic += '\n'
		}
	}

	return graphic
}

const getGlyph = (
	cell: Cell,
	type: string = 'pipe',
): string => {

	// this function returns a maze drawing character.
	let pipe = ''
	let edge = ''

	// deconstruct cell.
	const {north, south, east, west} = cell.passages

	// four passages
	if (north && south && east && west) {
		edge = '  '
		pipe = '┼─'
	}

	// three passages
	else if (south && east && west && !(north)) {
		edge = '╵ '
		pipe = '┬─'
	}
	else if (north && east && west && !(south)) {
		edge = '╷ '
		pipe = '┴─'
	}
	else if (north && south && west && !(east)) {
		edge = '╶─'
		pipe = '┤ '
	}
	else if (north && south && east && !(west)) {
		edge = '╴ '
		pipe = '├─'
	}

	// two passages
	else if (north && south && !(east || west)) {
		edge = '──'
		pipe = '│ '
	}
	else if (north && east && !(south || west)) {
		edge = '┐ '
		pipe = '└─'
	}
	else if (north && west && !(south || east)) {
		edge = '┌─'
		pipe = '┘ '
	}
	else if (south && east && !(north || west)) {
		edge = '┘ '
		pipe = '┌─'
	}
	else if (south && west && !(north || east)) {
		edge = '└─'
		pipe = '┐ '
	}
	else if (east && west && !(north || south)) {
		edge = '│ '
		pipe = '──'
	}

	// one passage
	else if (north && !(south || east || west)) {
		edge = '┬─'
		pipe = '╵ '
	}
	else if (south && !(north || east || west)) {
		edge = '┴─'
		pipe = '╷ '
	}
	else if (east && !(north || south || west)) {
		edge = '┤ '
		pipe = '╶─'
	}
	else if (west && !(north || south || east)) {
		edge = '├─'
		pipe = '╴ '
	}

	// zero passages
	else if (!(north || south || east || west)) {
		edge = '┼─'
		pipe = '  '
	}

	if (type === 'edge') {
		return edge
	} else {
		return pipe
	}
}
