import * as vscode from 'vscode';
import { AlgoPulseSidebarProvider } from './sidebarProvider';

export function activate(context: vscode.ExtensionContext) {
  console.log('[AlgoPulse VSCode] Extension activated.');

  // Register Webview Sidebar Provider
  const sidebarProvider = new AlgoPulseSidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      AlgoPulseSidebarProvider.viewType,
      sidebarProvider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  // Command 1: Analyze Code
  const analyzeCmd = vscode.commands.registerCommand('algopulse.analyzeCode', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('AlgoPulse: Please open a code file in the editor to analyze.');
      return;
    }
    await sidebarProvider.runAnalysisForEditor(editor);
  });

  // Command 2: Open Dashboard
  const dashboardCmd = vscode.commands.registerCommand('algopulse.openDashboard', () => {
    const config = vscode.workspace.getConfiguration('algopulse');
    const url = config.get<string>('dashboardUrl') || 'http://localhost:3000';
    vscode.env.openExternal(vscode.Uri.parse(url));
  });

  // Command 3: Configure Settings
  const settingsCmd = vscode.commands.registerCommand('algopulse.configureSettings', () => {
    vscode.commands.executeCommand('workbench.action.openSettings', 'algopulse');
  });

  // Status Bar Item
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'algopulse.analyzeCode';
  statusBarItem.text = '$(sparkle) AlgoPulse';
  statusBarItem.tooltip = 'Analyze Active Code with AlgoPulse (Ctrl+Alt+A)';
  statusBarItem.show();

  context.subscriptions.push(analyzeCmd, dashboardCmd, settingsCmd, statusBarItem);
}

export function deactivate() {
  console.log('[AlgoPulse VSCode] Extension deactivated.');
}
