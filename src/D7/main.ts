import fs from "node:fs";

type Equation = {
	target: number;
	values: number[];
};

/**
 * Parses the input file into an array of equations
 * @param filename Path to the input file
 * @returns Array of equations with target values and operand lists
 */
function parseInput(filename: string): Equation[] {
	const lines = fs.readFileSync(filename, "utf8").split("\n");
	return lines.map(line => {
		const [left, right] = line.split(": ");
		return { target: parseInt(left), values: right.split(" ").map(Number) };
	});
}

const equations = parseInput("input.txt");

/**
 * Evaluates an expression left-to-right with given values and operators
 * @param values Array of numbers to operate on
 * @param operators Array of operator strings ("+", "*", "||")
 * @returns The final result of the expression
 */
function evaluateExpression(values: number[], operators: string[]): number {
	let result = values[0];
	for (let i = 0; i < operators.length; i++) {
		if (operators[i] === "+") {
			result += values[i + 1];
		} else if (operators[i] === "*") {
			result *= values[i + 1];
		} else if (operators[i] === "||") {
			// Concatenation operator
			result = parseInt(result.toString() + values[i + 1].toString());
		}
	}
	return result;
}

/**
 * Checks if any combination of operators can make the equation equal the target
 * @param target The desired result value
 * @param values Array of numbers to operate on
 * @param allowedOperators Array of operator strings that can be used
 * @returns True if a valid operator combination exists, false otherwise
 */
function canReachTarget(target: number, values: number[], allowedOperators: string[]): boolean {
	const operatorCount = values.length - 1;
	const operatorChoices = allowedOperators.length;

	// Try all possible combinations of operators
	for (let i = 0; i < Math.pow(operatorChoices, operatorCount); i++) {
		const operators: string[] = [];
		let n = i;

		// Convert number to base-n representation for operator selection
		for (let j = 0; j < operatorCount; j++) {
			operators.push(allowedOperators[n % operatorChoices]);
			n = Math.floor(n / operatorChoices);
		}

		const result = evaluateExpression(values, operators);
		if (result === target) {
			return true;
		}
	}

	return false;
}

/**
 * Calculates the sum of target values for equations that can be solved
 * @param equations Array of equations to test
 * @param allowedOperators Array of operator strings that can be used
 * @returns Sum of all solvable equation targets
 */
function sumSolvableEquations(equations: Equation[], allowedOperators: string[]): number {
	const validEquations = equations.filter(equation => {
		return canReachTarget(equation.target, equation.values, allowedOperators);
	});

	return validEquations.reduce((acc, curr) => acc + curr.target, 0);
}

function part1() {
	const sum = sumSolvableEquations(equations, ["+", "*"]);
	console.log("Part 1:", sum);
}

function part2() {
	const sum = sumSolvableEquations(equations, ["+", "*", "||"]);
	console.log("Part 2:", sum);
}

part1();
part2();
