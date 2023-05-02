//Copyright 2023 Tamás Balog. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file.
import {TextDocument} from "vscode-languageserver-textdocument";
import {InlayHint, InlayHintKind, InlayHintLabelPart, TextEdit} from "vscode-languageserver";
import {sortByPositionAscending} from "./utils/rangeUtils";
import {getTextDocument, isEmpty} from "./utils/documentUtils";

/**
 * Renders `InlayHint` objects in custom XML tags into the tested document.
 *
 * There is no support yet for rendering `InlayHint.tooltip` and `InlayHint.textEdits`.
 *
 * @param document the text of the text document, or the text document itself, to render the document highlights into
 * @param inlayHints one or more InlayHint objects to render into the code
 */
export function renderInlayHints(document: string | TextDocument, inlayHints: InlayHint[]): string {
    //If the document is empty, there is no need to proceed any further
    if (isEmpty(document))
        return "";

    /*
     * Sorting the InlayHints ascending by their Positions, so that the rendering can happen deterministically.
     * Create the rendered inlay hint objects, and apply the changes on the tested document.
     */
    const textEdits: TextEdit[] = [];
    for (const inlayHint of sortByPositionAscending(inlayHints)) {
        let renderedInlayHint = "<";

        //<_
        if (inlayHint.paddingLeft)
            renderedInlayHint += "_";

        //<_Parameter
        const inlayHintKindName = toInlayHintKindName(inlayHint.kind);
        renderedInlayHint += inlayHintKindName;

        //<_Parameter label="some label"
        if (typeof (inlayHint.label) === "string")
            renderedInlayHint += ` label="${inlayHint.label}"`;
        else {
            const inlayHintLabelParts = inlayHint.label as InlayHintLabelPart[];
            const label = inlayHintLabelParts.map(part => part.value).join(' ');
            renderedInlayHint += ` label="${label}"`;
        }

        // if (inlayHint.tooltip) {
        //     //<_Parameter label="some label" tooltip="a tooltip"
        //     if (typeof (inlayHint.tooltip) === "string")
        //         renderedInlayHint += ` tooltip="${inlayHint.tooltip}"`;
        //     //<_Parameter label="some label" tooltip:markdown="a **markdown** tooltip"
        //     else {
        //         const tooltip = inlayHint.tooltip as MarkupContent;
        //         renderedInlayHint += ` tooltip:${tooltip.kind}="${tooltip.value}"`;
        //     }
        // }

        //<_Parameter label="some label" _
        if (inlayHint.paddingRight)
            renderedInlayHint += " _";

        //<_Parameter label="some label" _/>
        renderedInlayHint += "/>";

        //Construct the TextEdit
        const edit: TextEdit = {
            range: {start: inlayHint.position, end: inlayHint.position},
            newText: renderedInlayHint
        };

        textEdits.push(edit);
    }

    return TextDocument.applyEdits(getTextDocument(document), textEdits);
}

/**
 * Maps the argument inlay hint kind to its name in `InlayHintKind`.
 *
 * If the kind is unspecified, it returns the string "InlayHint".
 *
 * @param kind the inlay hint's kind
 */
function toInlayHintKindName(kind: InlayHintKind | undefined): string {
    switch (kind) {
        case 1:
            return "Type";
        case 2:
            return "Parameter";
        default:
            return "InlayHint";
    }
}
