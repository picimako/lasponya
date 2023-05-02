//Copyright 2023 Tamás Balog. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file.
import {Diagnostic, DocumentHighlight, InlayHint, Position, SelectionRange} from "vscode-languageserver";

export function sortByStartPositionAscending(
    lspObjects: Diagnostic[] | DocumentHighlight[] | SelectionRange[]
): Diagnostic[] | DocumentHighlight[] | SelectionRange[] {
    return lspObjects.sort((o1, o2) => compareByPositionAscending(o1.range.start, o2.range.start));
}

export function sortByPositionAscending(inlayHints: InlayHint[]): InlayHint[] {
    return inlayHints.sort((o1, o2) => compareByPositionAscending(o1.position, o2.position));
}

/**
 * Returns the sort order between the two provided Positions. It ensures ascending sort order.
 *
 * @param pos1 one position to compare
 * @param pos2 the other position to compare
 */
function compareByPositionAscending(pos1: Position, pos2: Position): number {
    if (pos1.line < pos2.line)
        return -1;
    if (pos2.line < pos1.line)
        return 1;

    return pos1.character - pos2.character;
}

/**
 * Returns if the end offset of the provided object is earlier than its start offset.
 *
 * @param lspObject the LSP object to validate
 */
export function isEndEarlierThanStart(lspObject: DocumentHighlight | Diagnostic | SelectionRange): boolean {
    return lspObject.range.start.line > lspObject.range.end.line
        || (lspObject.range.start.line === lspObject.range.end.line
            && lspObject.range.start.character > lspObject.range.end.character);
}
