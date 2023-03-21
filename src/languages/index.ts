import { readFileSync } from "fs";
import * as vscode from "vscode";
import { getPackFilePath, getPackname } from "../utils";

const _provideDefinition: vscode.DefinitionProvider["provideDefinition"] = (document, position) => {
  // 提取包名
  const { packName, line } = getPackname(document, position);
  try {
    // 到工作目录node_module查找包下的package.json
    const packageFilePath = getPackFilePath(document, packName);
    if (packageFilePath) {
      return [
        {
          originSelectionRange: new vscode.Range(
            new vscode.Position(line.lineNumber, line.firstNonWhitespaceCharacterIndex + 1),
            new vscode.Position(line.lineNumber, line.firstNonWhitespaceCharacterIndex + 1 + packName.length)
          ),
          targetRange: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)),
          targetUri: vscode.Uri.file(packageFilePath),
        },
      ];
    }
  } catch (error) {
    console.log(error);
  }

  return [];
};
const _provideHover: vscode.HoverProvider["provideHover"] = (document, position) => {
  const { packName } = getPackname(document, position);
  try {
    const packagePath = getPackFilePath(document, packName);
    if (packagePath) {
      const info = JSON.parse(readFileSync(packagePath, "utf-8"));
      const result: (vscode.MarkdownString | string)[] = [`package name: ${info.name}`, `package version: ${info.version}`];
      if (info.homepage) {
        result.push(`[查看主页：${info.homepage}](${info.homepage})`);
      }
      return new vscode.Hover(result);
    }
  } catch (error) {}
};

export default function registerLanguages(context: vscode.ExtensionContext) {
  const matchFileConfig = { language: "json", pattern: "**/package.json" };

  const definitionDisposable = vscode.languages.registerDefinitionProvider(matchFileConfig, {
    provideDefinition: _provideDefinition,
  });

  const hoverDisposable = vscode.languages.registerHoverProvider(matchFileConfig, {
    provideHover: _provideHover,
  });

  context.subscriptions.push(definitionDisposable);
  context.subscriptions.push(hoverDisposable);
}
