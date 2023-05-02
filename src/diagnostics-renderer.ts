//Copyright 2023 Tamás Balog. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file.
import {Diagnostic, DiagnosticSeverity, DiagnosticTag, TextEdit} from "vscode-languageserver";
import {TextDocument} from "vscode-languageserver-textdocument";
import {isEndEarlierThanStart, sortByStartPositionAscending} from "./utils/rangeUtils";
import {getTextDocument, isEmpty} from "./utils/documentUtils";

/**
 * Renders `Diagnostic` objects in custom XML-like tags into the tested document.
 *
 * @param document the text of the text document, or the text document itself, to render the diagnostics into
 * @param diagnostics one or more Diagnostic objects to render into the code
 */
export function renderDiagnostics(document: string | TextDocument, diagnostics: Diagnostic[]): string {
    //If the document is empty, there is no need to proceed any further
    if (isEmpty(document))
        return "";

    if (diagnostics.find(isEndEarlierThanStart))
        return 'Found at least one Diagnostic with its end position being earlier than its start position.'

    /*
     * Sorting the Diagnostics ascending by their start Positions, so that the rendering can happen deterministically.
     * Create the rendered diagnostic objects, and apply the changes on the tested document.
     */
    const textEdits: TextEdit[] = [];
    for (const diagnostic of sortByStartPositionAscending(diagnostics) as Diagnostic[]) {
        //<Error
        const severityName = toSeverityName(diagnostic.severity);
        let renderedDiagnostic = `<${severityName}`;

        //<Error:Unnecessary
        if (diagnostic.tags)
            renderedDiagnostic += `:${diagnostic.tags.map(toTagName).join(':')}`;

        //<Error:Unnecessary msg="diag message"
        renderedDiagnostic += ` msg="${diagnostic.message}"`;

        //<Error:Unnecessary msg="diag message" code=3
        //<Error:Unnecessary msg="diag message" code="string code"
        if (diagnostic.code)
            renderedDiagnostic += typeof (diagnostic.code) === "string"
                ? ` code="${diagnostic.code}"`
                : ` code=${diagnostic.code}`;

        //<Error:Unnecessary msg="diag message code="string code" src="diag source"
        if (diagnostic.source)
            renderedDiagnostic += ` src="${diagnostic.source}"`;

        //<Error:Unnecessary msg="diag message code="string code" src="diag source" codeDesc="https://some.url"
        if (diagnostic.codeDescription)
            renderedDiagnostic += ` codeDesc="${diagnostic.codeDescription.href}"`;

        //Construct the TextEdits for the opening and closing tags
        const openingEdit: TextEdit = {
            range: {start: diagnostic.range.start, end: diagnostic.range.start},
            newText: `${renderedDiagnostic}>`
        };
        const closingEdit: TextEdit = {
            range: {start: diagnostic.range.end, end: diagnostic.range.end},
            newText: `</${severityName}>`
        };

        textEdits.push(openingEdit, closingEdit);
    }

    return TextDocument.applyEdits(getTextDocument(document), textEdits);
}

/**
 * Maps the argument diagnostic severity to its name in `DiagnosticSeverity`.
 *
 * If the severity is unspecified (up to the client to decide), it returns the string "Diagnostic".
 *
 * @param severity the diagnostic severity
 */
function toSeverityName(severity: DiagnosticSeverity | undefined): string {
    switch (severity) {
        case 1:
            return "Error";
        case 2:
            return "Warning";
        case 3:
            return "Information";
        case 4:
            return "Hint";
        default:
            return "Diagnostic";
    }
}

/**
 * Maps the argument diagnostic tag to its name in `DiagnosticTag`.
 *
 * @param diagnosticTag the diagnostic tag
 */
function toTagName(diagnosticTag: DiagnosticTag): string {
    return diagnosticTag == DiagnosticTag.Unnecessary ? "Unnecessary" : `Deprecated`;
}
