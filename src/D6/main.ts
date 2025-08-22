import fs from "node:fs";

/**
 * Parses the input file and extracts the grid, obstacles, and starting position
 * @param filename Path to the input file
 * @returns Object containing the parsed game state
 */
function parseInput(filename: string) {
	const lines = fs.readFileSync(filename, "utf8").split("\n");
	const grid = lines.map(line => line.split(""));
	const obstacles = new Set<string>();
	let start: [number, number] = [0, 0];

	grid.forEach((row, y) => {
		row.forEach((cell, x) => {
			if (cell === "#") obstacles.add(`${x},${y}`);
			if (cell === "^") start = [x, y];
		});
	});

	return { grid, obstacles, start };
}

const { grid, obstacles, start } = parseInput("input.txt");

const directions = {
	N: [0, -1],
	E: [1, 0],
	S: [0, 1],
	W: [-1, 0]
} as const;

const turns = {
	N: "E",
	E: "S",
	S: "W",
	W: "N"
} as const;

type Direction = keyof typeof directions;

/**
 * Calculates the next location and direction based on current position and obstacles
 * @param currentLocation Current [x, y] coordinates
 * @param currentDirection Current facing direction
 * @param extraObstacle Optional additional obstacle point as "x,y" string
 * @returns Either out of bounds indicator or next position/direction
 */
function getNextLocation(
	currentLocation: [number, number],
	currentDirection: Direction,
	extraObstacle?: string
):
	| { outOfBounds: true }
	| {
			nextLocation: [number, number];
			nextDirection: Direction;
			outOfBounds: false;
	  } {
	const nextX = currentLocation[0] + directions[currentDirection][0];
	const nextY = currentLocation[1] + directions[currentDirection][1];
	const nextPoint = `${nextX},${nextY}`;

	// Check if next position is in bounds
	const inBounds = nextX >= 0 && nextX < grid[0].length && nextY >= 0 && nextY < grid.length;

	if (!inBounds) {
		return { outOfBounds: true };
	}

	// Check if next position hits an obstacle
	if (obstacles.has(nextPoint) || extraObstacle === nextPoint) {
		// Turn right instead of moving
		return {
			nextLocation: currentLocation,
			nextDirection: turns[currentDirection],
			outOfBounds: false
		};
	}

	// Valid move forward
	return {
		nextLocation: [nextX, nextY],
		nextDirection: currentDirection,
		outOfBounds: false
	};
}

/**
 * Extracts unique coordinate points from a set of "x,y,direction" strings
 * @param visitedWithDirection Set of visited points including direction info
 * @returns Set of unique coordinate points as "x,y" strings
 */
function getUniqueCoordinates(visitedWithDirection: Set<string>): Set<string> {
	const uniquePoints = new Set<string>();
	visitedWithDirection.forEach(point => {
		const coords = point.split(",");
		uniquePoints.add(`${coords[0]},${coords[1]}`);
	});
	return uniquePoints;
}

function partA() {
	const visitedPoints = new Set<string>();
	let currentLocation = start;
	let currentDirection = "N" as Direction;

	while (true) {
		visitedPoints.add(`${currentLocation[0]},${currentLocation[1]},${currentDirection}`);

		const next = getNextLocation(currentLocation, currentDirection);
		if (next.outOfBounds) break;

		currentLocation = next.nextLocation;
		currentDirection = next.nextDirection;
	}

	const uniqueCoordinates = getUniqueCoordinates(visitedPoints);
	console.log("Part 1:", uniqueCoordinates.size);
}

/**
 * Checks if adding a new obstacle at the given position creates a loop in the guard's path
 * @param obstaclePosition [x, y] coordinates where to place the new obstacle
 * @returns True if the new obstacle creates a loop, false otherwise
 */
function createsLoop(obstaclePosition: [number, number]): boolean {
	// Can't place obstacle on existing obstacle or starting position
	const obstaclePoint = `${obstaclePosition[0]},${obstaclePosition[1]}`;
	if (obstacles.has(obstaclePoint) || (obstaclePosition[0] === start[0] && obstaclePosition[1] === start[1])) {
		return false;
	}

	const turnPoints = new Set<string>();
	let currentLocation = start;
	let currentDirection = "N" as Direction;

	while (true) {
		const next = getNextLocation(currentLocation, currentDirection, obstaclePoint);
		if (next.outOfBounds) return false;

		// Only track points where we turn (direction changes)
		if (next.nextDirection !== currentDirection) {
			const turnKey = `${currentLocation[0]},${currentLocation[1]},${currentDirection}`;
			if (turnPoints.has(turnKey)) {
				return true; // Found a loop
			}
			turnPoints.add(turnKey);
		}

		currentLocation = next.nextLocation;
		currentDirection = next.nextDirection;
	}
}

function partB() {
	let loopCount = 0;

	for (let y = 0; y < grid.length; y++) {
		for (let x = 0; x < grid[y].length; x++) {
			if (createsLoop([x, y])) {
				loopCount++;
			}
		}
	}

	console.log("Part 2:", loopCount);
}

partA();
partB();
