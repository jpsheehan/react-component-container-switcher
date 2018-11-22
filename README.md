# React Component/Container Switcher

This extension allows you to quickly switch between your React components and their associated containers.

## Features

Pressing `Ctrl+Shift+P` and then begin typing `RCCS: Switch to associated component/container` which will allow you to switch between components and containers. ALternatively, pressing `Alt+C` will also switch between the two.

## Requirements

For this extension to work, your container and component folders must be siblings. And the components must be nested directly below either as in their own folders or in standalone files. Currently, only `.js`, `.jsx`, `.ts` and `.tsx` files are supported. The following are valid folder names for components and containers:

### Valid component folder names:
- `component`
- `components`
- `Component`
- `Components`

### Valid container folder names:
- `container`
- `containers`
- `Container`
- `Containers`

If the extension cannot find a valid component/container to switch to, it will display a small message in the corner of the editor letting you know.

## Example directory structure:
This is an example of a valid (although, poor) directory structure, where every component has a corresponding container:
```
+---components
|   |   Navbar.js
|   |   SignIn.ts
|   |
|   +---Avatar
|   |       index.js
|   |
|   \---SignOut
|           index.ts
|
\---Container
    |   Avatar.ts
    |   SignIn.ts
    |   SignOut.js
    |
    \---Navbar
            index.js

```

## Known Issues

No known issues.

## Release Notes

Users appreciate release notes as you update your extension.

### 0.2.0

#### Features:
- Added a configuration option for opening containers always in the left, right or active column.
- Added a status bar item showing what kind of file is open. Clicking on this will switch to the other kind.
- Added the name of the container/component to the status bar item.
- Hovering over the status bar item will show some information about the current file.

#### Bug Fixes:
- Fixed a Windows case-insensitivity file path bug.
- Added proper cleanup of extension code.

### 0.1.2

Added support for `.jsx` and `.tsx` files.

### 0.1.0

Initial release.
