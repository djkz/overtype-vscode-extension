import * as vscode from 'vscode';
import { OverTypePanel } from './overtypePanel';

export function activate(context: vscode.ExtensionContext) {
    console.log('OverType Markdown Viewer is now active');

    // Register command to open preview
    const openPreviewCommand = vscode.commands.registerCommand('overtype.openPreview', (uri?: vscode.Uri) => {
        const resource = uri || vscode.window.activeTextEditor?.document.uri;
        if (resource) {
            OverTypePanel.createOrShow(context.extensionUri, resource, vscode.ViewColumn.Active);
        } else {
            vscode.window.showErrorMessage('No markdown file to preview');
        }
    });

    // Register command to open preview to the side
    const openPreviewToSideCommand = vscode.commands.registerCommand('overtype.openPreviewToSide', (uri?: vscode.Uri) => {
        const resource = uri || vscode.window.activeTextEditor?.document.uri;
        if (resource) {
            OverTypePanel.createOrShow(context.extensionUri, resource, vscode.ViewColumn.Beside);
        } else {
            vscode.window.showErrorMessage('No markdown file to preview');
        }
    });

    // Handle webview panel restoration
    if (vscode.window.registerWebviewPanelSerializer) {
        vscode.window.registerWebviewPanelSerializer(OverTypePanel.viewType, {
            async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
                console.log(`Restoring webview panel for ${state.resource}`);
                const resource = vscode.Uri.parse(state.resource);
                OverTypePanel.revive(webviewPanel, context.extensionUri, resource);
            }
        });
    }

    context.subscriptions.push(openPreviewCommand, openPreviewToSideCommand);

    // Watch for configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('overtype')) {
                OverTypePanel.updateConfiguration();
            }
        })
    );

    // Watch for text document changes (for auto-save feature)
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.languageId === 'markdown') {
                OverTypePanel.handleDocumentChange(e.document);
            }
        })
    );
}

export function deactivate() {
    OverTypePanel.dispose();
}