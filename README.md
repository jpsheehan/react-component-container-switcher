# React Component/Container Switcher

This extension allows you to quickly switch between your React components and their associated containers.

## Features

Pressing `Ctrl+Shift+P` and then begin typing `RCCS: Switch to associated component/container` which will allow you to switch between components and containers. ALternatively, pressing `Alt+C` will also switch between the two. If the other file doesn't exist you will be prompted to create it.

A button on the status bar allows you to see the kind of file currently open and allows you to switch to the other kind by clicking.

You can configure this extension always open the different file types in diffent parts of the screen.

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
|   |   Navbar.jsx
|   |   SignIn.ts
|   |
|   +---Avatar
|   |       index.js
|   |
|   \---SignOut
|           index.tsx
|
\---Container
    |   Avatar.ts
    |   SignIn.tsx
    |   SignOut.js
    |
    \---Navbar
            index.js

```

## Known Issues

No known issues.

## Release Notes

### 0.2.0

- Added a status bar item that shows information about the current file. Clicking this triggers file switching.
- When switching to a file that doesn't exist, you will be prompted to create the file.
- Added a configuration option to open specific types of files on different parts of the screen.
- Added a configuration option for the status bar item.
- Bug fixes.

### 0.1.2

- Added support for `.jsx` and `.tsx` files.

### 0.1.0

- Initial release.
