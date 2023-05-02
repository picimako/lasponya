import {renderFoldingRanges} from "../folding-range-renderer";
import * as assert from "assert";
import {FoldingRange, FoldingRangeKind} from "vscode-languageserver";
import {TextDocument} from "vscode-languageserver-textdocument";

suite("Render FoldingRanges", () => {
    const sourceCode =
        `export function aFunction() {
    const num = 5;
    let aString = "lasponya"
}`;

    //Single folding range

    test("Has no kind", () => {
        const foldingRange: FoldingRange = {
            startLine: 1,
            endLine: 2
        };

        const rendered = renderFoldingRanges(sourceCode, [foldingRange]);

        assert.strictEqual(rendered,
            `export function aFunction() {
    const num = 5;<FoldingRange collapsed="...">
    let aString = "lasponya"</FoldingRange>
}`);
    });

    test("Has kind", () => {
        const foldingRange: FoldingRange = {
            startLine: 1,
            endLine: 2,
            kind: FoldingRangeKind.Region
        };

        const rendered = renderFoldingRanges(sourceCode, [foldingRange]);

        assert.strictEqual(rendered,
            `export function aFunction() {
    const num = 5;<Region collapsed="...">
    let aString = "lasponya"</Region>
}`);
    });

    test("Line to line folding", () => {
        const foldingRange: FoldingRange = {
            startLine: 1,
            endLine: 2,
            kind: FoldingRangeKind.Comment
        };

        const rendered = renderFoldingRanges(sourceCode, [foldingRange]);

        assert.strictEqual(rendered,
            `export function aFunction() {
    const num = 5;<Comment collapsed="...">
    let aString = "lasponya"</Comment>
}`);
    });

    test("Line to character folding", () => {
        const foldingRange: FoldingRange = {
            startLine: 1,
            endLine: 2,
            endCharacter: 8
        };

        const rendered = renderFoldingRanges(sourceCode, [foldingRange]);

        assert.strictEqual(rendered,
            `export function aFunction() {
    const num = 5;<FoldingRange collapsed="...">
    let </FoldingRange>aString = "lasponya"
}`);
    });

    test("Character to line folding", () => {
        const foldingRange: FoldingRange = {
            startLine: 1,
            startCharacter: 5,
            endLine: 2
        };

        const rendered = renderFoldingRanges(sourceCode, [foldingRange]);

        assert.strictEqual(rendered,
            `export function aFunction() {
    c<FoldingRange collapsed="...">onst num = 5;
    let aString = "lasponya"</FoldingRange>
}`);
    });

    test("Character to character folding", () => {
        const foldingRange: FoldingRange = {
            startLine: 1,
            startCharacter: 5,
            endLine: 2,
            endCharacter: 5
        };

        const rendered = renderFoldingRanges(sourceCode, [foldingRange]);

        assert.strictEqual(rendered,
            `export function aFunction() {
    c<FoldingRange collapsed="...">onst num = 5;
    l</FoldingRange>et aString = "lasponya"
}`);
    });

    test("Default collapsed text", () => {
        const foldingRange: FoldingRange = {
            startLine: 1,
            endLine: 2,
        };

        const rendered = renderFoldingRanges(sourceCode, [foldingRange]);

        assert.strictEqual(rendered,
            `export function aFunction() {
    const num = 5;<FoldingRange collapsed="...">
    let aString = "lasponya"</FoldingRange>
}`);
    });

    test("Custom collapsed text", () => {
        const foldingRange: FoldingRange = {
            startLine: 1,
            endLine: 2,
            collapsedText: "collapsed some variables"
        };

        const rendered = renderFoldingRanges(sourceCode, [foldingRange]);

        assert.strictEqual(rendered,
            `export function aFunction() {
    const num = 5;<FoldingRange collapsed="collapsed some variables">
    let aString = "lasponya"</FoldingRange>
}`);
    });

    test("Custom collapsed text with kind", () => {
        const foldingRange: FoldingRange = {
            startLine: 1,
            endLine: 2,
            collapsedText: "collapsed some variables",
            kind: FoldingRangeKind.Imports
        };

        const rendered = renderFoldingRanges(sourceCode, [foldingRange]);

        assert.strictEqual(rendered,
            `export function aFunction() {
    const num = 5;<Imports collapsed="collapsed some variables">
    let aString = "lasponya"</Imports>
}`);
    });

    //Multiple folding ranges

    //|--------|
    //               |--------|
    test("Multiple non-intersecting", () => {
        const foldingRange1: FoldingRange = {
            startLine: 0,
            startCharacter: 0,
            endLine: 0,
            endCharacter: 6
        };
        const foldingRange2: FoldingRange = {
            startLine: 0,
            startCharacter: 16,
            endLine: 0,
            endCharacter: 28
        };

        const rendered = renderFoldingRanges(sourceCode, [foldingRange1, foldingRange2]);

        assert.strictEqual(rendered,
            `<FoldingRange.a collapsed="...">export</FoldingRange.a> function <FoldingRange.b collapsed="...">aFunction() </FoldingRange.b>{
    const num = 5;
    let aString = "lasponya"
}`);
    });

    //    |--------|
    //|--------|
    test("Multiple partially intersecting", () => {
        const foldingRange1: FoldingRange = {
            startLine: 0,
            startCharacter: 0,
            endLine: 0,
            endCharacter: 15
        };
        const foldingRange2: FoldingRange = {
            startLine: 0,
            startCharacter: 10,
            endLine: 0,
            endCharacter: 25
        };

        const rendered = renderFoldingRanges(sourceCode, [foldingRange1, foldingRange2]);

        assert.strictEqual(rendered,
            `<FoldingRange.a collapsed="...">export fun<FoldingRange.b collapsed="...">ction</FoldingRange.a> aFunction</FoldingRange.b>() {
    const num = 5;
    let aString = "lasponya"
}`);
    });

    //|--------|
    //|---|
    test("Multiple containing on start", () => {
        const foldingRange1: FoldingRange = {
            startLine: 0,
            startCharacter: 0,
            endLine: 0,
            endCharacter: 15
        };
        const foldingRange2: FoldingRange = {
            startLine: 0,
            startCharacter: 0,
            endLine: 0,
            endCharacter: 6
        };

        const rendered = renderFoldingRanges(sourceCode, [foldingRange1, foldingRange2]);

        assert.strictEqual(rendered,
            `<FoldingRange.a collapsed="..."><FoldingRange.b collapsed="...">export</FoldingRange.b> function</FoldingRange.a> aFunction() {
    const num = 5;
    let aString = "lasponya"
}`);

    });

    //|--------|
    //     |---|
    test("Multiple containing on end", () => {
        const foldingRange1: FoldingRange = {
            startLine: 0,
            startCharacter: 0,
            endLine: 0,
            endCharacter: 15
        };
        const foldingRange2: FoldingRange = {
            startLine: 0,
            startCharacter: 10,
            endLine: 0,
            endCharacter: 15
        };

        const rendered = renderFoldingRanges(sourceCode, [foldingRange1, foldingRange2]);

        assert.strictEqual(rendered,
            `<FoldingRange.a collapsed="...">export fun<FoldingRange.b collapsed="...">ction</FoldingRange.a></FoldingRange.b> aFunction() {
    const num = 5;
    let aString = "lasponya"
}`);
    });

    //|--------|
    //  |---|
    test("Multiple containing completely", () => {
        const foldingRange1: FoldingRange = {
            startLine: 0,
            startCharacter: 0,
            endLine: 0,
            endCharacter: 20
        };
        const foldingRange2: FoldingRange = {
            startLine: 0,
            startCharacter: 10,
            endLine: 0,
            endCharacter: 15
        };

        const rendered = renderFoldingRanges(sourceCode, [foldingRange1, foldingRange2]);

        assert.strictEqual(rendered,
            `<FoldingRange.a collapsed="...">export fun<FoldingRange.b collapsed="...">ction</FoldingRange.b> aFun</FoldingRange.a>ction() {
    const num = 5;
    let aString = "lasponya"
}`);
    });

    //|--------|
    //|--------|
    test("Multiple equal-range", () => {
        const foldingRange1: FoldingRange = {
            startLine: 0,
            startCharacter: 7,
            endLine: 0,
            endCharacter: 15
        };
        const foldingRange2: FoldingRange = {
            startLine: 0,
            startCharacter: 7,
            endLine: 0,
            endCharacter: 15
        };

        const rendered = renderFoldingRanges(sourceCode, [foldingRange1, foldingRange2]);

        assert.strictEqual(rendered,
            `export <FoldingRange.a collapsed="..."><FoldingRange.b collapsed="...">function</FoldingRange.a></FoldingRange.b> aFunction() {
    const num = 5;
    let aString = "lasponya"
}`);
    });

    test("Multiple not in ascending order by their start positions", () => {
        const foldingRange1: FoldingRange = {
            startLine: 0,
            startCharacter: 7,
            endLine: 0,
            endCharacter: 15
        };
        const foldingRange2: FoldingRange = {
            startLine: 0,
            startCharacter: 0,
            endLine: 0,
            endCharacter: 5
        };

        const rendered = renderFoldingRanges(sourceCode, [foldingRange1, foldingRange2]);

        assert.strictEqual(rendered,
            `<FoldingRange.a collapsed="...">expor</FoldingRange.a>t <FoldingRange.b collapsed="...">function</FoldingRange.b> aFunction() {
    const num = 5;
    let aString = "lasponya"
}`);
    });

    //Other cases

    test("Multiline folding ranges", () => {
        const foldingRange: FoldingRange = {
            startLine: 0,
            startCharacter: 7,
            endLine: 2,
            endCharacter: 5
        };

        const rendered = renderFoldingRanges(sourceCode, [foldingRange]);

        assert.strictEqual(rendered,
            `export <FoldingRange collapsed="...">function aFunction() {
    const num = 5;
    l</FoldingRange>et aString = "lasponya"
}`);
    });

    //Negative cases

    test("TextDocument as string is empty", () => {
        const foldingRange: FoldingRange = {
            startLine: 2,
            startCharacter: 7,
            endLine: 0,
            endCharacter: 7
        };

        const rendered = renderFoldingRanges("", [foldingRange]);

        assert.strictEqual(rendered, ``);
    });

    test("TextDocument as TextDocument is empty", () => {
        const foldingRange: FoldingRange = {
            startLine: 2,
            startCharacter: 7,
            endLine: 0,
            endCharacter: 7
        };

        const rendered = renderFoldingRanges(TextDocument.create("", "plaintext", 0, ""), [foldingRange]);

        assert.strictEqual(rendered, ``);
    });

    test("No FoldingRange provided", () => {
        const rendered = renderFoldingRanges(sourceCode, []);

        assert.strictEqual(rendered, sourceCode);
    });

    test("End line is before start line", () => {
        const foldingRange: FoldingRange = {
            startLine: 2,
            startCharacter: 7,
            endLine: 0,
            endCharacter: 7
        };

        const rendered = renderFoldingRanges(sourceCode, [foldingRange]);

        assert.strictEqual(rendered,
            `Found at least one FoldingRange with its end position being earlier than its start position.`);
    });

    test("End character is before start character", () => {
        const foldingRange: FoldingRange = {
            startLine: 0,
            startCharacter: 10,
            endLine: 0,
            endCharacter: 5
        };

        const rendered = renderFoldingRanges(sourceCode, [foldingRange]);

        assert.strictEqual(rendered,
            `Found at least one FoldingRange with its end position being earlier than its start position.`);
    });

    test("Start line is before document start", () => {
        const foldingRange: FoldingRange = {
            startLine: -10,
            startCharacter: 10,
            endLine: 0,
            endCharacter: 5
        };

        const rendered = renderFoldingRanges(sourceCode, [foldingRange]);

        assert.strictEqual(rendered,
            `<FoldingRange collapsed="...">expor</FoldingRange>t function aFunction() {
    const num = 5;
    let aString = "lasponya"
}`);
    });

    test("End line is before document start", () => {
        const foldingRange: FoldingRange = {
            startLine: 0,
            startCharacter: 10,
            endLine: -10,
            endCharacter: 5
        };

        const rendered = renderFoldingRanges(sourceCode, [foldingRange]);

        assert.strictEqual(rendered,
            `Found at least one FoldingRange with its end position being earlier than its start position.`);
    });

    test("Start character is before document start", () => {
        const foldingRange: FoldingRange = {
            startLine: 0,
            startCharacter: -10,
            endLine: 0,
            endCharacter: 5
        };

        const rendered = renderFoldingRanges(sourceCode, [foldingRange]);

        assert.strictEqual(rendered,
            `<FoldingRange collapsed="...">expor</FoldingRange>t function aFunction() {
    const num = 5;
    let aString = "lasponya"
}`);
    });

    test("End character is before document start", () => {
        const foldingRange: FoldingRange = {
            startLine: 0,
            startCharacter: 10,
            endLine: 0,
            endCharacter: -10
        };

        const rendered = renderFoldingRanges(sourceCode, [foldingRange]);

        assert.strictEqual(rendered,
            `Found at least one FoldingRange with its end position being earlier than its start position.`);
    });

    test("Start line is beyond document end", () => {
        const foldingRange: FoldingRange = {
            startLine: 10,
            startCharacter: 10,
            endLine: 11,
            endCharacter: 5
        };

        const rendered = renderFoldingRanges(sourceCode, [foldingRange]);

        assert.strictEqual(rendered,
            `export function aFunction() {
    const num = 5;
    let aString = "lasponya"
}<FoldingRange collapsed="..."></FoldingRange>`);
    });

    test("End line is beyond document end", () => {
        const foldingRange: FoldingRange = {
            startLine: 0,
            startCharacter: 10,
            endLine: 100,
            endCharacter: 5
        };

        const rendered = renderFoldingRanges(sourceCode, [foldingRange]);

        assert.strictEqual(rendered,
            `export fun<FoldingRange collapsed="...">ction aFunction() {
    const num = 5;
    let aString = "lasponya"
}</FoldingRange>`);
    });

    test("Start character is beyond document end", () => {
        const foldingRange: FoldingRange = {
            startLine: 3,
            startCharacter: 100,
            endLine: 3,
            endCharacter: 101
        };

        const rendered = renderFoldingRanges(sourceCode, [foldingRange]);

        assert.strictEqual(rendered,
            `export function aFunction() {
    const num = 5;
    let aString = "lasponya"
}<FoldingRange collapsed="..."></FoldingRange>`);
    });

    test("End character is beyond document end", () => {
        const foldingRange: FoldingRange = {
            startLine: 0,
            startCharacter: 10,
            endLine: 3,
            endCharacter: 100
        };

        const rendered = renderFoldingRanges(sourceCode, [foldingRange]);

        assert.strictEqual(rendered,
            `export fun<FoldingRange collapsed="...">ction aFunction() {
    const num = 5;
    let aString = "lasponya"
}</FoldingRange>`);
    });
});
