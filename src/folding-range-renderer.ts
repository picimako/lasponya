//Copyright 2023 Tamás Balog. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file.
import {TextDocument} from "vscode-languageserver-textdocument";
import {FoldingRange, FoldingRangeKind} from "vscode-languageserver";
import {TextEdit} from "vscode-languageserver-types";
import {
    calculateCharacter,
    isEndEarlierThanStart,
    sortByPositionAscending
} from "./utils/foldingRangeUtils";
import {getTextDocument, isEmpty} from "./utils/documentUtils";

const DEFAULT_COLLAPSED_TEXT = "...";
const FOLDING_RANGE_IDENTIFIERS = "abcdefghijklmnopqrstuvqxyzABCDEFGHIJKLMNOPQRSTUVWXY0123456789"

/**
 * Renders `FoldingRange` objects in custom XML tags into the tested document.
 *
 * @param document the text of the text document, or the text document itself, to render the folding ranges into
 * @param foldingRanges one or more FoldingRange objects to render into the code
 */
export function renderFoldingRanges(document: string | TextDocument, foldingRanges: FoldingRange[]): string {
    //If the document is empty, there is no need to proceed any further
    if (isEmpty(document))
        return "";

    const originalDocument = getTextDocument(document);

    //If there is no FoldingRange to render, just return the document's current text
    if (foldingRanges.length === 0)
        return originalDocument.getText();

    if (foldingRanges.find(range => isEndEarlierThanStart(originalDocument, range)))
        return 'Found at least one FoldingRange with its end position being earlier than its start position.';

    /*
     * Sorting the FoldingRanges ascending by their start Positions, so that the rendering can happen deterministically.
     * Create the rendered folding range objects, and apply the changes on the tested document.
     */
    const textEdits: TextEdit[] = [];
    const sortedRanges = sortByPositionAscending(originalDocument, foldingRanges);
    for (let i = 0; i < sortedRanges.length; i++) {
        const foldingRange = sortedRanges[i];
        //<Imports
        //<Imports.a
        const kindName = toKindName(foldingRange.kind);
        const tagName = `${kindName}${foldingRanges.length > 1
            ? `.${FOLDING_RANGE_IDENTIFIERS[i - Math.floor(i / FOLDING_RANGE_IDENTIFIERS.length)]}`
            : ''}`;
        let renderedFoldingRange = `<${tagName}`;

        //<Imports collapsed="some placeholder text"
        //<Imports collapsed="..."
        const collapsedText = foldingRange.collapsedText ? foldingRange.collapsedText : DEFAULT_COLLAPSED_TEXT;
        renderedFoldingRange += ` collapsed="${collapsedText}"`;

        /*
         * If either `FoldingRange.startCharacter` or `FoldingRange.endCharacter` is not specified,
         * calculate them based on the start/end line's length according to the FoldingRange documentation:
         * https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#foldingRange
         */
        const startCharacter = foldingRange.startCharacter ?? calculateCharacter(originalDocument, foldingRange.startLine);
        const endCharacter = foldingRange.endCharacter ?? calculateCharacter(originalDocument, foldingRange.endLine);

        const openingEdit: TextEdit = {
            range: {
                start: {line: foldingRange.startLine, character: startCharacter},
                end: {line: foldingRange.startLine, character: startCharacter}
            },
            newText: `${renderedFoldingRange}>`
        };
        const closingEdit: TextEdit = {
            range: {
                start: {line: foldingRange.endLine, character: endCharacter},
                end: {line: foldingRange.endLine, character: endCharacter}
            },
            newText: `</${tagName}>`
        };

        textEdits.push(openingEdit, closingEdit);
    }

    return TextDocument.applyEdits(originalDocument, textEdits);
}

/**
 * Maps the argument folding range kind to a string representation based on its name in `FoldingRangeKind`.
 *
 * If the kind is unspecified (up to the client to decide), it returns the string "FoldingRange".
 *
 * @param kind the folding range's kind
 */
function toKindName(kind: FoldingRangeKind | undefined): string {
    switch (kind) {
        case FoldingRangeKind.Comment:
            return "Comment";
        case FoldingRangeKind.Imports:
            return "Imports";
        case FoldingRangeKind.Region:
            return "Region"
        default:
            return "FoldingRange";
    }
}
