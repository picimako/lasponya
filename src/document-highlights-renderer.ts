//Copyright 2023 Tamás Balog. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file.
import {TextDocument} from "vscode-languageserver-textdocument";
import {DocumentHighlight, DocumentHighlightKind, TextEdit} from "vscode-languageserver";
import {isEndEarlierThanStart, sortByStartPositionAscending} from "./utils/rangeUtils";
import {getTextDocument, isEmpty} from "./utils/documentUtils";

/**
 * Renders `DocumentHighlight` objects in custom XML tags into the tested document.
 *
 * @param document the text of the text document, or the text document itself, to render the document highlights into
 * @param documentHighlights one or more DocumentHighlight objects to render into the code
 */
export function renderDocumentHighlights(document: string | TextDocument, documentHighlights: DocumentHighlight[]): string {
    //If the document is empty, there is no need to proceed any further
    if (isEmpty(document))
        return "";

    if (documentHighlights.find(isEndEarlierThanStart))
        return 'Found at least one DocumentHighlight with its end position being earlier than its start position.'

    /*
     * Sorting the DocumentHighlights ascending by their start Positions, so that the rendering can happen deterministically.
     * Create the rendered document highlight objects, and apply the changes on the tested document.
     */
    const textEdits: TextEdit[] = [];
    for (const highlight of sortByStartPositionAscending(documentHighlights) as DocumentHighlight[]) {
        const highlightKindName = toHighlightKindName(highlight.kind);

        //Construct the TextEdits for the opening and closing tags
        //<Highlight>
        //<Read>
        const openingEdit: TextEdit = {
            range: {start: highlight.range.start, end: highlight.range.start},
            newText: `<${highlightKindName}>`
        };
        //</Highlight>
        //</Read>
        const closingEdit: TextEdit = {
            range: {start: highlight.range.end, end: highlight.range.end},
            newText: `</${highlightKindName}>`
        };

        textEdits.push(openingEdit, closingEdit);
    }

    return TextDocument.applyEdits(getTextDocument(document), textEdits);
}

/**
 * Maps the argument document's highlight kind to its name in `DocumentHighlightKind`.
 *
 * If the highlight is unspecified (up to the client to decide), it returns the string "Highlight".
 *
 * @param kind the document's highlight kind
 */
function toHighlightKindName(kind: DocumentHighlightKind | undefined): string {
    switch (kind) {
        case 1:
            return "Text";
        case 2:
            return "Read";
        case 3:
            return "Write";
        default:
            return "Highlight";
    }
}
