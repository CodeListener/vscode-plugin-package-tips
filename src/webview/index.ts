import { readFileSync } from "fs";
import { join } from "path";
import * as vscode from "vscode";
import registerEvent from "../utils/registerEvent";
export default function createWebview(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel("package", "npm-package-tips manager", vscode.ViewColumn.One, {
    enableScripts: true,
    // 设置true之后在后台时，状态不会被销毁
    retainContextWhenHidden: true,
  });
  try {
    const htmlTemplate = readFileSync(join(context.extensionUri.fsPath, "./src/html/index.html"), "utf8");
    panel.webview.html = htmlTemplate;

    panel.onDidDispose(() => {
      console.log("webview被关闭");
    });

    const events = registerEvent(panel);

    // 监听webview发送过来的任务
    events.addEventListener("exec", (callHandler: Function, data: unknown) => {
      console.log("从webview接收到数据", data);
      setTimeout(() => {
        callHandler("hello world");
      }, 1000);
    });
  } catch (error) {}
}
