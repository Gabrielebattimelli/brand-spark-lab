# Supabase Edge Function Deployment Guide

This guide will walk you through the process of deploying the updated Edge Function that uses Google's Generative AI (Gemini) for text generation in your BrandIt application.

## Prerequisites

Before you begin, make sure you have:

1. **Supabase CLI installed** - You'll need this to deploy the Edge Function
2. **Docker Desktop installed and running** - Required for Supabase CLI to deploy Edge Functions
3. **Google Generative AI (Gemini) API key** - Required for the Edge Function to generate text
4. **Node.js** - Required for some Supabase CLI features
5. **Git** - To clone your repository (if you haven't already)

## Installation Steps

### 1. Install the Supabase CLI

If you haven't already installed the Supabase CLI, you can do so using one of the following methods:

#### Using Homebrew (macOS and Linux)

```bash
brew install supabase/tap/supabase
```

#### Using Scoop (Windows)

```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

#### Using Curl (macOS and Linux)

```bash
curl -s https://raw.githubusercontent.com/supabase/cli/main/install.sh | bash
```

#### Using PowerShell (Windows)

```powershell
iwr -useb https://raw.githubusercontent.com/supabase/cli/main/install.ps1 | iex
```

> **Note:** Installing Supabase CLI as a global npm module is not supported.

Verify the installation:

```bash
supabase --version
```

### 2. Log in to Supabase

Log in to your Supabase account through the CLI:

```bash
supabase login
```

This will open a browser window where you'll need to authenticate with your Supabase account.

### 3. Link Your Project

Navigate to your project directory and link it to your Supabase project:

```bash
cd /path/to/your/project
supabase link --project-ref YOUR_PROJECT_REF
```

Replace `YOUR_PROJECT_REF` with your Supabase project reference ID. You can find this in the URL of your Supabase dashboard: `https://app.supabase.com/project/YOUR_PROJECT_REF`.

### 4. Deploy the Edge Function

The Edge Function has been updated to receive the API key directly from the frontend, so you no longer need to set up environment variables.

Deploy the updated Edge Function to your Supabase project:

```bash
supabase functions deploy generate-branding
```

This command deploys the `generate-branding` function from your local repository to your Supabase project.

## Verification

To verify that the deployment was successful:

1. Open your Supabase dashboard
2. Navigate to Edge Functions
3. Check that the `generate-branding` function is listed and has a status of "Active"
4. Test the function by using your application's brand generation features

## Troubleshooting

### Common Issues

#### "Function deployment failed"

- Make sure you're in the correct directory (the root of your project)
- Verify that your Supabase CLI is up to date
- Check that your project is properly linked to Supabase

#### "Cannot connect to the Docker daemon"

- Make sure Docker Desktop is installed and running
- If you just installed Docker Desktop, try restarting your terminal or computer
- On macOS and Linux, check if the Docker daemon is accessible at `/var/run/docker.sock`
- On Windows, ensure Docker Desktop is properly configured to use the WSL 2 backend if applicable

#### "API key is required" error

- Make sure you've entered your Gemini API key in the first step of the wizard (API Key Setup)
- Check that the API key is being correctly passed from the frontend to the Edge Function

#### "Permission denied"

- Make sure you're logged in to the Supabase CLI
- Verify that you have the necessary permissions for your Supabase project

#### "Text generation not working after deployment"

- Check the browser console for any error messages
- Verify that your Gemini API key is valid
- Make sure the Edge Function is being called correctly from your application

### Getting Help

If you continue to experience issues:

1. Check the Supabase documentation: https://supabase.com/docs
2. Visit the Supabase GitHub repository: https://github.com/supabase/supabase
3. Join the Supabase Discord community: https://discord.supabase.com

## Additional Resources

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Google Generative AI (Gemini) Documentation](https://ai.google.dev/docs)
- [Deno Runtime Documentation](https://deno.land/manual) (Supabase Edge Functions use Deno)

## Next Steps

After successfully deploying your Edge Function:

1. Test all text generation features in your application
2. Monitor the function's performance and logs in your Supabase dashboard
3. Consider setting up monitoring or alerts for any errors

---

If you have any questions or need further assistance, please don't hesitate to reach out.
