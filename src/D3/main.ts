import fs from "node:fs";

/**
 * Reads the input file and returns its contents as a single string.
 * @param filename The name of the file to read from.
 * @returns The contents of the file as a string.
 */

function readInput(filename: string): string {
	return fs.readFileSync(filename, "utf8").split("\n").join("");
}

// Regex that grabs all instances of mul(x,y) where x and y are numbers
const mulRegex = /mul\((\d+),(\d+)\)/g;

function partA() {
	const input = readInput("input.txt");
	const matches = input.match(mulRegex)!;
	const sum = matches.reduce((acc, match) => {
		const [x, y] = match.match(/\d+/g)!.map(n => parseInt(n, 10));
		return acc + x * y;
	}, 0);
	console.log(sum);
}

// Match do(), don't(), and mul(x,y) with a single regex
const instructionRegex = /do\(\)|don't\(\)|mul\((\d+),(\d+)\)/g;

function partB() {
	const input = readInput("input.txt");
	const matches = [...input.matchAll(instructionRegex)];

	let enabled = true;
	let sum = 0;

	for (const match of matches) {
		const instruction = match[0];
		if (instruction === "do()") {
			enabled = true;
		} else if (instruction === "don't()") {
			enabled = false;
		} else if (instruction.startsWith("mul") && enabled) {
			const x = parseInt(match[1], 10);
			const y = parseInt(match[2], 10);
			sum += x * y;
		}
	}
	console.log(sum);
}

partA();
partB();
