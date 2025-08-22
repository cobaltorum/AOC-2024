import fs from "node:fs";

/**
 * Parses the input file and extracts two lists of numbers.
 * @param filename The name of the input file.
 * @returns A tuple containing two arrays of numbers.
 */

function parseInput(filename: string): [number[], number[]] {
	const lines = fs
		.readFileSync(filename, "utf8")
		.trim()
		.split("\n")
		.map(line => line.split("   ").map(num => parseInt(num, 10)));

	const leftList = lines.map(([left]) => left).sort((a, b) => a - b);
	const rightList = lines.map(([, right]) => right).sort((a, b) => a - b);

	return [leftList, rightList];
}

/**
 * Calculates the total distance between two lists of numbers.
 * @param left The first list of numbers.
 * @param right The second list of numbers.
 * @returns The total distance between the two lists.
 */

function calculateTotalDistance(left: number[], right: number[]): number {
	return left.reduce((total, leftNum, index) => total + Math.abs(leftNum - right[index]), 0);
}

/**
 * Calculates the similarity score between two lists of numbers.
 * @param left The first list of numbers.
 * @param right The second list of numbers.
 * @returns The similarity score between the two lists.
 */

function calculateSimilarityScore(left: number[], right: number[]): number {
	const rightCounts = new Map<number, number>();

	for (const num of right) {
		rightCounts.set(num, (rightCounts.get(num) || 0) + 1);
	}

	return left.reduce((total, leftNum) => total + leftNum * (rightCounts.get(leftNum) || 0), 0);
}

(() => {
	const [leftList, rightList] = parseInput("input.txt");

	const part1 = calculateTotalDistance(leftList, rightList);
	const part2 = calculateSimilarityScore(leftList, rightList);

	console.log("part 1:", part1);
	console.log("part 2:", part2);
})();
