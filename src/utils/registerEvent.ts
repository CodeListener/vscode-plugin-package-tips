import * as vscode from "vscode";
import { PublishSubscription } from ".";
export default function (panel: vscode.WebviewPanel) {
  const events = new PublishSubscription();
  panel.webview.onDidReceiveMessage((event) => {
    const { type, data } = event;
    const callHandler = (v: unknown) => panel.webview.postMessage({ type, data: v });
    events.dispatch(type, callHandler, data);
  });
  return events;
}
