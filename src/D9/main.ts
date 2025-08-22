import fs from "node:fs";

/**
 * Reads the disk map from the input file
 * @param filename Path to the input file
 * @returns The disk map string
 */
function readInput(filename: string): string {
	const input = fs.readFileSync(filename, "utf8").split("\n");
	return input[0];
}

const diskMap = readInput("input.txt");

/**
 * Parses a disk map string into an array representation
 * @param diskMapString String representing alternating file lengths and free space
 * @returns Object containing the disk array and total file count
 */
function parseDiskMap(diskMapString: string) {
	let fileId = 0;
	const disk: number[] = [];

	for (let i = 0; i < diskMapString.length; i++) {
		const length = parseInt(diskMapString[i], 10);
		if (i % 2 === 0) {
			// File blocks
			for (let j = 0; j < length; j++) disk.push(fileId);
			fileId++;
		} else {
			// Free space blocks
			for (let j = 0; j < length; j++) disk.push(-1);
		}
	}

	return { disk, fileCount: fileId };
}

/**
 * Finds the rightmost file block in the disk array
 * @param disk The disk array
 * @returns Index of the rightmost file block, or -1 if none found
 */
function findRightmostFile(disk: number[]): number {
	for (let i = disk.length - 1; i >= 0; i--) {
		if (disk[i] !== -1) {
			return i;
		}
	}
	return -1;
}

/**
 * Checks if there are any file blocks to the right of a given position
 * @param disk The disk array
 * @param startIndex Position to check from
 * @returns True if file blocks exist to the right
 */
function hasFilesToRight(disk: number[], startIndex: number): boolean {
	for (let i = startIndex + 1; i < disk.length; i++) {
		if (disk[i] !== -1) {
			return true;
		}
	}
	return false;
}

/**
 * Compacts the disk by moving file blocks one at a time from right to left
 * @param disk The disk array to modify in place
 */
function compactBlockByBlock(disk: number[]) {
	while (true) {
		const leftFreeIndex = disk.indexOf(-1);
		if (leftFreeIndex < 0) break;

		if (!hasFilesToRight(disk, leftFreeIndex)) break;

		const rightFileIndex = findRightmostFile(disk);
		if (rightFileIndex === -1) break;

		disk[leftFreeIndex] = disk[rightFileIndex];
		disk[rightFileIndex] = -1;
	}
}

/**
 * Finds a contiguous free space span of sufficient length
 * @param disk The disk array
 * @param maxEnd Maximum position to search up to (exclusive)
 * @param lengthNeeded Required length of free space
 * @returns Starting index of suitable free span, or null if none found
 */
function findFreeSpan(disk: number[], maxEnd: number, lengthNeeded: number): number | null {
	const limit = maxEnd - 1;
	if (limit < 0) return null;

	let spanStart = -1;
	let currentSpanLength = 0;

	for (let i = 0; i <= limit; i++) {
		if (disk[i] === -1) {
			if (spanStart < 0) spanStart = i;
			currentSpanLength++;
			if (currentSpanLength >= lengthNeeded) return spanStart;
		} else {
			spanStart = -1;
			currentSpanLength = 0;
		}
	}

	return null;
}

/**
 * Finds the start and end positions of a file in the disk array
 * @param disk The disk array
 * @param fileId The file ID to search for
 * @returns Object with start and end indices, or null if file not found
 */
function findFileSpan(disk: number[], fileId: number): { start: number; end: number } | null {
	let start = -1;
	let end = -1;

	for (let i = 0; i < disk.length; i++) {
		if (disk[i] === fileId) {
			if (start < 0) start = i;
			end = i;
		}
	}

	return start < 0 ? null : { start, end };
}

/**
 * Compacts the disk by moving whole files from right to left when possible
 * @param disk The disk array to modify in place
 * @param fileCount Total number of files in the system
 */
function compactWholeFiles(disk: number[], fileCount: number) {
	for (let currentFileId = fileCount - 1; currentFileId >= 0; currentFileId--) {
		const fileSpan = findFileSpan(disk, currentFileId);
		if (!fileSpan) continue;

		const fileLength = fileSpan.end - fileSpan.start + 1;
		const freeSpanStart = findFreeSpan(disk, fileSpan.start, fileLength);

		if (freeSpanStart === null) continue;

		// Move the file to the free space
		for (let i = 0; i < fileLength; i++) {
			disk[freeSpanStart + i] = currentFileId;
		}

		// Clear the original file location
		for (let i = fileSpan.start; i <= fileSpan.end; i++) {
			disk[i] = -1;
		}
	}
}

/**
 * Calculates the checksum of the disk based on file positions
 * @param disk The disk array
 * @returns The checksum value
 */
function calculateChecksum(disk: number[]): number {
	let sum = 0;
	for (let i = 0; i < disk.length; i++) {
		if (disk[i] !== -1) {
			sum += i * disk[i];
		}
	}
	return sum;
}

function part1(): number {
	const { disk } = parseDiskMap(diskMap);
	compactBlockByBlock(disk);
	return calculateChecksum(disk);
}

function part2(): number {
	const { disk, fileCount } = parseDiskMap(diskMap);
	compactWholeFiles(disk, fileCount);
	return calculateChecksum(disk);
}

console.log("Part 1:", part1());
console.log("Part 2:", part2());
