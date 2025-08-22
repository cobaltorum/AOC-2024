import fs from "fs";

type Robot = {
	pos: [number, number];
	vel: [number, number];
};

/**
 * Parses the input file and grid dimensions
 * @param filename Path to the input file
 * @returns Object containing robots array and grid dimensions
 */
function parseInput(filename: string): { robots: Robot[]; width: number; height: number } {
	const lines = fs.readFileSync(filename, "utf8").split("\n");

	// Configuration based on input file
	const isExample = filename.includes("example");
	const width = isExample ? 11 : 101;
	const height = isExample ? 7 : 103;

	const robots: Robot[] = lines.map(line => {
		const [pos, vel] = line.split(" ");
		const [px, py] = pos.replace("p=", "").split(",").map(Number);
		const [vx, vy] = vel.replace("v=", "").split(",").map(Number);
		return {
			pos: [px, py] as [number, number],
			vel: [vx, vy] as [number, number]
		};
	});

	return { robots, width, height };
}

const { robots, width: WIDTH, height: HEIGHT } = parseInput("input.txt");

/**
 * Calculates robot positions after a given number of steps with wraparound
 * @param robots Array of robots to move
 * @param steps Number of time steps to simulate
 * @returns New array of robots with updated positions
 */
function moveRobots(robots: Robot[], steps: number): Robot[] {
	return robots.map(robot => {
		const x = robot.pos[0] + robot.vel[0] * steps;
		const y = robot.pos[1] + robot.vel[1] * steps;
		return {
			pos: [((x % WIDTH) + WIDTH) % WIDTH, ((y % HEIGHT) + HEIGHT) % HEIGHT],
			vel: robot.vel
		};
	});
}

/**
 * Counts robots in each of the four quadrants, excluding center lines
 * @param robots Array of robots to analyze
 * @returns Array of counts for each quadrant [top-left, top-right, bottom-left, bottom-right]
 */
function getQuadrantCounts(robots: Robot[]): number[] {
	const quadrants = [0, 0, 0, 0];
	const midX = Math.floor(WIDTH / 2);
	const midY = Math.floor(HEIGHT / 2);

	robots.forEach(robot => {
		const [x, y] = robot.pos;
		// Skip robots on center lines
		if (x === midX || y === midY) return;

		if (x < midX) {
			if (y < midY) quadrants[0]++; // Top-left
			else quadrants[2]++; // Bottom-left
		} else {
			if (y < midY) quadrants[1]++; // Top-right
			else quadrants[3]++; // Bottom-right
		}
	});

	return quadrants;
}

/**
 * Creates a visual grid representation of robot positions
 * @param robots Array of robots to visualize
 * @returns String representation of the grid
 */
function visualizeGrid(robots: Robot[]): string {
	const grid = Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => "."));

	robots.forEach(robot => {
		const [x, y] = robot.pos;
		grid[y][x] = "#";
	});

	return grid.map(row => row.join("")).join("\n");
}

/**
 * Counts how many robots have at least one adjacent neighbor
 * @param robots Array of robots to analyze
 * @returns Number of robots that have neighbors
 */
function countRobotsWithNeighbors(robots: Robot[]): number {
	return robots.filter(robot => {
		const [x, y] = robot.pos;
		return robots.some(other => {
			if (other === robot) return false;
			const [ox, oy] = other.pos;
			const dx = Math.abs(x - ox);
			const dy = Math.abs(y - oy);
			return dx <= 1 && dy <= 1; // Adjacent including diagonals
		});
	}).length;
}

function part1(): number {
	const SimulationTime = 100;

	const finalPositions = moveRobots(robots, SimulationTime);
	const quadrantCounts = getQuadrantCounts(finalPositions);
	return quadrantCounts.reduce((acc, count) => acc * count);
}

function part2(): number {
	const ClusteringThreshold = 0.7;
	let seconds = 0;

	while (true) {
		const positions = moveRobots(robots, seconds);
		const robotsWithNeighbors = countRobotsWithNeighbors(positions);

		// If most robots have neighbors, they might be forming a pattern
		if (robotsWithNeighbors > positions.length * ClusteringThreshold) {
			console.log(
				`\nPotential message found at second ${seconds} (${robotsWithNeighbors}/${positions.length} robots clustered):`
			);
			console.log(visualizeGrid(positions));
			return seconds;
		}

		seconds++;
	}
}

console.log("part 1:", part1());
console.log("part 2:", part2());
