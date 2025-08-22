import fs from "node:fs";

/**
 * Parses the input file into rules and pages
 * @param filename Path to the input file
 * @returns Object containing rules array and pages array
 */
function parseInput(filename: string): { rules: number[][]; pages: number[][] } {
	const chunks = fs.readFileSync(filename, "utf8").split("\n\n");
	const rules = chunks[0].split("\n").map(line => line.split("|").map(Number));
	const pages = chunks[1].split("\n").map(line => line.split(",").map(Number));
	return { rules, pages };
}

const { rules, pages } = parseInput("input.txt");

/**
 * Checks if a page follows all the ordering rules
 * @param page Array of page numbers to validate
 * @param rules Array of [left, right] ordering rules
 * @returns True if the page is valid according to all rules
 */
function isValidPage(page: number[], rules: number[][]): boolean {
	return rules.every(([left, right]) => {
		const leftIndex = page.indexOf(left);
		const rightIndex = page.indexOf(right);
		// Rule is satisfied if:
		// - If both numbers exist, left must come before right
		// - If only one or neither number exists, that's fine
		return leftIndex === -1 || rightIndex === -1 || leftIndex < rightIndex;
	});
}

/**
 * Calculates the sum of middle elements from an array of pages
 * @param pages Array of page arrays
 * @returns Sum of all middle elements
 */
function sumMiddleElements(pages: number[][]): number {
	return pages.map(page => page[Math.floor(page.length / 2)]).reduce((a, b) => a + b, 0);
}

function partA() {
	const validPages = pages.filter(page => isValidPage(page, rules));
	const sum = sumMiddleElements(validPages);
	console.log("part 1:", sum);
}

function partB() {
	const invalidPages = pages.filter(page => !isValidPage(page, rules));

	/**
	 * Reorders a page to follow all applicable rules using topological sorting
	 * @param page Array of page numbers to reorder
	 * @returns New array with numbers properly ordered
	 */
	function reorderPage(page: number[]): number[] {
		// Keep track of numbers that must come before each number
		const mustComeBefore: Record<number, Set<number>> = {};

		// Initialize sets for each number in the page
		for (const num of page) {
			mustComeBefore[num] = new Set();
		}

		// Build dependencies based on rules that apply to this page
		for (const [left, right] of rules) {
			if (page.includes(left) && page.includes(right)) {
				mustComeBefore[right].add(left);
			}
		}

		// Topological sort: repeatedly find numbers with no remaining dependencies
		const result: number[] = [];
		const remaining = new Set(page);

		while (remaining.size > 0) {
			const available = Array.from(remaining).filter(num =>
				Array.from(mustComeBefore[num]).every(dep => !remaining.has(dep))
			);

			if (available.length === 0) {
				// If we get stuck, there must be a cycle - just take any remaining number
				const next = Array.from(remaining)[0];
				result.push(next);
				remaining.delete(next);
			} else {
				// Take the first available number
				const next = available[0];
				result.push(next);
				remaining.delete(next);
			}
		}

		return result;
	}

	const reorderedPages = invalidPages.map(reorderPage);
	const sum = sumMiddleElements(reorderedPages);
	console.log("part 2:", sum);
}

partA();
partB();
