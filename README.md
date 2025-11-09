# Listing App by Codifyne

A modern web application for managing and organizing item collections. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Configurable Flavor Database**: Import your own brands and flavors through the settings modal
- **Default Placeholder**: Start with a simple placeholder template (10 brands, 10 items each)
- **Interactive Selection**: Add/remove flavors with +/- buttons
- **Smart Highlighting**: Selected flavors are highlighted in the input list
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

1. **Configure Flavors**: Click the settings icon to open the configuration modal
   - Enter your brands and flavors in the text box
   - Format: Brand name on first line, followed by flavor names (one per line)
   - Separate brands with blank lines
   - Click "Import Flavors" to apply your configuration
2. **Browse Flavors**: Use the left panel to browse all available flavors
3. **Add Flavors**: Click the `+` button next to any flavor to add it to your list
4. **Remove Flavors**: Click the `-` button to remove flavors from your list
5. **Sort Options**: Use the A-Z / Z-A buttons to change sorting order
6. **Copy List**: Click "Copy List" to copy your selected flavors to clipboard
7. **Clear All**: Use "Clear All" to start over

## Output Format

- Single items: `Flavor Name`
- Multiple items: `# Flavor Name`

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
│   ├── globals.css          # Global styles and Tailwind components
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Main application page
├── start-local.bat         # Windows batch file for easy startup
├── vercel.json            # Vercel deployment configuration
└── package.json           # Dependencies and scripts
```

## Configuration

All flavor data is stored in your browser's localStorage. The app starts with a default placeholder template (10 brands, 10 items each) that you can customize through the settings modal. Your configuration is automatically saved and persists across sessions.
