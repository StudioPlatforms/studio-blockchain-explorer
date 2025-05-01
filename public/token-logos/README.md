# Token Logos

This directory contains token logos for the Studio Blockchain Explorer. The logos are used to display token icons throughout the application.

## Logo Format

- File format: PNG or SVG
- Size: 128x128 pixels (recommended)
- Background: Transparent
- File size: Less than 200KB

## Naming Convention

Token logo files should be named using the token contract address in lowercase:

```
0x1234567890123456789012345678901234567890.png
```

## Adding Logos

There are two ways to add token logos:

1. **Manually**: Place the logo file in this directory with the correct naming convention.

2. **Admin Panel**: Use the Token Admin Panel at `/token-admin` to upload logos for verified tokens.

## Admin Access

The Token Admin Panel is restricted to authorized users only. Contact the administrator for access.

## Default Fallback

If a token logo is not available, the application will display a fallback icon with the first two characters of the token symbol.
