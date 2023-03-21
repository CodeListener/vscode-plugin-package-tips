import { existsSync, readFileSync } from "fs";
import * as vscode from "vscode";
export function getWorkspaceFolder(document: vscode.TextDocument) {
  const path = vscode.workspace.getWorkspaceFolder(document.uri);
  return path?.uri.fsPath;
}

export function getPackname(document: vscode.TextDocument, position: vscode.Position) {
  const line = document.lineAt(position);
  const sliceEndIndex = line.text.indexOf('"', line.firstNonWhitespaceCharacterIndex + 1);
  const packName = line.text.substring(line.firstNonWhitespaceCharacterIndex + 1, sliceEndIndex);
  return { line, packName, sliceEndIndex };
}

type PackageJson = {
  [key in "devDependencies" | "dependencies"]?: Record<string, string>;
};

export function getPackFilePath(document: vscode.TextDocument, packName: string) {
  try {
    const packageJson: PackageJson = JSON.parse(readFileSync(document.uri.fsPath, "utf8"));
    if (packageJson["dependencies"]?.[packName] || packageJson["devDependencies"]?.[packName]) {
      const workspacePath = getWorkspaceFolder(document);
      if (workspacePath) {
        const path = `${workspacePath}/node_modules/${packName}/package.json`;
        if (existsSync(path)) {
          return path;
        }
      }
    }
    return undefined;
  } catch (error) {
    return undefined;
  }
}
