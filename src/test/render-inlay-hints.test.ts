import {InlayHint, InlayHintKind} from "vscode-languageserver";
import {renderInlayHints} from "../inlay-hints-renderer";
import * as assert from "assert";
import {TextDocument} from "vscode-languageserver-textdocument";

suite("Render InlayHints", () => {
    const sourceCode =
        `interface Type {
}
function functionWithParam(aParam: string) { }`;

    test("Has no kind", () => {
        const inlayHint: InlayHint = {
            position: {line: 0, character: 16},
            label: "string label"
        };

        const rendered = renderInlayHints(sourceCode, [inlayHint]);

        assert.strictEqual(rendered,
            `interface Type {<InlayHint label="string label"/>
}
function functionWithParam(aParam: string) { }`);
    });

    test("Has kind", () => {
        const inlayHint: InlayHint = {
            position: {line: 0, character: 16},
            label: "string label",
            kind: InlayHintKind.Type
        };

        const rendered = renderInlayHints(sourceCode, [inlayHint]);

        assert.strictEqual(rendered,
            `interface Type {<Type label="string label"/>
}
function functionWithParam(aParam: string) { }`);
    });

    test("InlayHintLabelPart[] label", () => {
        const inlayHint: InlayHint = {
            position: {line: 0, character: 16},
            label: [
                {
                    value: "InlayHintLabelPart",
                    tooltip: ""
                },
                {
                    value: "label",
                    command: {
                        command: "command",
                        title: "title"
                    }
                }
            ],
            kind: InlayHintKind.Type
        };

        const rendered = renderInlayHints(sourceCode, [inlayHint]);

        assert.strictEqual(rendered,
            `interface Type {<Type label="InlayHintLabelPart label"/>
}
function functionWithParam(aParam: string) { }`);
    });

//     test("Has string tooltip", () => {
//         const inlayHint: InlayHint = {
//             position: {line: 0, character: 16},
//             label: "string label",
//             kind: InlayHintKind.Type,
//             tooltip: "string tooltip"
//         };
//
//         const rendered = renderInlayHints(sourceCode, [inlayHint]);
//
//         assert.strictEqual(rendered,
//             `interface Type {<Type label="string label" tooltip="string tooltip"/>
// }
// function functionWithParam(aParam: string) { }`);
//     });
//
//     test("Has plaintext MarkupContent tooltip", () => {
//         const inlayHint: InlayHint = {
//             position: {line: 0, character: 16},
//             label: "string label",
//             kind: InlayHintKind.Type,
//             tooltip: {
//                 kind: MarkupKind.PlainText,
//                 value: "MarkupContent tooltip"
//             }
//         };
//
//         const rendered = renderInlayHints(sourceCode, [inlayHint]);
//
//         assert.strictEqual(rendered,
//             `interface Type {<Type label="string label" tooltip:plaintext="MarkupContent tooltip"/>
// }
// function functionWithParam(aParam: string) { }`);
//     });
//
//     test("Has markdown MarkupContent tooltip", () => {
//         const inlayHint: InlayHint = {
//             position: {line: 0, character: 16},
//             label: "string label",
//             kind: InlayHintKind.Type,
//             tooltip: {
//                 kind: MarkupKind.Markdown,
//                 value: "MarkupContent tooltip"
//             }
//         };
//
//         const rendered = renderInlayHints(sourceCode, [inlayHint]);
//
//         assert.strictEqual(rendered,
//             `interface Type {<Type label="string label" tooltip:markdown="MarkupContent tooltip"/>
// }
// function functionWithParam(aParam: string) { }`);
//     });

    test("Has left padding", () => {
        const inlayHint: InlayHint = {
            position: {line: 0, character: 16},
            label: "string label",
            paddingLeft: true
        };

        const rendered = renderInlayHints(sourceCode, [inlayHint]);

        assert.strictEqual(rendered,
            `interface Type {<_InlayHint label="string label"/>
}
function functionWithParam(aParam: string) { }`);
    });

    test("Has right padding", () => {
        const inlayHint: InlayHint = {
            position: {line: 0, character: 16},
            label: "string label",
            paddingRight: true
        };

        const rendered = renderInlayHints(sourceCode, [inlayHint]);

        assert.strictEqual(rendered,
            `interface Type {<InlayHint label="string label" _/>
}
function functionWithParam(aParam: string) { }`);
    });

    test("Has both paddings", () => {
        const inlayHint: InlayHint = {
            position: {line: 0, character: 16},
            label: "string label",
            paddingLeft: true,
            paddingRight: true
        };

        const rendered = renderInlayHints(sourceCode, [inlayHint]);

        assert.strictEqual(rendered,
            `interface Type {<_InlayHint label="string label" _/>
}
function functionWithParam(aParam: string) { }`);
    });

    //Negative cases

    test("TextDocument as string is empty", () => {
        const inlayHint: InlayHint = {
            position: {line: 0, character: 16},
            label: "string label",
            paddingLeft: true,
            paddingRight: true
        };

        const rendered = renderInlayHints("", [inlayHint]);

        assert.strictEqual(rendered, ``);
    });

    test("TextDocument as TextDocument is empty", () => {
        const inlayHint: InlayHint = {
            position: {line: 0, character: 16},
            label: "string label",
            paddingLeft: true,
            paddingRight: true
        };

        const rendered = renderInlayHints(TextDocument.create("", "plaintext", 0, ""), [inlayHint]);

        assert.strictEqual(rendered, ``);
    });
});
