# Deploying to Itch.io

This guide explains how to deploy SixDivides to Itch.io correctly.

## Known Issues and Solutions

When uploading a standard React build to Itch.io, you might encounter these errors:
- `Unrecognized feature: 'monetization'`
- `Unrecognized feature: 'xr'`
- Asset loading issues (`ERR_ABORTED 403 (Forbidden)`)

These occur because Itch.io's HTML sandbox has specific restrictions that conflict with Create React App's default output.

## How to Deploy

1. Build a special Itch.io-compatible version:
   ```
   npm run build:itch
   ```

   This script:
   - Creates a production build of your React app
   - Modifies asset paths to be relative instead of absolute
   - Removes unsupported features from the manifest.json file

2. Upload to Itch.io:
   - Go to your Itch.io dashboard
   - Select the project or create a new one
   - Choose "HTML" as the kind of project
   - Upload the entire `build` folder as a ZIP file
   - In Game Settings, make sure:
      - "This file will be played in the browser" is selected
      - "Embed in page" is selected
      - Frame options are set to "Support mobile browsers" or similar

3. If still having issues:
   - Try deleting manifest.json from the build folder before uploading
   - Make sure all paths in your app use relative paths rather than absolute ones

## Troubleshooting

If you're seeing 403 errors in the console when trying to access assets:
- Your browser may be trying to load assets from paths that the Itch.io sandbox is blocking
- This is fixed by the `build:itch` script which adjusts the paths in the output HTML

If you encounter any other errors, check the browser console and make sure you're using the correctly processed build from `npm run build:itch`.
