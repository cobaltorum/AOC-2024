import fs from "node:fs";

type Coordinate = { r: number; c: number };

/**
 * Parses the input file and extracts antenna positions grouped by frequency
 * @param filename Path to the input file
 * @returns Object containing grid dimensions and antenna positions by frequency
 */
function parseInput(filename: string): {
	rows: number;
	cols: number;
	antennae: Record<string, Coordinate[]>;
} {
	const input = fs.readFileSync(filename, "utf8").split("\n");
	const rows = input.length;
	const cols = input[0].length;
	const antennae: Record<string, Coordinate[]> = {};

	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const ch = input[r][c];
			if (ch !== ".") {
				if (!antennae[ch]) antennae[ch] = [];
				antennae[ch].push({ r, c });
			}
		}
	}

	return { rows, cols, antennae };
}

const { rows, cols, antennae } = parseInput("input.txt");

/**
 * Calculates the greatest common divisor of two numbers
 * @param a First number
 * @param b Second number
 * @returns The GCD of a and b
 */
function gcd(a: number, b: number): number {
	if (b === 0) return Math.abs(a);
	return gcd(b, a % b);
}

/**
 * Checks if a coordinate is within the grid bounds
 * @param r Row coordinate
 * @param c Column coordinate
 * @returns True if the coordinate is within bounds
 */
function isInBounds(r: number, c: number): boolean {
	return r >= 0 && r < rows && c >= 0 && c < cols;
}

function partA() {
	const antinodes = new Set<string>();

	for (const freq in antennae) {
		const coords = antennae[freq];

		// Check all pairs of antennas with the same frequency
		for (let i = 0; i < coords.length; i++) {
			for (let j = i + 1; j < coords.length; j++) {
				const { r: r1, c: c1 } = coords[i];
				const { r: r2, c: c2 } = coords[j];

				// Compute antinode positions for part 1:
				// antinode1 = (2*r2 - r1, 2*c2 - c1)
				// antinode2 = (2*r1 - r2, 2*c1 - c2)
				const a1r = 2 * r2 - r1;
				const a1c = 2 * c2 - c1;
				const a2r = 2 * r1 - r2;
				const a2c = 2 * c1 - c2;

				if (isInBounds(a1r, a1c)) {
					antinodes.add(`${a1r},${a1c}`);
				}
				if (isInBounds(a2r, a2c)) {
					antinodes.add(`${a2r},${a2c}`);
				}
			}
		}
	}

	console.log("part 1:", antinodes.size);
}

function partB() {
	const antinodes = new Set<string>();

	for (const freq in antennae) {
		const coords = antennae[freq];
		if (coords.length < 2) {
			// No lines can be formed if only one antenna of that frequency
			continue;
		}

		// Lines: represented by direction (dr, dc) and offset K (from normal form)
		const lines = new Map<string, Coordinate>();

		// Find all unique lines formed by pairs of antennas
		for (let i = 0; i < coords.length; i++) {
			for (let j = i + 1; j < coords.length; j++) {
				const { r: r1, c: c1 } = coords[i];
				const { r: r2, c: c2 } = coords[j];

				let dr = r2 - r1;
				let dc = c2 - c1;
				const g = gcd(dr, dc);
				dr /= g;
				dc /= g;

				// Normalize direction for uniqueness
				if (dr < 0 || (dr === 0 && dc < 0)) {
					dr = -dr;
					dc = -dc;
				}

				// Line normal form: dc*r - dr*c = K
				const K = dc * r1 - dr * c1;
				const lineKey = `${dr},${dc},${K}`;

				// Store a representative point for this line
				if (!lines.has(lineKey)) {
					lines.set(lineKey, { r: r1, c: c1 });
				}
			}
		}

		// For each line, generate all points within the grid
		for (const [lineKey, point] of lines) {
			const [drStr, dcStr] = lineKey.split(",");
			const dr = parseInt(drStr, 10);
			const dc = parseInt(dcStr, 10);
			const { r: r0, c: c0 } = point;

			/**
			 * Calculates the valid range of parameter m for one dimension
			 * @param pos Starting position in this dimension
			 * @param d Direction step in this dimension
			 * @param limit Grid limit for this dimension
			 * @returns [minM, maxM] range where positions are valid
			 */
			function getValidRange(pos: number, d: number, limit: number): [number, number] {
				if (d === 0) {
					// Must remain pos in range for all m
					if (pos < 0 || pos >= limit) return [1, -1]; // empty range
					return [-Infinity, Infinity];
				} else if (d > 0) {
					const minM = Math.ceil(-pos / d);
					const maxM = Math.floor((limit - 1 - pos) / d);
					return [minM, maxM];
				} else {
					// d < 0
					const minM = Math.ceil((limit - 1 - pos) / d);
					const maxM = Math.floor(-pos / d);
					return [minM, maxM];
				}
			}

			// Find valid m range: (r, c) = (r0 + m*dr, c0 + m*dc)
			const [minMr, maxMr] = getValidRange(r0, dr, rows);
			const [minMc, maxMc] = getValidRange(c0, dc, cols);
			const minM = Math.max(minMr, minMc);
			const maxM = Math.min(maxMr, maxMc);

			// Generate all points on this line within the grid
			if (minM <= maxM) {
				for (let m = minM; m <= maxM; m++) {
					const rr = r0 + m * dr;
					const cc = c0 + m * dc;
					antinodes.add(`${rr},${cc}`);
				}
			}
		}
	}

	console.log("part 2:", antinodes.size);
}

partA();
partB();
