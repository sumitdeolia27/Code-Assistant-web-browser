# Code Assistant - AI Code Helper Extension

A Chrome extension that provides AI-powered code analysis, explanations, optimization suggestions, and debugging help using Google's Gemini Pro API.

link - https://chromewebstore.google.com/detail/code-assistant-ai-code-he/nfifhhjfpkpmhpcfgdcckkcdanfbeaah
## Features

### Analysis Types
- **💡 Hints**: Learning opportunities and best practices
- **💭 Suggestions**: Performance and readability improvements  
- **📚 Explanation**: Detailed step-by-step code breakdown
- **✨ Clean Code**: Refactoring and code quality suggestions
- **🎯 Solutions**: Alternative implementation approaches
- **🐛 Error Fixing**: Bug identification and debugging help

### User Interface
- **Tabbed Interface**: Easy switching between analysis types
- **Copy Results**: Copy analysis results to clipboard
- **Clear Buttons**: Quick text area clearing
- **Loading Indicators**: Visual feedback during analysis
- **Modern Design**: Clean, gradient-based UI

### Integration Methods
- **Context Menu**: Right-click selected code → "🤖 Analyze Code"
- **Keyboard Shortcut**: Ctrl+Shift+Space for quick analysis
- **Code Block Buttons**: Auto-detected analyze buttons on code blocks
- **Manual Input**: Direct code paste in popup interface

### Smart Features
- **Auto Text Loading**: Selected text automatically fills all tabs
- **API Key Storage**: Secure local storage of Gemini Pro API key
- **Error Handling**: Comprehensive error messages and recovery
- **Cross-Tab Sync**: Selected text available across all analysis types

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension will appear in your extensions list

## Setup

1. Get your free Gemini Pro API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click on the extension icon in your browser
3. Enter your API key when prompted
4. Start analyzing code!

## Usage

### Method 1: Context Menu
1. Select any code on a webpage
2. Right-click and choose "🤖 Analyze Code"
3. The extension popup will open with the selected code

### Method 2: Keyboard Shortcut
1. Select code on a webpage
2. Press `Ctrl+Shift+Space`
3. The extension popup will open

### Method 3: Manual Input
1. Click the extension icon
2. Paste your code in the text area
3. Choose analysis type (Analyze, Explain, Optimize, Debug)
4. Click the corresponding button

### Method 4: Code Block Buttons
- Hover over code blocks on web pages
- Click the "🤖 Analyze" button that appears
- The extension will analyze the code

## Analysis Types

- **Analyze**: General code analysis and insights
- **Explain**: Detailed explanation of code functionality
- **Optimize**: Performance and best practice suggestions
- **Debug**: Error identification and debugging help

## File Structure

```
coding-helper-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Main UI
├── popup.css             # Styling
├── popup.js              # UI logic
├── background.js         # Service worker
├── content.js            # Injected into web pages
├── icons/                # Extension icons
└── README.md             # This file
```

## Permissions

- **activeTab**: Access to current tab for text selection
- **contextMenus**: Create right-click menu items
- **storage**: Store API key and settings
- **host_permissions**: Access to Gemini Pro API

## Privacy

- Your API key is stored locally in Chrome's sync storage
- Code is sent to Google's Gemini Pro API for analysis
- No data is collected or stored by the extension itself

## Troubleshooting

### API Key Issues
- Make sure you have a valid Gemini Pro API key
- Check that the API key has proper permissions
- Verify your internet connection

### Extension Not Working
- Refresh the webpage after installing the extension
- Check that the extension is enabled in Chrome
- Try reloading the extension in `chrome://extensions/`

### Code Not Detected
- Make sure you have selected text before using context menu
- Try using the manual input method
- Check that the content script is loaded (refresh the page)

## Development

To modify or extend this extension:

1. Make changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh button on the extension
4. Test your changes

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve this extension.

## Support

If you encounter any issues or have questions, please open an issue on the project repository.
