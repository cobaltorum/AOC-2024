import { readFileSync } from "node:fs";

/**
 * Parses the input file and converts it into a 2D array of numbers.
 * @param filename The name of the file to read from.
 * @returns A 2D array of numbers representing the parsed input.
 */

function parseInput(filename: string): number[][] {
	return readFileSync(filename, "utf8")
		.trim()
		.split("\n")
		.map(line => line.split(" ").map(Number));
}

/**
 * Determines if a sequence of levels is considered "safe" based on specific criteria.
 *
 * A sequence is safe if all adjacent differences are either:
 * - All increasing by 1-3 units (monotonically increasing with controlled rate)
 * - All decreasing by 1-3 units (monotonically decreasing with controlled rate)
 *
 * @param levels Array of numeric values representing sequential levels to analyze
 * @returns True if the sequence meets safety criteria, false otherwise
 */
function isSafe(levels: number[]): boolean {
	const diffs = levels.slice(1).map((n, i) => n - levels[i]);
	return diffs.every(d => d >= 1 && d <= 3) || diffs.every(d => d >= -3 && d <= -1);
}

function isSafeWithDampener(levels: number[]): boolean {
	if (isSafe(levels)) return true;
	return levels.some((_, i) => isSafe(levels.toSpliced(i, 1)));
}

const input = parseInput("input.txt");

const partA = input.filter(isSafe).length;
const partB = input.filter(isSafeWithDampener).length;

console.log(partA);
console.log(partB);
