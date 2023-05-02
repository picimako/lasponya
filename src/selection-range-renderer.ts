//Copyright 2023 Tamás Balog. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file.
import {TextDocument} from "vscode-languageserver-textdocument";
import {SelectionRange} from "vscode-languageserver";
import {getTextDocument, isEmpty} from "./utils/documentUtils";
import {isEndEarlierThanStart, sortByStartPositionAscending} from "./utils/rangeUtils";
import {TextEdit} from "vscode-languageserver-types";

/**
 * Renders `SelectionRange` objects in custom XML tags into the tested document.
 *
 * @param document the text of the text document, or the text document itself, to render the folding ranges into
 * @param selectionRanges one or more SelectionRange objects to render into the code
 */
export function renderSelectionRanges(document: string | TextDocument, selectionRanges: SelectionRange[]): string {
    //If the document is empty, there is no need to proceed any further
    if (isEmpty(document))
        return "";

    const originalDocument = getTextDocument(document);

    //If there is no SelectionRange to render, just return the document's current text
    if (selectionRanges.length === 0)
        return originalDocument.getText();

    if (selectionRanges.find(isEndEarlierThanStart))
        return 'Found at least one SelectionRange with its end position being earlier than its start position.';

    /*
     * Sorting the SelectionRanges ascending by their start Positions, so that the rendering can happen deterministically.
     * Create the rendered selection range objects, and apply the changes on the tested document.
     */
    const textEdits: TextEdit[] = [];
    for (const selectionRange of sortByStartPositionAscending(selectionRanges)) {
        const openingEdit: TextEdit = {
            range: {start: selectionRange.range.start, end: selectionRange.range.start},
            newText: "<SelectionRange>"
        };
        const closingEdit: TextEdit = {
            range: {start: selectionRange.range.end, end: selectionRange.range.end},
            newText: "</SelectionRange>"
        };

        textEdits.push(openingEdit, closingEdit);
    }

    return TextDocument.applyEdits(originalDocument, textEdits);
}
