# OverType Markdown Viewer

A Visual Studio Code extension that provides a WYSIWYG markdown editor using the [OverType](https://overtype.dev/) library by David Miranda. Edit markdown files with perfect alignment between the input and styled output, while maintaining native browser editing features.

## Features

- **WYSIWYG Editing**: Edit markdown with visible syntax markers that are perfectly styled
- **Perfect Alignment**: Invisible textarea overlay ensures character-perfect alignment
- **Native Browser Features**: Full support for undo/redo, spellcheck, mobile keyboards
- **Lightweight**: ~54KB bundle size
- **Dual Themes**: Solar (light) and Cave (dark) themes, plus auto-detection based on VS Code theme
- **Optional Toolbar**: Clean formatting toolbar with essential markdown tools
- **Statistics**: Optional character, word, and line count display
- **Auto-save**: Configurable auto-save with customizable delay
- **File Watching**: Automatic updates when files are modified externally

## Usage

### Opening Files

1. **From Explorer**: Right-click any `.md` file and select "Open with OverType"
2. **From Editor**: Click the OverType icon in the editor title bar
3. **Keyboard Shortcuts**:
   - `Ctrl+Shift+V` (Windows/Linux) or `Cmd+Shift+V` (Mac) - Open in current column
   - `Ctrl+K V` (Windows/Linux) or `Cmd+K V` (Mac) - Open to the side
4. **Command Palette**: Use "OverType: Open Preview" or "OverType: Open Preview to the Side"

### Editing

- Type markdown normally - syntax markers remain visible but are styled
- Use the toolbar for quick formatting (if enabled)
- `Ctrl+S` / `Cmd+S` to save manually
- Auto-save works in the background (if enabled)

### Keyboard Shortcuts in Editor

- `Ctrl/Cmd + B` - Bold
- `Ctrl/Cmd + I` - Italic  
- `Ctrl/Cmd + K` - Inline code
- `Ctrl/Cmd + Shift + K` - Insert link
- `Ctrl/Cmd + Shift + 7` - Numbered list
- `Ctrl/Cmd + Shift + 8` - Bullet list

## Configuration

Access settings via VS Code's settings UI or `settings.json`:

```json
{
  "overtype.theme": "solar",           // "solar", "cave", or "auto"
  "overtype.fontSize": "14px",         // Font size for the editor
  "overtype.showToolbar": true,        // Show/hide formatting toolbar
  "overtype.showStats": false,         // Show character/word/line counts
  "overtype.autoSave": true,           // Enable auto-save
  "overtype.autoSaveDelay": 1000       // Auto-save delay in milliseconds
}
```

### Theme Options

- **solar**: Light theme optimized for daylight editing
- **cave**: Dark theme optimized for low-light environments  
- **auto**: Automatically follows VS Code's current theme (dark/light)

## Installation

### From VSIX (Local Development)

1. Clone this repository
2. Run `npm install` in the extension directory
3. Run `npm run vscode:prepublish` to build
4. Press `F5` to run the extension in a new Extension Development Host window

### From VS Code Marketplace

*Coming soon - extension will be published to the marketplace*

## Development

### Building the Extension

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Bundle OverType library
npm run bundle-overtype

# Build everything (prepublish script)
npm run vscode:prepublish

# Package the extension
npm run package
```

### Project Structure

```
vscode-overtype-viewer/
├── src/
│   ├── extension.ts          # Main extension entry point
│   └── overtypePanel.ts      # Webview panel management
├── media/
│   └── overtype.min.js       # Bundled OverType library
├── scripts/
│   └── bundle-overtype.js    # Script to copy OverType build
└── package.json              # Extension manifest
```

## Requirements

- Visual Studio Code 1.74.0 or higher
- Modern browser engine (Chrome 62+, Firefox 78+, Safari 16+)

## Known Limitations

- Requires monospace font for perfect alignment
- Advanced markdown features (tables, diagrams) show as plain text
- Large files (>1MB) may experience performance issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the extension thoroughly
5. Submit a pull request

## License

MIT - See LICENSE file for details.

## About OverType

This extension uses the [OverType](https://overtype.dev/) library by David Miranda, a lightweight markdown editor that uses an innovative invisible textarea overlay approach for perfect WYSIWYG alignment.

- **OverType Library**: https://overtype.dev/
- **GitHub Repository**: https://github.com/panphora/overtype
- **Author**: David Miranda

OverType is an independent open-source project. This VS Code extension provides a convenient way to use OverType's powerful markdown editing capabilities within your development environment.