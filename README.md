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

### Option 1: Download Pre-built Extension (Recommended)

1. Download `overtype-markdown-viewer-0.1.1.vsix` from this repository
2. In VS Code, press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "Extensions: Install from VSIX..."
4. Select the downloaded .vsix file
5. Restart VS Code

### Option 2: Build from Source

1. Follow the [Development](#development) section to build the extension
2. Install the generated .vsix file as described above

### Option 3: VS Code Marketplace

*Coming soon - extension will be published to the marketplace*

## Development

### Prerequisites

This extension requires the original OverType library to be built first. The recommended setup is:

```
project-folder/
├── overtype/                    # Original OverType library
└── overtype-vscode-extension/   # This VS Code extension
```

### Setup Instructions

1. **Clone the original OverType library:**
   ```bash
   git clone https://github.com/panphora/overtype.git
   cd overtype
   npm install
   npm run build  # Creates dist/overtype.min.js
   ```

2. **Clone this extension in a sibling directory:**
   ```bash
   cd ..
   git clone https://github.com/djkz/overtype-vscode-extension.git
   cd overtype-vscode-extension
   ```

3. **Build the extension:**
   ```bash
   # Install dependencies
   npm install

   # Bundle OverType library (copies from ../overtype/dist/)
   npm run bundle-overtype

   # Compile TypeScript
   npm run compile

   # Package the extension
   npm run package
   ```

### Build Scripts Explained

- `npm run bundle-overtype` - Copies `overtype.min.js` from the original library's `dist/` folder
- `npm run compile` - Compiles TypeScript source to JavaScript
- `npm run vscode:prepublish` - Runs both bundle and compile steps
- `npm run package` - Creates the .vsix file for installation

### Alternative: Using Pre-built Package

If you don't want to build from source, download the pre-built `.vsix` file from the [GitHub releases](https://github.com/djkz/overtype-vscode-extension/releases) and install it directly in VS Code.

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