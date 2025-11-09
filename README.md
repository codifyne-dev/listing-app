# Listing App by Codifyne

A simple and modern web application for managing and organizing item collections. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Configurable Item Database**: Import your own items through the settings modal
- **Default Placeholder**: Start with a simple placeholder template (10 titles, 10 items each)
- **Interactive Selection**: Add/remove items with +/- buttons
- **Smart Highlighting**: Selected items are highlighted in the input list
- **Flexible Sorting**: Sort alphabetically A-Z or Z-A
- **Easy Copy**: Copy your selected list to clipboard with proper formatting
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface with smooth animations

## Quick Start

### Local Development

1. **Windows (Recommended)**: Double-click `start-local.bat` to automatically:
   - Install dependencies
   - Start the development server
   - Open the app in your browser

3. **Manual Setup**:
   ```bash
   npm install
   npm run dev
   ```

The app will be available at `http://localhost:3000`

### Troubleshooting

**PowerShell Execution Policy Error**: If you see "running scripts is disabled on this system", run this command in PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Deployment

This app is ready for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

## Usage

1. **Configure Items**: Click the settings icon to open the configuration modal
   - Replace the placeholder with your items in the text box
   - Format: Title name on first line, followed by item names (one per line)
   - Separate titles with blank lines
   - Click "Import Items" to apply your configuration
2. **Browse Items**: Use the left panel to browse all available items
3. **Add Items**: Click the `+` button next to any item to add it to your list
4. **Remove Items**: Click the `-` button to remove items from your list
5. **Sort Options**: Use the Sort button to alphabetically sort items within each title
6. **Copy List**: Click "Copy List" to copy your selected items to clipboard
7. **Clear All**: Use "Clear All" to start over

## Output Format

- Single items: `Item Name`
- Multiple items: `# Item Name`

## Technology Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel-ready
- **Browser Support**: Modern browsers with clipboard API support

## Project Structure

```
├── app/
│   ├── context/
│   │   └── ThemeContext.tsx  # Theme management context
│   ├── globals.css           # Global styles and Tailwind components
│   ├── layout.tsx            # Root layout component
│   └── page.tsx              # Main application page
├── start-local.bat           # Windows batch file for easy startup
├── vercel.json               # Vercel deployment configuration
└── package.json              # Dependencies and scripts
```

## Configuration

All item data is stored in your browser's localStorage. The app starts with a default placeholder template (10 titles, 10 items each) that you can customize through the settings modal. Your configuration is automatically saved and persists across sessions.
