import fs from "node:fs";

type Cell = { x: number; y: number };
type Region = { cells: Cell[]; char: string };

/**
 * Parses the input file into a character grid
 * @param filename Path to the input file
 * @returns Object containing the grid and its dimensions
 */
function parseInput(filename: string): { grid: string[][]; height: number; width: number } {
	const lines = fs.readFileSync(filename, "utf8").trim().split("\n");
	const grid = lines.map(line => line.split(""));
	return { grid, height: grid.length, width: grid[0].length };
}

const { grid, height, width } = parseInput("input.txt");

const directions = [
	[0, -1],
	[1, 0],
	[0, 1],
	[-1, 0]
];

/**
 * Checks if coordinates are within grid bounds
 * @param x X coordinate
 * @param y Y coordinate
 * @returns True if coordinates are valid
 */
function inBounds(x: number, y: number): boolean {
	return x >= 0 && x < width && y >= 0 && y < height;
}

/**
 * Creates a coordinate key string for sets and maps
 * @param x X coordinate
 * @param y Y coordinate
 * @returns String key in format "x,y"
 */
function coordinateKey(x: number, y: number): string {
	return `${x},${y}`;
}

/**
 * Finds all connected regions in the grid using flood fill
 * @returns Array of regions, each containing cells and character type
 */
function findRegions(): Region[] {
	const visited = Array.from({ length: height }, () => Array(width).fill(false));
	const regions: Region[] = [];

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			if (!visited[y][x]) {
				visited[y][x] = true;
				const character = grid[y][x];
				const cells = [{ x, y }];
				const queue = [{ x, y }];

				// BFS to find all connected cells of the same character
				while (queue.length) {
					const { x: cx, y: cy } = queue.shift()!;
					directions.forEach(([dx, dy]) => {
						const nx = cx + dx;
						const ny = cy + dy;
						if (inBounds(nx, ny) && !visited[ny][nx] && grid[ny][nx] === character) {
							visited[ny][nx] = true;
							cells.push({ x: nx, y: ny });
							queue.push({ x: nx, y: ny });
						}
					});
				}

				regions.push({ cells, char: character });
			}
		}
	}

	return regions;
}

const regions = findRegions();

/**
 * Computes the perimeter of a region by counting exposed edges
 * @param region The region to analyze
 * @returns Total perimeter length
 */
function computePerimeter(region: Region): number {
	const cellSet = new Set(region.cells.map(c => coordinateKey(c.x, c.y)));
	let perimeter = 0;

	region.cells.forEach(({ x, y }) => {
		directions.forEach(([dx, dy]) => {
			const nx = x + dx;
			const ny = y + dy;
			if (!inBounds(nx, ny) || !cellSet.has(coordinateKey(nx, ny))) {
				perimeter++;
			}
		});
	});

	return perimeter;
}

/**
 * Creates a Union-Find data structure for grouping connected components
 * @param elements Array of element identifiers
 * @returns Object with union and countComponents methods
 */
function createUnionFind(elements: string[]) {
	const parent: Record<string, string> = {};
	const size: Record<string, number> = {};

	elements.forEach(e => {
		parent[e] = e;
		size[e] = 1;
	});

	function find(element: string): string {
		let p = element;
		while (p !== parent[p]) {
			parent[p] = parent[parent[p]]; // Path compression
			p = parent[p];
		}
		return p;
	}

	function union(a: string, b: string): void {
		const rootA = find(a);
		const rootB = find(b);
		if (rootA !== rootB) {
			if (size[rootA] < size[rootB]) {
				parent[rootA] = rootB;
				size[rootB] += size[rootA];
			} else {
				parent[rootB] = rootA;
				size[rootA] += size[rootB];
			}
		}
	}

	function countComponents(): number {
		const roots = elements.map(find);
		return new Set(roots).size;
	}

	return { union, countComponents };
}

/**
 * Parses a coordinate key back into x,y coordinates
 * @param key Coordinate key in format "x,y"
 * @returns Tuple of [x, y] coordinates
 */
function parseCoordinateKey(key: string): [number, number] {
	const [x, y] = key.split(",").map(Number);
	return [x, y];
}

/**
 * Groups adjacent edge segments into continuous sides
 * @param edgePositions Array of coordinate keys representing edge positions
 * @param isVertical True for vertical edges, false for horizontal
 * @returns Number of continuous sides
 */
function groupEdgeSegments(edgePositions: string[], isVertical: boolean): number {
	if (!edgePositions.length) return 0;

	const uf = createUnionFind(edgePositions);
	const positionSet = new Set(edgePositions);

	edgePositions.forEach(position => {
		const [x, y] = parseCoordinateKey(position);
		if (isVertical) {
			// Connect vertically adjacent edges
			const up = coordinateKey(x, y - 1);
			const down = coordinateKey(x, y + 1);
			if (positionSet.has(up)) uf.union(position, up);
			if (positionSet.has(down)) uf.union(position, down);
		} else {
			// Connect horizontally adjacent edges
			const left = coordinateKey(x - 1, y);
			const right = coordinateKey(x + 1, y);
			if (positionSet.has(left)) uf.union(position, left);
			if (positionSet.has(right)) uf.union(position, right);
		}
	});

	return uf.countComponents();
}

/**
 * Computes the number of sides of a region by analyzing edge continuity
 * @param region The region to analyze
 * @returns Total number of distinct sides
 */
function computeSides(region: Region): number {
	const cellSet = new Set(region.cells.map(c => coordinateKey(c.x, c.y)));

	const leftEdges: string[] = [];
	const rightEdges: string[] = [];
	const topEdges: string[] = [];
	const bottomEdges: string[] = [];

	// Collect all edge positions by direction
	region.cells.forEach(({ x, y }) => {
		const key = coordinateKey(x, y);
		if (!cellSet.has(coordinateKey(x - 1, y))) leftEdges.push(key);
		if (!cellSet.has(coordinateKey(x + 1, y))) rightEdges.push(key);
		if (!cellSet.has(coordinateKey(x, y - 1))) topEdges.push(key);
		if (!cellSet.has(coordinateKey(x, y + 1))) bottomEdges.push(key);
	});

	// Group continuous edges into sides
	return (
		groupEdgeSegments(leftEdges, true) +
		groupEdgeSegments(rightEdges, true) +
		groupEdgeSegments(topEdges, false) +
		groupEdgeSegments(bottomEdges, false)
	);
}

function part1() {
	let total = 0;
	regions.forEach(region => {
		const area = region.cells.length;
		total += area * computePerimeter(region);
	});
	console.log("Part 1:", total);
}

function part2() {
	let total = 0;
	regions.forEach(region => {
		const area = region.cells.length;
		total += area * computeSides(region);
	});
	console.log("Part 2:", total);
}

part1();
part2();
