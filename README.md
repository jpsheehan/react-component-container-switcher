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

### 0.1.1

Added support for `.jsx` and `.tsx` files.

### 0.1.0

Initial release.
