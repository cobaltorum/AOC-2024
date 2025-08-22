import fs from "node:fs";

/**
 * Parses the input file into a 2D number grid
 * @param filename Path to the input file
 * @returns Object containing the grid and its dimensions
 */
function parseInput(filename: string): { grid: number[][]; rows: number; cols: number } {
	const lines = fs.readFileSync(filename, "utf8").trim().split("\n");
	const grid = lines.map(line => line.split("").map(Number));
	return { grid, rows: grid.length, cols: grid[0].length };
}

const { grid, rows, cols } = parseInput("input.txt");

const directions = [
	[-1, 0],
	[1, 0],
	[0, -1],
	[0, 1]
];

/**
 * Checks if coordinates are within grid bounds
 * @param r Row coordinate
 * @param c Column coordinate
 * @returns True if coordinates are valid
 */
function isInBounds(r: number, c: number): boolean {
	return r >= 0 && r < rows && c >= 0 && c < cols;
}

/**
 * Finds all trailheads (positions with height 0) in the grid
 * @returns Array of [row, col] coordinates for all trailheads
 */
function getTrailheads(): [number, number][] {
	const trailheads: [number, number][] = [];
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			if (grid[r][c] === 0) {
				trailheads.push([r, c]);
			}
		}
	}
	return trailheads;
}

/**
 * Creates a coordinate key string for sets and maps
 * @param r Row coordinate
 * @param c Column coordinate
 * @returns String key in format "r,c"
 */
function coordinateKey(r: number, c: number): string {
	return `${r},${c}`;
}

function part1() {
	/**
	 * Counts the number of unique height-9 positions reachable from a trailhead
	 * @param r0 Starting row coordinate
	 * @param c0 Starting column coordinate
	 * @returns Number of unique reachable peaks
	 */
	function countReachableNines(r0: number, c0: number): number {
		const visited = new Set<string>();
		const queue: [number, number][] = [[r0, c0]];
		visited.add(coordinateKey(r0, c0));
		const nines = new Set<string>();

		while (queue.length > 0) {
			const [r, c] = queue.shift()!;
			const height = grid[r][c];

			if (height === 9) {
				nines.add(coordinateKey(r, c));
				continue;
			}

			for (const [dr, dc] of directions) {
				const nr = r + dr;
				const nc = c + dc;

				if (!isInBounds(nr, nc)) continue;

				const neighborKey = coordinateKey(nr, nc);
				if (grid[nr][nc] === height + 1 && !visited.has(neighborKey)) {
					visited.add(neighborKey);
					queue.push([nr, nc]);
				}
			}
		}

		return nines.size;
	}

	const trailheads = getTrailheads();
	let sum = 0;
	for (const [r, c] of trailheads) {
		sum += countReachableNines(r, c);
	}
	console.log("Part 1:", sum);
}

function part2() {
	const memo = new Map<string, number>();

	/**
	 * Counts the number of distinct paths from a position to any height-9 position
	 * @param r Row coordinate
	 * @param c Column coordinate
	 * @returns Number of distinct paths to peaks
	 */
	function countDistinctPaths(r: number, c: number): number {
		const key = coordinateKey(r, c);
		if (memo.has(key)) return memo.get(key)!;

		const height = grid[r][c];
		if (height === 9) {
			memo.set(key, 1);
			return 1;
		}

		let total = 0;
		for (const [dr, dc] of directions) {
			const nr = r + dr;
			const nc = c + dc;

			if (!isInBounds(nr, nc)) continue;

			if (grid[nr][nc] === height + 1) {
				total += countDistinctPaths(nr, nc);
			}
		}

		memo.set(key, total);
		return total;
	}

	const trailheads = getTrailheads();
	let sum = 0;
	for (const [r, c] of trailheads) {
		sum += countDistinctPaths(r, c);
	}
	console.log("Part 2:", sum);
}

part1();
part2();
