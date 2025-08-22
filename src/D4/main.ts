import fs from "node:fs";

/**
 * Reads input file and converts it to a 2D character grid
 * @param filename Path to the input file
 * @returns 2D array of characters representing the grid
 */
function parseGrid(filename: string): string[][] {
	const lines = fs.readFileSync(filename, "utf8").split("\n");
	return lines.map(line => line.split(""));
}

const grid = parseGrid("example.txt");

/**
 * Safely gets a character from the grid at given coordinates
 * @param x - X coordinate (column)
 * @param y - Y coordinate (row)
 * @returns Character at position or empty string if out of bounds
 */
function getPoint(x: number, y: number): string {
	return grid[y]?.[x] || "";
}

function partA() {
	/**
	 * Generates strings in all 8 directions from a given point (4 characters each)
	 * @param x Starting X coordinate
	 * @param y Starting Y coordinate
	 * @returns Array of 8 strings, one for each direction
	 */
	function generateAllDirections(x: number, y: number): string[] {
		return [
			getPoint(x, y) + getPoint(x + 1, y) + getPoint(x + 2, y) + getPoint(x + 3, y), // Right
			getPoint(x, y) + getPoint(x - 1, y) + getPoint(x - 2, y) + getPoint(x - 3, y), // Left
			getPoint(x, y) + getPoint(x, y + 1) + getPoint(x, y + 2) + getPoint(x, y + 3), // Down
			getPoint(x, y) + getPoint(x, y - 1) + getPoint(x, y - 2) + getPoint(x, y - 3), // Up
			getPoint(x, y) + getPoint(x + 1, y + 1) + getPoint(x + 2, y + 2) + getPoint(x + 3, y + 3), // Down-right
			getPoint(x, y) + getPoint(x - 1, y + 1) + getPoint(x - 2, y + 2) + getPoint(x - 3, y + 3), // Down-left
			getPoint(x, y) + getPoint(x + 1, y - 1) + getPoint(x + 2, y - 2) + getPoint(x + 3, y - 3), // Up-right
			getPoint(x, y) + getPoint(x - 1, y - 1) + getPoint(x - 2, y - 2) + getPoint(x - 3, y - 3) // Up-left
		];
	}

	/**
	 * Counts how many times "XMAS" appears starting from a given coordinate
	 * @param x X coordinate to check from
	 * @param y Y coordinate to check from
	 * @returns Number of "XMAS" patterns found (0 if starting point isn't 'X')
	 */
	function countXmasFromPoint(x: number, y: number): number {
		if (getPoint(x, y) !== "X") return 0;
		return generateAllDirections(x, y).filter(dir => dir === "XMAS").length;
	}

	let total = 0;
	for (let y = 0; y < grid.length; y++) {
		for (let x = 0; x < grid[0].length; x++) {
			total += countXmasFromPoint(x, y);
		}
	}
	console.log("Part 1:", total);
}

function partB() {
	/**
	 * Gets the two diagonal strings passing through a given point
	 * @param x Center X coordinate
	 * @param y Center Y coordinate
	 * @returns Array of 2 strings representing the diagonals
	 */
	function getDiagonals(x: number, y: number): string[] {
		return [
			getPoint(x - 1, y - 1) + getPoint(x, y) + getPoint(x + 1, y + 1), // Top-left to bottom-right
			getPoint(x - 1, y + 1) + getPoint(x, y) + getPoint(x + 1, y - 1) // Bottom-left to top-right
		];
	}

	/**
	 * Checks if the center point forms an X-MAS pattern (both diagonals spell MAS or SAM)
	 * @param x Center X coordinate
	 * @param y Center Y coordinate
	 * @returns True if both diagonals form valid MAS patterns
	 */
	function isXmasPattern(x: number, y: number): boolean {
		return getDiagonals(x, y).every(diagonal => diagonal === "MAS" || diagonal === "SAM");
	}

	let total = 0;
	// Skip edges since we need space for diagonals
	for (let y = 1; y < grid.length - 1; y++) {
		for (let x = 1; x < grid[0].length - 1; x++) {
			if (isXmasPattern(x, y)) {
				total++;
			}
		}
	}
	console.log("Part 2:", total);
}

partA();
partB();
