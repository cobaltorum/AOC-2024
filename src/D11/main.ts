import fs from "node:fs";

/**
 * Parses the input file into a count map of stones
 * @param filename Path to the input file
 * @returns Object mapping stone values to their counts
 */
function parseInput(filename: string): Record<number, number> {
	const line = fs.readFileSync(filename, "utf8").trim();
	const stones: Record<number, number> = {};

	line.split(" ").forEach(stone => {
		const num = Number(stone);
		stones[num] = (stones[num] || 0) + 1;
	});

	return stones;
}

const startingStones = parseInput("input.txt");

/**
 * Transforms a single stone according to the rules
 * @param stone The stone value to transform
 * @returns Array of new stone values after transformation
 */
function transformStone(stone: number): number[] {
	if (stone === 0) return [1];

	const stoneStr = stone.toString();
	if (stoneStr.length % 2 === 0) {
		const mid = stoneStr.length / 2;
		return [Number(stoneStr.slice(0, mid)), Number(stoneStr.slice(mid))];
	}

	return [stone * 2024];
}

/**
 * Performs one blink transformation on all stones
 * @param stones Map of stone values to their counts
 * @returns New map with transformed stones and updated counts
 */
function blink(stones: Record<number, number>): Record<number, number> {
	const nextStones: Record<number, number> = {};

	Object.entries(stones).forEach(([stone, count]) => {
		transformStone(+stone).forEach(newStone => {
			nextStones[newStone] = (nextStones[newStone] || 0) + count;
		});
	});

	return nextStones;
}

/**
 * Calculates the total number of stones after a specified number of blinks
 * @param numBlinks Number of blink transformations to perform
 * @returns Total count of all stones
 */
function countStonesAfterBlinks(numBlinks: number): number {
	let stones = { ...startingStones };

	for (let i = 0; i < numBlinks; i++) {
		stones = blink(stones);
	}

	return Object.values(stones).reduce((sum, count) => sum + count, 0);
}

function part1() {
	console.log("Part 1:", countStonesAfterBlinks(25));
}

function part2() {
	console.log("Part 2:", countStonesAfterBlinks(75));
}

part1();
part2();
