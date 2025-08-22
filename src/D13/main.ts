import fs from "node:fs";

type Machine = {
	buttonA: [number, number];
	buttonB: [number, number];
	prize: [number, number];
};

/**
 * Parses the input file into machine configurations
 * @param filename Path to the input file
 * @returns Array of machine objects with button and prize coordinates
 */
function parseInput(filename: string): Machine[] {
	const chunks = fs.readFileSync(filename, "utf8").trim().split("\n\n");

	return chunks.map(chunk => {
		const [buttonA, buttonB, prize] = chunk.split("\n");
		const [x1, y1] = buttonA.split("X+")[1].split(", Y+");
		const [x2, y2] = buttonB.split("X+")[1].split(", Y+");
		const [px, py] = prize.split("X=")[1].split(", Y=");

		return {
			buttonA: [Number(x1), Number(y1)],
			buttonB: [Number(x2), Number(y2)],
			prize: [Number(px), Number(py)]
		};
	});
}

const machines = parseInput("input.txt");

/**
 * Solves a claw machine using linear algebra to find the minimum cost solution
 *
 * We want to find a combination of A and B presses (A_count, B_count) such that:
 *   A_count * ax + B_count * bx = px
 *   A_count * ay + B_count * by = py
 *
 * This forms a system of linear equations that we can solve algebraically using Cramer's rule
 *
 * @param machine The machine configuration to solve
 * @param prizeOffset Additional offset to add to prize coordinates
 * @returns Minimum cost to win, or null if impossible
 */
function solveMachine(machine: Machine, prizeOffset: number = 0): number | null {
	const [ax, ay] = machine.buttonA;
	const [bx, by] = machine.buttonB;
	const px = machine.prize[0] + prizeOffset;
	const py = machine.prize[1] + prizeOffset;

	// Calculate determinant to check if system has a unique solution
	const det = ax * by - ay * bx;
	if (det === 0) return null; // No unique solution

	// Solve using Cramer's rule
	const A_count = (px * by - py * bx) / det;
	const B_count = (px * ay - py * ax) / -det;

	// Check if solution is valid (non-negative integers)
	if (A_count < 0 || B_count < 0 || !Number.isInteger(A_count) || !Number.isInteger(B_count)) {
		return null;
	}

	// Calculate cost (Button A costs 3 tokens, Button B costs 1 token)
	return 3 * A_count + B_count;
}

/**
 * Calculates the total cost for all solvable machines
 * @param costs Array of costs (may include nulls for unsolvable machines)
 * @returns Sum of all valid costs
 */
function calculateTotalCost(costs: (number | null)[]): number {
	return costs.filter((cost): cost is number => cost !== null).reduce((sum, cost) => sum + cost, 0);
}

function part1() {
	const costs = machines.map(machine => solveMachine(machine));
	console.log("Part 1:", calculateTotalCost(costs));
}

function part2() {
	const costs = machines.map(machine => solveMachine(machine, 10000000000000));
	console.log("Part 2:", calculateTotalCost(costs));
}

part1();
part2();
