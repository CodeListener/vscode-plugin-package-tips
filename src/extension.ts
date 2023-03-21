import * as vscode from "vscode";
import registerCommands from "./commands";
import registerLanguages from "./languages";

export function activate(context: vscode.ExtensionContext) {
  registerLanguages(context);
  registerCommands(context);
}

export function deactivate() {}
