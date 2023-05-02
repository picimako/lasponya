import * as assert from "assert";
import {renderDiagnostics} from "../diagnostics-renderer";
import {Diagnostic, DiagnosticSeverity, DiagnosticTag} from "vscode-languageserver";
import {TextDocument} from "vscode-languageserver-textdocument";

suite("Render Diagnostics", () => {
    const sourceCode = "export function functionName() {\n}";

    //Severity

    test("Default severity", () => {
        const diagnostic: Diagnostic = {
            message: "diag message",
            range: {start: {line: 0, character: 16}, end: {line: 0, character: 28}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic]);

        assert.strictEqual(rendered,
            'export function <Diagnostic msg="diag message">functionName</Diagnostic>() {\n}');
    });

    test("Actual severity", () => {
        const diagnostic: Diagnostic = {
            message: "diag message",
            severity: DiagnosticSeverity.Hint,
            range: {start: {line: 0, character: 16}, end: {line: 0, character: 28}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic]);

        assert.strictEqual(rendered,
            'export function <Hint msg="diag message">functionName</Hint>() {\n}');
    });

    //Tags

    test("No tag", () => {
        const diagnostic: Diagnostic = {
            message: "diag message",
            severity: DiagnosticSeverity.Error,
            range: {start: {line: 0, character: 16}, end: {line: 0, character: 28}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic]);

        assert.strictEqual(rendered,
            'export function <Error msg="diag message">functionName</Error>() {\n}');
    });

    test("One tag", () => {
        const diagnostic: Diagnostic = {
            message: "diag message",
            severity: DiagnosticSeverity.Hint,
            tags: [DiagnosticTag.Unnecessary],
            range: {start: {line: 0, character: 16}, end: {line: 0, character: 28}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic]);

        assert.strictEqual(rendered,
            'export function <Hint:Unnecessary msg="diag message">functionName</Hint>() {\n}');
    });

    test("Two tags", () => {
        const diagnostic: Diagnostic = {
            message: "diag message",
            severity: DiagnosticSeverity.Hint,
            tags: [DiagnosticTag.Unnecessary, DiagnosticTag.Deprecated],
            range: {start: {line: 0, character: 16}, end: {line: 0, character: 28}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic]);

        assert.strictEqual(rendered,
            'export function <Hint:Unnecessary:Deprecated msg="diag message">functionName</Hint>() {\n}');
    });

    test("More than two tags", () => {
        const diagnostic: Diagnostic = {
            message: "diag message",
            severity: DiagnosticSeverity.Hint,
            tags: [DiagnosticTag.Unnecessary, DiagnosticTag.Deprecated, DiagnosticTag.Unnecessary],
            range: {start: {line: 0, character: 16}, end: {line: 0, character: 28}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic]);

        assert.strictEqual(rendered,
            'export function <Hint:Unnecessary:Deprecated:Unnecessary msg="diag message">functionName</Hint>() {\n}');
    });

    //Code

    test("No code", () => {
        const diagnostic: Diagnostic = {
            message: "diag message",
            severity: DiagnosticSeverity.Hint,
            range: {start: {line: 0, character: 16}, end: {line: 0, character: 28}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic]);

        assert.strictEqual(rendered,
            'export function <Hint msg="diag message">functionName</Hint>() {\n}');
    });

    test("Number code", () => {
        const diagnostic: Diagnostic = {
            message: "diag message",
            severity: DiagnosticSeverity.Hint,
            code: 200,
            range: {start: {line: 0, character: 16}, end: {line: 0, character: 28}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic]);

        assert.strictEqual(rendered,
            'export function <Hint msg="diag message" code=200>functionName</Hint>() {\n}');
    });

    test("String code", () => {
        const diagnostic: Diagnostic = {
            message: "diag message",
            severity: DiagnosticSeverity.Warning,
            code: "string diag code",
            range: {start: {line: 0, character: 16}, end: {line: 0, character: 28}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic]);

        assert.strictEqual(rendered,
            'export function <Warning msg="diag message" code="string diag code">functionName</Warning>() {\n}');
    });

    //Source

    test("No source", () => {
        const diagnostic: Diagnostic = {
            message: "diag message",
            severity: DiagnosticSeverity.Information,
            range: {start: {line: 0, character: 16}, end: {line: 0, character: 28}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic]);

        assert.strictEqual(rendered, 'export function <Information msg="diag message">functionName</Information>() {\n}');
    });

    test("Has source", () => {
        const diagnostic: Diagnostic = {
            message: "diag message",
            severity: DiagnosticSeverity.Hint,
            source: "diag source",
            range: {start: {line: 0, character: 16}, end: {line: 0, character: 28}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic]);

        assert.strictEqual(rendered, 'export function <Hint msg="diag message" src="diag source">functionName</Hint>() {\n}');
    });

    //Code description

    test("No code description", () => {
        const diagnostic: Diagnostic = {
            message: "diag message",
            severity: DiagnosticSeverity.Information,
            range: {start: {line: 0, character: 16}, end: {line: 0, character: 28}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic]);

        assert.strictEqual(rendered, 'export function <Information msg="diag message">functionName</Information>() {\n}');
    });

    test("Has code description", () => {
        const diagnostic: Diagnostic = {
            message: "diag message",
            severity: DiagnosticSeverity.Hint,
            codeDescription: {href: "https://some.url"},
            range: {start: {line: 0, character: 16}, end: {line: 0, character: 28}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic]);

        assert.strictEqual(rendered, 'export function ' +
            '<Hint msg="diag message" codeDesc="https://some.url">functionName</Hint>() {\n}');
    });

    //All inclusive

    test("All properties", () => {
        const diagnostic: Diagnostic = {
            message: "diag message",
            severity: DiagnosticSeverity.Hint,
            source: "diag source",
            code: "diag code",
            codeDescription: {href: "https://some.url"},
            tags: [DiagnosticTag.Unnecessary, DiagnosticTag.Deprecated],
            range: {start: {line: 0, character: 16}, end: {line: 0, character: 28}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic]);

        assert.strictEqual(rendered,
            'export function <Hint:Unnecessary:Deprecated ' +
            'msg="diag message" ' +
            'code="diag code" ' +
            'src="diag source" ' +
            'codeDesc="https://some.url">functionName</Hint>() {\n}');
    });

    //Multiple diagnostics

    //|--------|
    //               |--------|
    test("Multiple non-intersecting", () => {
        const diagnostic1: Diagnostic = {
            message: "diag1",
            severity: DiagnosticSeverity.Error,
            range: {start: {line: 0, character: 0}, end: {line: 0, character: 6}}
        };

        const diagnostic2: Diagnostic = {
            message: "diag2",
            severity: DiagnosticSeverity.Hint,
            range: {start: {line: 0, character: 16}, end: {line: 0, character: 28}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic1, diagnostic2]);

        assert.strictEqual(rendered,
            '<Error msg="diag1">export</Error> function <Hint msg="diag2">functionName</Hint>() {\n}');
    });

    //    |--------|
    //|--------|
    test("Multiple partially intersecting", () => {
        const diagnostic1: Diagnostic = {
            message: "diag1",
            severity: DiagnosticSeverity.Error,
            range: {start: {line: 0, character: 0}, end: {line: 0, character: 15}}
        };

        const diagnostic2: Diagnostic = {
            message: "diag2",
            severity: DiagnosticSeverity.Hint,
            range: {start: {line: 0, character: 10}, end: {line: 0, character: 25}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic1, diagnostic2]);

        assert.strictEqual(rendered,
            '<Error msg="diag1">export fun<Hint msg="diag2">ction</Error> functionN</Hint>ame() {\n}');
    });

    //|--------|
    //|---|
    test("Multiple containing on start", () => {
        const diagnostic1: Diagnostic = {
            message: "diag1",
            severity: DiagnosticSeverity.Error,
            range: {start: {line: 0, character: 0}, end: {line: 0, character: 15}}
        };

        const diagnostic2: Diagnostic = {
            message: "diag2",
            severity: DiagnosticSeverity.Hint,
            range: {start: {line: 0, character: 0}, end: {line: 0, character: 6}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic1, diagnostic2]);

        assert.strictEqual(rendered,
            '<Error msg="diag1"><Hint msg="diag2">export</Hint> function</Error> functionName() {\n}');
    });

    //|--------|
    //     |---|
    test("Multiple containing on end", () => {
        const diagnostic1: Diagnostic = {
            message: "diag1",
            severity: DiagnosticSeverity.Error,
            range: {start: {line: 0, character: 0}, end: {line: 0, character: 15}}
        };

        const diagnostic2: Diagnostic = {
            message: "diag2",
            severity: DiagnosticSeverity.Hint,
            range: {start: {line: 0, character: 10}, end: {line: 0, character: 15}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic1, diagnostic2]);

        assert.strictEqual(rendered,
            '<Error msg="diag1">export fun<Hint msg="diag2">ction</Error></Hint> functionName() {\n}');
    });

    //|--------|
    //  |---|
    test("Multiple containing completely", () => {
        const diagnostic1: Diagnostic = {
            message: "diag1",
            severity: DiagnosticSeverity.Error,
            range: {start: {line: 0, character: 0}, end: {line: 0, character: 20}}
        };

        const diagnostic2: Diagnostic = {
            message: "diag2",
            severity: DiagnosticSeverity.Hint,
            range: {start: {line: 0, character: 10}, end: {line: 0, character: 15}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic1, diagnostic2]);

        assert.strictEqual(rendered,
            '<Error msg="diag1">export fun<Hint msg="diag2">ction</Hint> func</Error>tionName() {\n}');
    });

    //|--------|
    //|--------|
    test("Multiple equal-range", () => {
        const diagnostic1: Diagnostic = {
            message: "diag1",
            severity: DiagnosticSeverity.Error,
            range: {start: {line: 0, character: 7}, end: {line: 0, character: 15}}
        };

        const diagnostic2: Diagnostic = {
            message: "diag2",
            severity: DiagnosticSeverity.Hint,
            range: {start: {line: 0, character: 7}, end: {line: 0, character: 15}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic1, diagnostic2]);

        assert.strictEqual(rendered,
            'export <Error msg="diag1"><Hint msg="diag2">function</Error></Hint> functionName() {\n}');
    });

    test("Multiple not in ascending order by their start positions", () => {
        const diagnostic1: Diagnostic = {
            message: "diag1",
            severity: DiagnosticSeverity.Error,
            range: {start: {line: 0, character: 7}, end: {line: 0, character: 15}}
        };

        const diagnostic2: Diagnostic = {
            message: "diag2",
            severity: DiagnosticSeverity.Hint,
            range: {start: {line: 0, character: 0}, end: {line: 0, character: 5}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic1, diagnostic2]);

        assert.strictEqual(rendered,
            '<Hint msg="diag2">expor</Hint>t <Error msg="diag1">function</Error> functionName() {\n}');
    });

    //Other cases

    test("Multiline diagnostics", () => {
        const diagnostic: Diagnostic = {
            message: "diag1",
            severity: DiagnosticSeverity.Error,
            range: {start: {line: 0, character: 7}, end: {line: 2, character: 5}}
        };

        const rendered = renderDiagnostics(
            'export function functionName() {\n' +
            '   val number = 6;\n' +
            '   var string = "some string"\n' +
            '}',
            [diagnostic]);

        assert.strictEqual(rendered,
            'export <Error msg="diag1">function functionName() {\n' +
            '   val number = 6;\n' +
            '   va</Error>r string = "some string"\n' +
            '}');
    });

    //Negative cases

    test("TextDocument as string is empty", () => {
        const diagnostic: Diagnostic = {
            message: "diag1",
            severity: DiagnosticSeverity.Error,
            range: {start: {line: 2, character: 7}, end: {line: 0, character: 7}}
        };

        const rendered = renderDiagnostics("", [diagnostic]);

        assert.strictEqual(rendered, ``);
    });

    test("TextDocument as TextDocument is empty", () => {
        const diagnostic: Diagnostic = {
            message: "diag1",
            severity: DiagnosticSeverity.Error,
            range: {start: {line: 2, character: 7}, end: {line: 0, character: 7}}
        };

        const rendered = renderDiagnostics(TextDocument.create("", "plaintext", 0, ""), [diagnostic]);

        assert.strictEqual(rendered, ``);
    });

    test("End line is before start line", () => {
        const diagnostic: Diagnostic = {
            message: "diag1",
            severity: DiagnosticSeverity.Error,
            range: {start: {line: 2, character: 7}, end: {line: 0, character: 7}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic]);

        assert.strictEqual(rendered,
            'Found at least one Diagnostic with its end position being earlier than its start position.');
    });

    test("End character is before start character", () => {
        const diagnostic: Diagnostic = {
            message: "diag1",
            severity: DiagnosticSeverity.Error,
            range: {start: {line: 0, character: 10}, end: {line: 0, character: 5}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic]);

        assert.strictEqual(rendered,
            'Found at least one Diagnostic with its end position being earlier than its start position.');
    });

    test("Start line is before document start", () => {
        const diagnostic: Diagnostic = {
            message: "diag1",
            severity: DiagnosticSeverity.Error,
            range: {start: {line: -10, character: 10}, end: {line: 0, character: 5}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic]);

        assert.strictEqual(rendered,
            '<Error msg="diag1">expor</Error>t function functionName() {\n}');
    });

    test("End line is before document start", () => {
        const diagnostic: Diagnostic = {
            message: "diag1",
            severity: DiagnosticSeverity.Error,
            range: {start: {line: 0, character: 10}, end: {line: -10, character: 5}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic]);

        assert.strictEqual(rendered,
            'Found at least one Diagnostic with its end position being earlier than its start position.');
    });

    test("Start character is before document start", () => {
        const diagnostic: Diagnostic = {
            message: "diag1",
            severity: DiagnosticSeverity.Error,
            range: {start: {line: 0, character: -10}, end: {line: 0, character: 5}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic]);

        assert.strictEqual(rendered,
            '<Error msg="diag1">expor</Error>t function functionName() {\n}');
    });

    test("End character is before document start", () => {
        const diagnostic: Diagnostic = {
            message: "diag1",
            severity: DiagnosticSeverity.Error,
            range: {start: {line: 0, character: 10}, end: {line: 0, character: -10}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic]);

        assert.strictEqual(rendered,
            'Found at least one Diagnostic with its end position being earlier than its start position.');
    });

    test("Start line is beyond document end", () => {
        const diagnostic: Diagnostic = {
            message: "diag1",
            severity: DiagnosticSeverity.Error,
            range: {start: {line: 10, character: 10}, end: {line: 11, character: 5}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic]);

        assert.strictEqual(rendered,
            'export function functionName() {\n' +
            '}<Error msg="diag1"></Error>');
    });

    test("End line is beyond document end", () => {
        const diagnostic: Diagnostic = {
            message: "diag1",
            severity: DiagnosticSeverity.Error,
            range: {start: {line: 0, character: 10}, end: {line: 100, character: 5}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic]);

        assert.strictEqual(rendered,
            'export fun<Error msg="diag1">ction functionName() {\n' +
            '}</Error>');
    });

    test("Start character is beyond document end", () => {
        const diagnostic: Diagnostic = {
            message: "diag1",
            severity: DiagnosticSeverity.Error,
            range: {start: {line: 1, character: 100}, end: {line: 1, character: 101}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic]);

        assert.strictEqual(rendered,
            'export function functionName() {\n' +
            '}<Error msg="diag1"></Error>');
    });

    test("End character is beyond document end", () => {
        const diagnostic: Diagnostic = {
            message: "diag1",
            severity: DiagnosticSeverity.Error,
            range: {start: {line: 0, character: 10}, end: {line: 1, character: 100}}
        };

        const rendered = renderDiagnostics(sourceCode, [diagnostic]);

        assert.strictEqual(rendered,
            'export fun<Error msg="diag1">ction functionName() {\n' +
            '}</Error>');
    });
});
