# Email Templates for BrandIt

This directory contains custom email templates for the BrandIt application.

## Confirmation Email Template

The `confirmation.html` file contains a custom template for the email confirmation process. This template includes:

- The BrandIt logo
- A welcoming message
- A clear call-to-action button
- A footer with contact information

## How to Use These Templates in Supabase

To use these templates in your Supabase project:

1. Log in to your Supabase dashboard
2. Navigate to Authentication > Email Templates
3. Select the "Confirmation" template
4. Replace the default template with the content from `confirmation.html`
5. Save the changes

### Important Notes

- Make sure the logo is accessible from the URL specified in the template. You may need to upload the logo to your Supabase storage bucket and make it publicly accessible.
- The template uses the variable `{{ .ConfirmationURL }}` which Supabase will automatically replace with the actual confirmation URL.
- You can customize the colors and styling to match your brand by editing the CSS in the template.

## Logo Storage

To make the logo available for the email template:

1. In the Supabase dashboard, go to Storage
2. Create a new bucket called "public" if it doesn't exist already
3. Upload the `logo_brandit.png` file to this bucket
4. Make sure the file is set to be publicly accessible
5. The URL to access the logo should be: `https://[YOUR_PROJECT_ID].supabase.co/storage/v1/object/public/public/logo_brandit.png`

Replace `[YOUR_PROJECT_ID]` with your actual Supabase project ID, which is `xhxpgtshtnizkggiguqk` for this project.