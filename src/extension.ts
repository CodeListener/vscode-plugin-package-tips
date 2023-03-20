import * as vscode from "vscode";
import { existsSync, readFileSync } from "fs";
import { join, parse } from "path";
import { pathToFileURL } from "url";
type PackageJson = {
  [key in "devDependencies" | "dependencies"]?: Record<string, string>;
};

function getWorkspaceFolder(document: vscode.TextDocument) {
  const path = vscode.workspace.getWorkspaceFolder(document.uri);
  return path?.uri.fsPath;
}
const _provideDefinition: vscode.DefinitionProvider["provideDefinition"] = (document, position, token) => {
  // 获取目标行
  const line = document.lineAt(position);
  const sliceEndIndex = line.text.indexOf('"', line.firstNonWhitespaceCharacterIndex + 1);
  // 提取包名
  const packName: string = line.text.substring(line.firstNonWhitespaceCharacterIndex + 1, sliceEndIndex);
  try {
    const packageJson: PackageJson = JSON.parse(readFileSync(document.uri.fsPath, "utf8"));
    if (packageJson["devDependencies"]?.[packName] || packageJson["dependencies"]?.[packName]) {
      const projectFolderPath = getWorkspaceFolder(document); // parse(document.uri.fsPath);
      if (!projectFolderPath) {
        return;
      }
      const packageFilePath = join(projectFolderPath, `./node_modules/${packName}/package.json`);

      if (existsSync(packageFilePath)) {
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
      //   const res = JSON.parse(readFileSync(packageFilePath, "utf8"));
      // 获取当前package目录
      // console.log(document.uri);
      //   console.log(res);
    }
  } catch (error) {
    console.log(error);
  }

  // 读取依赖包的包名进行匹配
  // 存在则到node_modules查找package.json
  return [];
};
export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.languages.registerDefinitionProvider(
    {
      language: "json",
      pattern: "**/package.json",
    },
    {
      provideDefinition: _provideDefinition,
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
