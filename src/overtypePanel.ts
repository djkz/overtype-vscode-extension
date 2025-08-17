import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class OverTypePanel {
    public static currentPanels: Map<string, OverTypePanel> = new Map();
    public static readonly viewType = 'overtype.preview';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private readonly _resource: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
    private _saveTimeout: NodeJS.Timeout | undefined;

    public static createOrShow(extensionUri: vscode.Uri, resource: vscode.Uri, viewColumn: vscode.ViewColumn) {
        const key = resource.toString();
        
        // If we already have a panel for this resource, show it
        const existingPanel = OverTypePanel.currentPanels.get(key);
        if (existingPanel) {
            existingPanel._panel.reveal(viewColumn);
            return;
        }

        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(
            OverTypePanel.viewType,
            `OverType: ${path.basename(resource.fsPath)}`,
            viewColumn,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'media'),
                    vscode.Uri.joinPath(extensionUri, 'node_modules')
                ],
                retainContextWhenHidden: true
            }
        );

        const overtypePanel = new OverTypePanel(panel, extensionUri, resource);
        OverTypePanel.currentPanels.set(key, overtypePanel);
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, resource: vscode.Uri) {
        const key = resource.toString();
        const overtypePanel = new OverTypePanel(panel, extensionUri, resource);
        OverTypePanel.currentPanels.set(key, overtypePanel);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, resource: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._resource = resource;

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Update the content based on view state changes
        this._panel.onDidChangeViewState(
            e => {
                if (this._panel.visible) {
                    this._update();
                }
            },
            null,
            this._disposables
        );

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'save':
                        this._save(message.content);
                        break;
                    case 'autosave':
                        this._autoSave(message.content);
                        break;
                    case 'alert':
                        vscode.window.showErrorMessage(message.text);
                        break;
                    case 'info':
                        vscode.window.showInformationMessage(message.text);
                        break;
                }
            },
            null,
            this._disposables
        );

        // Watch the file for external changes
        const watcher = vscode.workspace.createFileSystemWatcher(resource.fsPath);
        watcher.onDidChange(() => this._onFileChanged());
        this._disposables.push(watcher);
    }

    public static updateConfiguration() {
        // Update all active panels with new configuration
        for (const panel of OverTypePanel.currentPanels.values()) {
            panel._sendConfiguration();
        }
    }

    public static handleDocumentChange(document: vscode.TextDocument) {
        const key = document.uri.toString();
        const panel = OverTypePanel.currentPanels.get(key);
        if (panel && !panel._panel.active) {
            // Update content if the document was changed externally
            panel._update();
        }
    }

    public static dispose() {
        for (const panel of OverTypePanel.currentPanels.values()) {
            panel.dispose();
        }
        OverTypePanel.currentPanels.clear();
    }

    public dispose() {
        const key = this._resource.toString();
        OverTypePanel.currentPanels.delete(key);

        if (this._saveTimeout) {
            clearTimeout(this._saveTimeout);
        }

        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private async _update() {
        const webview = this._panel.webview;

        this._panel.title = `OverType: ${path.basename(this._resource.fsPath)}`;
        this._panel.webview.html = await this._getHtmlForWebview(webview);

        // Send the initial content and configuration
        setTimeout(() => {
            this._sendContent();
            this._sendConfiguration();
        }, 100);
    }

    private async _sendContent() {
        try {
            const document = await vscode.workspace.openTextDocument(this._resource);
            const content = document.getText();
            this._panel.webview.postMessage({ 
                command: 'setContent', 
                content: content 
            });
        } catch (error) {
            console.error('Error reading file:', error);
        }
    }

    private _sendConfiguration() {
        const config = vscode.workspace.getConfiguration('overtype');
        const vsCodeTheme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark ? 'dark' : 'light';
        
        this._panel.webview.postMessage({
            command: 'updateConfig',
            config: {
                theme: config.get('theme'),
                fontSize: config.get('fontSize'),
                showToolbar: config.get('showToolbar'),
                showStats: config.get('showStats'),
                autoSave: config.get('autoSave'),
                autoSaveDelay: config.get('autoSaveDelay'),
                vsCodeTheme: vsCodeTheme
            }
        });
    }

    private async _save(content: string) {
        try {
            const edit = new vscode.WorkspaceEdit();
            const document = await vscode.workspace.openTextDocument(this._resource);
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(document.getText().length)
            );
            edit.replace(this._resource, fullRange, content);
            await vscode.workspace.applyEdit(edit);
            await document.save();
            
            this._panel.webview.postMessage({ 
                command: 'saved', 
                success: true 
            });
        } catch (error) {
            console.error('Error saving file:', error);
            vscode.window.showErrorMessage(`Failed to save: ${error}`);
            this._panel.webview.postMessage({ 
                command: 'saved', 
                success: false 
            });
        }
    }

    private _autoSave(content: string) {
        const config = vscode.workspace.getConfiguration('overtype');
        if (!config.get('autoSave')) {
            return;
        }

        if (this._saveTimeout) {
            clearTimeout(this._saveTimeout);
        }

        const delay = config.get('autoSaveDelay', 1000) as number;
        this._saveTimeout = setTimeout(() => {
            this._save(content);
        }, delay);
    }

    private _onFileChanged() {
        // File changed externally, reload content
        this._sendContent();
    }

    private async _getHtmlForWebview(webview: vscode.Webview) {
        // Get the OverType library content
        const overtypeJsPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'overtype.min.js');
        const overtypeJsUri = webview.asWebviewUri(overtypeJsPath);

        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
    <title>OverType Markdown Editor</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            height: 100vh;
            background: var(--vscode-editor-background);
        }
        #editor {
            height: 100vh;
            width: 100%;
        }
        .save-indicator {
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 5px 10px;
            background: var(--vscode-notifications-background);
            color: var(--vscode-notifications-foreground);
            border-radius: 3px;
            opacity: 0;
            transition: opacity 0.3s;
            z-index: 10000;
        }
        .save-indicator.show {
            opacity: 1;
        }
    </style>
