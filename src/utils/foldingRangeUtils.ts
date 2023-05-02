//Copyright 2023 Tamás Balog. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file.
import {TextDocument} from "vscode-languageserver-textdocument";
import {FoldingRange, uinteger} from "vscode-languageserver";

export function sortByPositionAscending(document: TextDocument, foldingRanges: FoldingRange[]): FoldingRange[] {
    return foldingRanges.sort((range1, range2) => compareByPositionAscending(document, range1, range2));
}

/**
 * Calculates the `the length of the start/end line` when a folding range doesn't have either the `startCharacter` or the `endCharacter`
 * specified. This according to the [LSP specification](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#foldingRange).
 *
 * @param document the text document tested
 * @param foldingRangeLine the start/end line number of the folding range
 */
export function calculateCharacter(document: TextDocument, foldingRangeLine: uinteger): uinteger {
    //If the start line is the last line in the document
    if (foldingRangeLine === document.lineCount - 1) {
        //Calculate the length of the last line by subtracting the start offset of the last line from the length of the document
        const lastLineStartOffset = document.offsetAt({line: foldingRangeLine, character: 0});
        return document.getText().length - lastLineStartOffset;
    } else
        //Calculate the length of the start line by getting the offset at the next line's start character, and subtracting one.
        return document.positionAt(document.offsetAt({
            line: foldingRangeLine + 1,
            character: 0
        }) - 1).character;
}

/**
 * Returns the sort order between the two provided FoldingRanges. It makes sure to sort them ascending by their positions.
 *
 * If the `startCharacter` of either folding range is not specified, they are calculated according to the LSP specification:
 * `If not defined, defaults to the length of the start/end line.`
 *
 * @param document the document to calculate the length of the start/end line in
 * @param range1 one folding range to compare
 * @param range2 the other folding range to compare
 */
const compareByPositionAscending = (document: TextDocument, range1: FoldingRange, range2: FoldingRange) => {
    if (range1.startLine < range2.startLine)
        return -1;
    if (range2.startLine < range1.startLine)
        return 1;

    const range1StartChar = range1.startCharacter ?? calculateCharacter(document, range1.startLine);
    const range2StartChar = range2.startCharacter ?? calculateCharacter(document, range2.startLine);

    return range1StartChar - range2StartChar;
}

/**
 * Returns if the end offset of the provided object is earlier than its start offset.
 *
 * @param document the text document tested
 * @param foldingRange the FoldingRange to validate
 */
export function isEndEarlierThanStart(document: TextDocument, foldingRange: FoldingRange): boolean {
    if (foldingRange.startLine > foldingRange.endLine)
        return true;
    else if (foldingRange.startLine === foldingRange.endLine) {
        const startChar = foldingRange.startCharacter ?? calculateCharacter(document, foldingRange.startLine);
        const endChar = foldingRange.endCharacter ?? calculateCharacter(document, foldingRange.endLine);
        return startChar > endChar;
    }
    return false;
}
