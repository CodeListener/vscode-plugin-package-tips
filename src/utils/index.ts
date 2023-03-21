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

// 发布订阅
export class PublishSubscription {
  handlers: Record<string, Function[]> = {};
  addEventListener(eventName: string, handler: Function) {
    if (!this.handlers[eventName]) {
      this.handlers[eventName] = [];
    }
    this.handlers[eventName].push(handler);
  }
  removeEventListener(eventName: string, handler: Function) {
    if (!handler && this.handlers[eventName]) {
      delete this.handlers[eventName];
    } else {
      const idx = this.handlers[eventName].findIndex((h) => h === handler);
      this.handlers[eventName].splice(idx, 1);
      if (this.handlers[eventName].length === 0) {
        delete this.handlers[eventName];
      }
    }
  }
  dispatch(eventName: string, ...args: unknown[]) {
    if (this.handlers[eventName].length) {
      this.handlers[eventName].forEach((handle) => {
        handle(...args);
      });
    }
  }
}
