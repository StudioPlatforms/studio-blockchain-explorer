# Manual Token Logo Upload Instructions

Since the application is deployed in a production environment, you'll need to manually upload token logo files to the server. Here's how to do it:

## Steps for Manual Upload

1. **Prepare the Logo File**:
   - Ensure the logo is in PNG or SVG format
   - Recommended size: 128x128 pixels
   - Background should be transparent
   - File size should be less than 200KB

2. **Name the File Correctly**:
   - Rename the file to match the token contract address in lowercase
   - Example: `0x1234567890123456789012345678901234567890.png`

3. **Upload to Server**:
   - Connect to your Contabo server via SFTP/SCP
   - Navigate to the public/token-logos directory in your deployed application
   - Upload the logo file to this directory

4. **Verify the Upload**:
   - The logo should now be accessible at: `https://your-domain.com/token-logos/0x1234567890123456789012345678901234567890.png`
   - The TokenLogo component will automatically detect and display the logo

## Example Using SCP

```bash
# Replace with your actual server details
scp your-logo.png user@your-server.com:/path/to/deployed/app/public/token-logos/0x1234567890123456789012345678901234567890.png
```

## Example Using FileZilla or Other SFTP Client

1. Connect to your server using your SFTP credentials
2. Navigate to `/path/to/deployed/app/public/token-logos/`
3. Upload the logo file with the correct name

## Important Notes

- The TokenLogo component looks for logo files in the `/token-logos/` directory relative to the public path
- The file name must exactly match the lowercase token address
- No server restart is needed - the logo will be available immediately after upload
- If you replace an existing logo file, you may need to clear your browser cache to see the changes
