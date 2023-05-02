//Copyright 2023 Tamás Balog. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file.
import {TextDocument} from "vscode-languageserver-textdocument";

/**
 * Returns whether the provided document has any text.
 *
 * @param document the TextDocument or the full text of it
 */
export function isEmpty(document: string | TextDocument): boolean {
    return typeof (document) === "string"
        ? document.length === 0
        : (document as TextDocument).getText().length === 0;
}

/**
 * Creates a new TextDocument if a string is provided, and returns the document itself if a TextDocument is passed in.
 *
 * @param document the TextDocument or the full text of it
 */
export function getTextDocument(document: string | TextDocument): TextDocument {
    return typeof (document) === "string"
        //It is only the text of the document that matters, thus creating it without URI, and as a plaintext document.
        ? TextDocument.create("", "plaintext", 0, document.toString())
        : document as TextDocument;
}
