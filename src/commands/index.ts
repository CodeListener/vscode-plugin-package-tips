import * as vscode from "vscode";
import createWebview from "../webview";
export default function registerCommands(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("vscode-plugin-package-tips.createWebview", () => {
      createWebview(context);
    })
  );
}