</head>
<body>
    <div id="editor"></div>
    <div id="saveIndicator" class="save-indicator">Saved</div>
    
    <script nonce="${nonce}" src="${overtypeJsUri}"></script>
    <script nonce="${nonce}">
        (function() {
            const vscode = acquireVsCodeApi();
            let editor = null;
            let config = {};
            let content = '';
            let lastSavedContent = '';
            let isDirty = false;
            let isSettingContent = false;

            // Initialize the editor
            function initEditor() {
                if (editor) {
                    editor.destroy();
                }

                // Determine theme based on configuration
                let theme = config.theme || 'solar';
                if (theme === 'auto') {
                    theme = config.vsCodeTheme === 'dark' ? 'cave' : 'solar';
                }

                // Create OverType instance
                const [instance] = new OverType('#editor', {
                    value: content,
                    theme: theme,
                    fontSize: config.fontSize || '14px',
                    toolbar: config.showToolbar !== false,
                    showStats: config.showStats || false,
                    onChange: (value, instance) => {
                        // Don't trigger save if we're programmatically setting content
                        if (isSettingContent) {
                            return;
                        }
                        
                        // Only trigger save if content actually changed
                        if (value !== lastSavedContent) {
                            isDirty = true;
                            content = value;
                            
                            // Send autosave message if enabled
                            if (config.autoSave) {
                                vscode.postMessage({
                                    command: 'autosave',
                                    content: value
                                });
                            }
                        }
                    }
                });

                editor = instance;

                // Add keyboard shortcut for manual save
                document.addEventListener('keydown', (e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                        e.preventDefault();
                        saveContent();
                    }
                });
            }

            // Save content manually
            function saveContent() {
                if (editor) {
                    const value = editor.getValue();
                    vscode.postMessage({
                        command: 'save',
                        content: value
                    });
                }
            }

            // Show save indicator
            function showSaveIndicator() {
                const indicator = document.getElementById('saveIndicator');
                indicator.classList.add('show');
                setTimeout(() => {
                    indicator.classList.remove('show');
                }, 2000);
            }

            // Handle messages from the extension
            window.addEventListener('message', event => {
                const message = event.data;
                switch (message.command) {
                    case 'setContent':
                        content = message.content;
                        lastSavedContent = message.content;
                        isSettingContent = true;
                        if (editor) {
                            editor.setValue(content);
                        } else {
                            initEditor();
                        }
                        isDirty = false;
                        // Reset flag after a brief delay to allow OverType to process
                        setTimeout(() => {
                            isSettingContent = false;
                        }, 100);
                        break;
                    
                    case 'updateConfig':
                        config = message.config;
                        if (editor) {
                            initEditor();
                        }
                        break;
                    
                    case 'saved':
                        if (message.success) {
                            isDirty = false;
                            lastSavedContent = content;
                            showSaveIndicator();
                        }
                        break;
                }
            });

            // Notify extension that webview is ready
            vscode.postMessage({ command: 'ready' });

            // Save state for webview restoration
            const state = vscode.getState();
            if (state) {
                content = state.content || '';
                config = state.config || {};
                initEditor();
            }

            // Update state when content changes
            setInterval(() => {
                if (isDirty && editor) {
                    vscode.setState({
                        content: editor.getValue(),
                        config: config
                    });
                }
            }, 1000);
        })();
    </script>
</body>
</html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}