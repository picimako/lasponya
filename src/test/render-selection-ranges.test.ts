import {renderSelectionRanges} from "../selection-range-renderer";
import * as assert from "assert";
import {SelectionRange} from "vscode-languageserver";
import {TextDocument} from "vscode-languageserver-textdocument";

suite("Render SelectionRanges", () => {
    const sourceCode =
        `export function aFunction() {
    const num = 5;
    let aString = "lasponya"
}`;

    //Single selection range

    test("Single selection", () => {
        const selectionRange: SelectionRange = {
            range: {
                start: {line: 0, character: 5},
                end: {line: 0, character: 20}
            }
        };

        const rendered = renderSelectionRanges(sourceCode, [selectionRange]);

        assert.strictEqual(rendered,
            `expor<SelectionRange>t function aFun</SelectionRange>ction() {
    const num = 5;
    let aString = "lasponya"
}`);
    });

    //Multiple selection ranges

    //|--------|
    //               |--------|
    test("Multiple non-intersecting", () => {
        const selectionRange1: SelectionRange = {
            range: {
                start: {line: 0, character: 0},
                end: {line: 0, character: 6}
            }
        };
        const selectionRange2: SelectionRange = {
            range: {
                start: {line: 0, character: 16},
                end: {line: 0, character: 28}
            }
        };

        const rendered = renderSelectionRanges(sourceCode, [selectionRange1, selectionRange2]);

        assert.strictEqual(rendered,
            `<SelectionRange>export</SelectionRange> function <SelectionRange>aFunction() </SelectionRange>{
    const num = 5;
    let aString = "lasponya"
}`);
    });

    //    |--------|
    //|--------|
    test("Multiple partially intersecting", () => {
        const selectionRange2: SelectionRange = {
            range: {
                start: {line: 0, character: 0},
                end: {line: 0, character: 15}
            }
        };
        const selectionRange1: SelectionRange = {
            range: {
                start: {line: 0, character: 10},
                end: {line: 0, character: 25}
            }
        };

        const rendered = renderSelectionRanges(sourceCode, [selectionRange1, selectionRange2]);

        assert.strictEqual(rendered,
            `<SelectionRange>export fun<SelectionRange>ction</SelectionRange> aFunction</SelectionRange>() {
    const num = 5;
    let aString = "lasponya"
}`);
    });

    //|--------|
    //|---|
    test("Multiple containing on start", () => {
        const selectionRange1: SelectionRange = {
            range: {
                start: {line: 0, character: 0},
                end: {line: 0, character: 15}
            }
        };
        const selectionRange2: SelectionRange = {
            range: {
                start: {line: 0, character: 0},
                end: {line: 0, character: 6}
            }
        };

        const rendered = renderSelectionRanges(sourceCode, [selectionRange1, selectionRange2]);

        assert.strictEqual(rendered,
            `<SelectionRange><SelectionRange>export</SelectionRange> function</SelectionRange> aFunction() {
    const num = 5;
    let aString = "lasponya"
}`);

    });

    //|--------|
    //     |---|
    test("Multiple containing on end", () => {
        const selectionRange1: SelectionRange = {
            range: {
                start: {line: 0, character: 0},
                end: {line: 0, character: 15}
            }
        };
        const selectionRange2: SelectionRange = {
            range: {
                start: {line: 0, character: 10},
                end: {line: 0, character: 15}
            }
        };

        const rendered = renderSelectionRanges(sourceCode, [selectionRange1, selectionRange2]);

        assert.strictEqual(rendered,
            `<SelectionRange>export fun<SelectionRange>ction</SelectionRange></SelectionRange> aFunction() {
    const num = 5;
    let aString = "lasponya"
}`);
    });

    //|--------|
    //  |---|
    test("Multiple containing completely", () => {
        const selectionRange1: SelectionRange = {
            range: {
                start: {line: 0, character: 0},
                end: {line: 0, character: 20}
            }
        };
        const selectionRange2: SelectionRange = {
            range: {
                start: {line: 0, character: 10},
                end: {line: 0, character: 15}
            }
        };

        const rendered = renderSelectionRanges(sourceCode, [selectionRange1, selectionRange2]);

        assert.strictEqual(rendered,
            `<SelectionRange>export fun<SelectionRange>ction</SelectionRange> aFun</SelectionRange>ction() {
    const num = 5;
    let aString = "lasponya"
}`);
    });

    //|--------|
    //|--------|
    test("Multiple equal-range", () => {
        const selectionRange1: SelectionRange = {
            range: {
                start: {line: 0, character: 7},
                end: {line: 0, character: 15}
            }
        };
        const selectionRange2: SelectionRange = {
            range: {
                start: {line: 0, character: 7},
                end: {line: 0, character: 15}
            }
        };

        const rendered = renderSelectionRanges(sourceCode, [selectionRange1, selectionRange2]);

        assert.strictEqual(rendered,
            `export <SelectionRange><SelectionRange>function</SelectionRange></SelectionRange> aFunction() {
    const num = 5;
    let aString = "lasponya"
}`);
    });

    test("Multiple not in ascending order by their start positions", () => {
        const selectionRange1: SelectionRange = {
            range: {
                start: {line: 0, character: 7},
                end: {line: 0, character: 15}
            }
        };
        const selectionRange2: SelectionRange = {
            range: {
                start: {line: 0, character: 0},
                end: {line: 0, character: 5}
            }
        };

        const rendered = renderSelectionRanges(sourceCode, [selectionRange1, selectionRange2]);

        assert.strictEqual(rendered,
            `<SelectionRange>expor</SelectionRange>t <SelectionRange>function</SelectionRange> aFunction() {
    const num = 5;
    let aString = "lasponya"
}`);
    });

    //Other cases

    test("Multiline selection ranges", () => {
        const selectionRange: SelectionRange = {
            range: {
                start: {line: 0, character: 7},
                end: {line: 2, character: 5}
            }
        };

        const rendered = renderSelectionRanges(sourceCode, [selectionRange]);

        assert.strictEqual(rendered,
            `export <SelectionRange>function aFunction() {
    const num = 5;
    l</SelectionRange>et aString = "lasponya"
}`);
    });

    //Negative cases

    test("TextDocument as string is empty", () => {
        const selectionRange: SelectionRange = {
            range: {
                start: {line: 2, character: 7},
                end: {line: 0, character: 7}
            }
        };

        const rendered = renderSelectionRanges("", [selectionRange]);

        assert.strictEqual(rendered, ``);
    });

    test("TextDocument as TextDocument is empty", () => {
        const selectionRange: SelectionRange = {
            range: {
                start: {line: 2, character: 7},
                end: {line: 0, character: 7}
            }
        };

        const rendered = renderSelectionRanges(TextDocument.create("", "plaintext", 0, ""), [selectionRange]);

        assert.strictEqual(rendered, ``);
    });

    test("No SelectionRange provided", () => {
        const rendered = renderSelectionRanges(sourceCode, []);

        assert.strictEqual(rendered, sourceCode);
    });

    test("End line is before start line", () => {
        const selectionRange: SelectionRange = {
            range: {
                start: {line: 2, character: 7},
                end: {line: 0, character: 7}
            }
        };

        const rendered = renderSelectionRanges(sourceCode, [selectionRange]);

        assert.strictEqual(rendered,
            `Found at least one SelectionRange with its end position being earlier than its start position.`);
    });

    test("End character is before start character", () => {
        const selectionRange: SelectionRange = {
            range: {
                start: {line: 0, character: 10},
                end: {line: 0, character: 5}
            }
        };

        const rendered = renderSelectionRanges(sourceCode, [selectionRange]);

        assert.strictEqual(rendered,
            `Found at least one SelectionRange with its end position being earlier than its start position.`);
    });

    test("Start line is before document start", () => {
        const selectionRange: SelectionRange = {
            range: {
                start: {line: -10, character: 10},
                end: {line: 0, character: 5}
            }
        };

        const rendered = renderSelectionRanges(sourceCode, [selectionRange]);

        assert.strictEqual(rendered,
            `<SelectionRange>expor</SelectionRange>t function aFunction() {
    const num = 5;
    let aString = "lasponya"
}`);
    });

    test("End line is before document start", () => {
        const selectionRange: SelectionRange = {
            range: {
                start: {line: 0, character: 10},
                end: {line: -10, character: 5}
            }
        };

        const rendered = renderSelectionRanges(sourceCode, [selectionRange]);

        assert.strictEqual(rendered,
            `Found at least one SelectionRange with its end position being earlier than its start position.`);
    });

    test("Start character is before document start", () => {
        const selectionRange: SelectionRange = {
            range: {
                start: {line: 0, character: -10},
                end: {line: 0, character: 5}
            }
        };

        const rendered = renderSelectionRanges(sourceCode, [selectionRange]);

        assert.strictEqual(rendered,
            `<SelectionRange>expor</SelectionRange>t function aFunction() {
    const num = 5;
    let aString = "lasponya"
}`);
    });

    test("End character is before document start", () => {
        const selectionRange: SelectionRange = {
            range: {
                start: {line: 0, character: 10},
                end: {line: 0, character: -10}
            }
        };

        const rendered = renderSelectionRanges(sourceCode, [selectionRange]);

        assert.strictEqual(rendered,
            `Found at least one SelectionRange with its end position being earlier than its start position.`);
    });

    test("Start line is beyond document end", () => {
        const selectionRange: SelectionRange = {
            range: {
                start: {line: 10, character: 10},
                end: {line: 11, character: 5}
            }
        };

        const rendered = renderSelectionRanges(sourceCode, [selectionRange]);

        assert.strictEqual(rendered,
            `export function aFunction() {
    const num = 5;
    let aString = "lasponya"
}<SelectionRange></SelectionRange>`);
    });

    test("End line is beyond document end", () => {
        const selectionRange: SelectionRange = {
            range: {
                start: {line: 0, character: 10},
                end: {line: 100, character: 5}
            }
        };

        const rendered = renderSelectionRanges(sourceCode, [selectionRange]);

        assert.strictEqual(rendered,
            `export fun<SelectionRange>ction aFunction() {
    const num = 5;
    let aString = "lasponya"
}</SelectionRange>`);
    });

    test("Start character is beyond document end", () => {
        const selectionRange: SelectionRange = {
            range: {
                start: {line: 3, character: 100},
                end: {line: 3, character: 101}
            }
        };

        const rendered = renderSelectionRanges(sourceCode, [selectionRange]);

        assert.strictEqual(rendered,
            `export function aFunction() {
    const num = 5;
    let aString = "lasponya"
}<SelectionRange></SelectionRange>`);
    });

    test("End character is beyond document end", () => {
        const selectionRange: SelectionRange = {
            range: {
                start: {line: 0, character: 10},
                end: {line: 3, character: 100}
            }
        };

        const rendered = renderSelectionRanges(sourceCode, [selectionRange]);

        assert.strictEqual(rendered,
            `export fun<SelectionRange>ction aFunction() {
    const num = 5;
    let aString = "lasponya"
}</SelectionRange>`);
    });
});
