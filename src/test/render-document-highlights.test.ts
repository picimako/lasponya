import {renderDocumentHighlights} from "../document-highlights-renderer";
import * as assert from "assert";
import {DocumentHighlight, DocumentHighlightKind} from "vscode-languageserver";
import {TextDocument} from "vscode-languageserver-textdocument";

suite("Render DocumentHighlights", () => {
    const sourceCode =
        `export function aFunction() { }
function anotherFunction() { }`;

    test("Doesn't have kind", () => {
        const highlight: DocumentHighlight = {
            range: {start: {line: 0, character: 7}, end: {line: 0, character: 15}}
        };
        const rendered = renderDocumentHighlights(sourceCode, [highlight]);

        assert.strictEqual(rendered,
            `export <Highlight>function</Highlight> aFunction() { }
function anotherFunction() { }`);
    });

    test("Has kind", () => {
        const highlight: DocumentHighlight = {
            kind: DocumentHighlightKind.Read,
            range: {start: {line: 0, character: 7}, end: {line: 0, character: 15}}
        };

        const rendered = renderDocumentHighlights(sourceCode, [highlight]);

        assert.strictEqual(rendered,
            `export <Read>function</Read> aFunction() { }
function anotherFunction() { }`);
    });

    //Multiple document highlights

    //|--------|
    //               |--------|
    test("Multiple non-intersecting", () => {
        const highlight1: DocumentHighlight = {
            kind: DocumentHighlightKind.Read,
            range: {start: {line: 0, character: 0}, end: {line: 0, character: 6}}
        };

        const highlight2: DocumentHighlight = {
            kind: DocumentHighlightKind.Write,
            range: {start: {line: 0, character: 16}, end: {line: 0, character: 25}}
        };

        const rendered = renderDocumentHighlights(sourceCode, [highlight1, highlight2]);

        assert.strictEqual(rendered,
            `<Read>export</Read> function <Write>aFunction</Write>() { }
function anotherFunction() { }`);
    });

    //    |--------|
    //|--------|
    test("Multiple partially intersecting", () => {
        const highlight1: DocumentHighlight = {
            kind: DocumentHighlightKind.Read,
            range: {start: {line: 0, character: 0}, end: {line: 0, character: 15}}
        };

        const highlight2: DocumentHighlight = {
            kind: DocumentHighlightKind.Write,
            range: {start: {line: 0, character: 10}, end: {line: 0, character: 25}}
        };

        const rendered = renderDocumentHighlights(sourceCode, [highlight1, highlight2]);

        assert.strictEqual(rendered,
            `<Read>export fun<Write>ction</Read> aFunction</Write>() { }
function anotherFunction() { }`);
    });

    //|--------|
    //|---|
    test("Multiple containing on start", () => {
        const highlight1: DocumentHighlight = {
            kind: DocumentHighlightKind.Read,
            range: {start: {line: 0, character: 0}, end: {line: 0, character: 15}}
        };

        const highlight2: DocumentHighlight = {
            kind: DocumentHighlightKind.Write,
            range: {start: {line: 0, character: 0}, end: {line: 0, character: 6}}
        };

        const rendered = renderDocumentHighlights(sourceCode, [highlight1, highlight2]);

        assert.strictEqual(rendered,
            `<Read><Write>export</Write> function</Read> aFunction() { }
function anotherFunction() { }`);
    });

    //|--------|
    //     |---|
    test("Multiple containing on end", () => {
        const highlight1: DocumentHighlight = {
            kind: DocumentHighlightKind.Read,
            range: {start: {line: 0, character: 0}, end: {line: 0, character: 15}}
        };

        const highlight2: DocumentHighlight = {
            kind: DocumentHighlightKind.Write,
            range: {start: {line: 0, character: 10}, end: {line: 0, character: 15}}
        };

        const rendered = renderDocumentHighlights(sourceCode, [highlight1, highlight2]);

        assert.strictEqual(rendered,
            `<Read>export fun<Write>ction</Read></Write> aFunction() { }
function anotherFunction() { }`);
    });

    //|--------|
    //  |---|
    test("Multiple containing completely", () => {
        const highlight1: DocumentHighlight = {
            kind: DocumentHighlightKind.Read,
            range: {start: {line: 0, character: 0}, end: {line: 0, character: 20}}
        };

        const highlight2: DocumentHighlight = {
            kind: DocumentHighlightKind.Write,
            range: {start: {line: 0, character: 10}, end: {line: 0, character: 15}}
        };

        const rendered = renderDocumentHighlights(sourceCode, [highlight1, highlight2]);

        assert.strictEqual(rendered,
            `<Read>export fun<Write>ction</Write> aFun</Read>ction() { }
function anotherFunction() { }`);
    });

    //|--------|
    //|--------|
    test("Multiple equal-range", () => {
        const highlight1: DocumentHighlight = {
            kind: DocumentHighlightKind.Read,
            range: {start: {line: 0, character: 7}, end: {line: 0, character: 15}}
        };

        const highlight2: DocumentHighlight = {
            kind: DocumentHighlightKind.Write,
            range: {start: {line: 0, character: 7}, end: {line: 0, character: 15}}
        };

        const rendered = renderDocumentHighlights(sourceCode, [highlight1, highlight2]);

        assert.strictEqual(rendered,
            `export <Read><Write>function</Read></Write> aFunction() { }
function anotherFunction() { }`);
    });

    test("Multiple not in ascending order by their start positions", () => {
        const highlight1: DocumentHighlight = {
            kind: DocumentHighlightKind.Read,
            range: {start: {line: 0, character: 7}, end: {line: 0, character: 15}}
        };

        const highlight2: DocumentHighlight = {
            kind: DocumentHighlightKind.Write,
            range: {start: {line: 0, character: 0}, end: {line: 0, character: 6}}
        };

        const rendered = renderDocumentHighlights(sourceCode, [highlight1, highlight2]);

        assert.strictEqual(rendered,
            `<Write>export</Write> <Read>function</Read> aFunction() { }
function anotherFunction() { }`);
    });

    //Other cases

    test("Multiline document highlights", () => {
        const highlight: DocumentHighlight = {
            kind: DocumentHighlightKind.Read,
            range: {start: {line: 0, character: 7}, end: {line: 2, character: 5}}
        };

        const rendered = renderDocumentHighlights(
            `export function functionName() {
    val number = 6;
    var string = "some string"
}`, [highlight]);

        assert.strictEqual(rendered,
            `export <Read>function functionName() {
    val number = 6;
    v</Read>ar string = "some string"
}`);
    });

    //Negative cases

    test("TextDocument as string is empty", () => {
        const highlight: DocumentHighlight = {
            kind: DocumentHighlightKind.Read,
            range: {start: {line: 2, character: 7}, end: {line: 0, character: 7}}
        };

        const rendered = renderDocumentHighlights("", [highlight]);

        assert.strictEqual(rendered, ``);
    });

    test("TextDocument as TextDocument is empty", () => {
        const highlight: DocumentHighlight = {
            kind: DocumentHighlightKind.Read,
            range: {start: {line: 2, character: 7}, end: {line: 0, character: 7}}
        };

        const rendered = renderDocumentHighlights(TextDocument.create("", "plaintext", 0, ""), [highlight]);

        assert.strictEqual(rendered, ``);
    });

    test("End line is before start line", () => {
        const highlight: DocumentHighlight = {
            kind: DocumentHighlightKind.Read,
            range: {start: {line: 2, character: 7}, end: {line: 0, character: 7}}
        };

        const rendered = renderDocumentHighlights(sourceCode, [highlight]);

        assert.strictEqual(rendered,
            'Found at least one DocumentHighlight with its end position being earlier than its start position.');
    });

    test("End character is before start character", () => {
        const highlight: DocumentHighlight = {
            kind: DocumentHighlightKind.Read,
            range: {start: {line: 0, character: 10}, end: {line: 0, character: 5}}
        };

        const rendered = renderDocumentHighlights(sourceCode, [highlight]);

        assert.strictEqual(rendered,
            'Found at least one DocumentHighlight with its end position being earlier than its start position.');
    });

    test("Start line is before document start", () => {
        const highlight: DocumentHighlight = {
            kind: DocumentHighlightKind.Read,
            range: {start: {line: -10, character: 10}, end: {line: 0, character: 6}}
        };

        const rendered = renderDocumentHighlights(sourceCode, [highlight]);

        assert.strictEqual(rendered,
            `<Read>export</Read> function aFunction() { }
function anotherFunction() { }`);
    });

    test("End line is before document start", () => {
        const highlight: DocumentHighlight = {
            kind: DocumentHighlightKind.Read,
            range: {start: {line: 0, character: 10}, end: {line: -10, character: 5}}
        };

        const rendered = renderDocumentHighlights(sourceCode, [highlight]);

        assert.strictEqual(rendered,
            'Found at least one DocumentHighlight with its end position being earlier than its start position.');
    });

    test("Start character is before document start", () => {
        const highlight: DocumentHighlight = {
            kind: DocumentHighlightKind.Read,
            range: {start: {line: 0, character: -10}, end: {line: 0, character: 6}}
        };

        const rendered = renderDocumentHighlights(sourceCode, [highlight]);

        assert.strictEqual(rendered,
            `<Read>export</Read> function aFunction() { }
function anotherFunction() { }`);
    });

    test("End character is before document start", () => {
        const highlight: DocumentHighlight = {
            kind: DocumentHighlightKind.Read,
            range: {start: {line: 0, character: 10}, end: {line: 0, character: -10}}
        };

        const rendered = renderDocumentHighlights(sourceCode, [highlight]);

        assert.strictEqual(rendered,
            'Found at least one DocumentHighlight with its end position being earlier than its start position.');
    });

    test("Start line is beyond document end", () => {
        const highlight: DocumentHighlight = {
            kind: DocumentHighlightKind.Read,
            range: {start: {line: 10, character: 10}, end: {line: 11, character: 5}}
        };

        const rendered = renderDocumentHighlights(sourceCode, [highlight]);

        assert.strictEqual(rendered,
            `export function aFunction() { }
function anotherFunction() { }<Read></Read>`);
    });

    test("End line is beyond document end", () => {
        const highlight: DocumentHighlight = {
            kind: DocumentHighlightKind.Read,
            range: {start: {line: 0, character: 10}, end: {line: 100, character: 5}}
        };

        const rendered = renderDocumentHighlights(sourceCode, [highlight]);

        assert.strictEqual(rendered,
            `export fun<Read>ction aFunction() { }
function anotherFunction() { }</Read>`);
    });

    test("Start character is beyond document end", () => {
        const highlight: DocumentHighlight = {
            kind: DocumentHighlightKind.Read,
            range: {start: {line: 1, character: 100}, end: {line: 1, character: 101}}
        };

        const rendered = renderDocumentHighlights(sourceCode, [highlight]);

        assert.strictEqual(rendered,
            `export function aFunction() { }
function anotherFunction() { }<Read></Read>`);
    });

    test("End character is beyond document end", () => {
        const highlight: DocumentHighlight = {
            kind: DocumentHighlightKind.Read,
            range: {start: {line: 0, character: 10}, end: {line: 1, character: 100}}
        };

        const rendered = renderDocumentHighlights(sourceCode, [highlight]);

        assert.strictEqual(rendered,
            `export fun<Read>ction aFunction() { }
function anotherFunction() { }</Read>`);
    });
});
