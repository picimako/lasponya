# Lasponya

[![Version](https://img.shields.io/npm/v/lasponya.svg)](https://npmjs.org/package/lasponya)
![Build](https://github.com/picimako/lasponya/workflows/Build/badge.svg)

Lasponya is a test utility that 'renders' [Language Server Protocol](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/)
objects as strings with a custom representation of them, into the tested documents.

Its aim is to improve testing LSP objects in [vscode-languageserver-node](https://github.com/microsoft/vscode-languageserver-node) based language server implementations,
by providing a visual representation of them, thus
- making it easier to validate them using a simple string comparison, instead of validating their individual properties one by one,
- validating multiple (even tens or hundreds) of them in a single rendered string,
- and, by rendering them as strings, provide better understanding and overview of how those objects are configured, and what exact data users will see.

This utility is greatly inspired by and is based on how the [IntelliJ Platform](https://plugins.jetbrains.com/docs/intellij/testing-highlighting.html#expected-highlighting-results)
does testing on inspections, annotations, inlay hints and similar features.

Lasponya is assertion-library agnostic to keep the implementation and long-term maintenance simpler and faster.

## Types supported

The types currently supported are:
- [`Diagnostic`](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#diagnostic)
- [`DocumentHighlight`](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_documentHighlight)
- [`InlayHint`](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_inlayHint)
- [`FoldingRange`](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_foldingRange)
- [`SelectionRange`](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_selectionRange)

## How to use it

First, make sure to install **lasponya** as dependency and include it in your `package.json` file. Then
- in your tests, collect the `Diagnostic`, `DocumentHighlight` and other LSP objects to be tested,
- call `render*()`, for example `renderDiagnostics()` on them,
- compare the returned string result with an expected value.

A simple test could look something like this

```typescript
import {renderDiagnostics} from "lasponya";

test("Collect diagnostics", () => {
    const document = createTestDocument(`export function doSomeStuff() {
}`);
    const diagnostics: Diagnostic[] = collectDiagnostics(document);

    assert.strictEqual(
        //Performs the rendering, and returns the actual value.
        renderDiagnostics(document, diagnostics),
        //The expected value in rendered form.
        `export function <Warning msg="Use a more descriptive function name" code="functions.name.descriptive">doSomeStuff</Warning>() {
}`
    );
});
```

## Why use it

By testing the visual representation of LSP objects rendered into the test code, you can have more meaningful and manageable tests and test data,
and potentially remove test utility methods and types, and have cleaner test code.

Using Lasponya you will no longer need solutions like the one below, or similar solutions with custom test utilities:

```typescript
test("Collect diagnostics", () => {
    const document = createTestDocument(`export function doSomeStuff() {
}`);
    const diagnostics: Diagnostic[] = collectDiagnostics(document);

    assert.strictEqual(diagnostics.length, 1);
    assert.strictEqual(diagnostics[0].severity, DiagnosticSeverity.Warning);
    assert.strictEqual(diagnostics[0].message, "Use a more descriptive function name");
    assert.strictEqual(diagnostics[0].code, "functions.name.descriptive");
    assert.strictEqual(diagnostics[0].range.start, {line: 0, character: 16});
    assert.strictEqual(diagnostics[0].range.end, {line: 0, character: 27});
});
```

## Rendering

The LSP objects are rendered as custom XML(-ish) tags that wrap the parts of the code the objects are applied to
(the pipe character (`|`) below is an OR connection, a part of the XML tag can have different value sources).

### Diagnostic

Rendered `Diagnostic`s take the following form:

```xml
<Diagnostic.severity|Diagnostic:Diagnostic.tags
    msg="Diagnostic.message"
    code=Diagnostic.code|"Diagnostic.code"
    src="Diagnostic.source"
    codeDesc="CodeDescription.href">code highlighted by this diagnostic</Diagnostic.severity|Diagnostic>
```

- If there is no `Diagnostic.severity` specified, the string `Diagnostic` is included instead.
- Multiple `Diagnostic.tags` are separated with colons, e.g. `<Error:Deprecated:Unnecessary ...>`.
- `Diagnostic.code` can be a number or a string. Strings are wrapped in double-quotes, while numbers are not.
- Since the following properties are optional, if they are not specified in the Diagnostic object, they are not rendered either:
`Diagnostic.tags`, `Diagnostic.code`, `Diagnostic.source`, `Diagnostic.codeDescription`

#### Example

Given an input source code of:

```typescript
export function functionName() {
}
```

the rendered code may look something like this, depending on the diagnostic data:

```typescript
export <Hint:Deprecated msg="This keyword is deprecated." code=102>function</Hint> functionName() {
}
```

### DocumentHighlight

Rendered `DocumentHighlight`s take the following form:

```xml
<DocumentHighlight.kind|DocumentHighlight>code highlighted by this highlight<DocumentHighlight.kind|DocumentHighlight>
```

- If there is no `DocumentHighlight.kind` specified, the string `DocumentHighlight` is included instead.

#### Example

Given an input source code of:

```typescript
export function aFunction() { }
function anotherFunction() { }
```

the rendered code may look something like this:

```typescript
export <Read>function</Read> aFunction() { }
<Write>function</Write> anotherFunction() { }
```

### InlayHint

Rendered `InlayHint`s take the following form:

```xml
<_InlayHint.kind|InlayHint
    label="InlayHint.label|InlayHint.label[].value" _/>
```

- If there is no `InlayHint.kind` specified, the string `InlayHint` is included instead.
- The underscore at the left (`<_InlayHint...`) is displayed when `InlayHint.paddingLeft` is `true`.
- The underscore at the right (`... _/>`) is displayed when `InlayHint.paddingRight` is `true`.
- There is no support yet for rendering `InlayHint.textEdits` and `InlayHint.tooltip`.

#### Example

Given an input source code of:

```typescript
interface SomeType {
}
```

the rendered code may look something like this:

```typescript
interface SomeType {<Type label="string label" _/>
}
```

### FoldingRange

Rendered `FoldingRange`s take the following form:

```xml
<FoldingRange.kind.ID|FoldingRange.ID
    collapsed="FoldingRange.collapsedText|...">the folded code</FoldingRange.kind.ID|FoldingRange.ID>
```

- In case `FoldingRange.collapsedText` is not specified, it defaults to `...`.
- In order to distinguish multiple foldings (nested or not), this renderer adds an identifier to each folding range.
  - It iterates through the following list of characters, and if it uses up all its characters, it starts over from the first one:
  `abcdefghijklmnopqrstuvqxyzABCDEFGHIJKLMNOPQRSTUVWXY0123456789`

#### Example

Given an input source code of:

```typescript
export function aFunction() {
  const num = 5;
    {
        let aString = "lasponya";
    }
}
```

the rendered code may look something like this:

```typescript
export function aFunction() {<FoldingRange.a collapsed="...">
  const num = 5;
    {<FoldingRange.b collapsed="variables...">
        let aString = "lasponya"
    }</FoldingRange.b>
</FoldingRange.a>}
```

### SelectionRange

Rendered `SelectionRange`s take the following form:

```xml
<SelectionRange>the selected code</SelectionRange>
```

- There is no support yet for marking the cursor position in the document by a dedicated tag like `<cursor>` or something similar,
so that the selection range could be calculated from that.

#### Example

Given an input source code of:

```typescript
export function aFunction() {
  const num = 5;
}
```

the rendered code may look something like this:

```typescript
export function aFunction() {
  <SelectionRange>const num = 5;</SelectionRange>
}
```

## General notes for `render*()` functions

Renderers perform validation to prevent rendering LSP objects with their end ranges being earlier than their start.
In that case no rendering is done, instead a relevant error message is returned:
> Found at least one &lt;typename> with its end position being earlier than its start position.

Other than that, many edge cases, like offsets beyond document boundaries, are handled by `TextDocument` in a way that they produce valid
offsets for them, within the document.

## Origin of the package name

Lasponya is a Hungarian name for the delicious fruit called Mespilus, and it contains the letters L, S, P (Language Server Protocol) in this order.
Now you know it. :)

## Acknowledgements

Thank you to the folks over at JetBrains for creating the 'visual' testing capability for their various platform features.
