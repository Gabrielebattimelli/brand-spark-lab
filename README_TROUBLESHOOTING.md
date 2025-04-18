# Troubleshooting Text Generation Issues

## Issue: Failed to generate valueProposition or brandVoice statements

If you're seeing error messages like:
- "Failed to generate valueProposition statements. Please try again."
- "Failed to generate brandVoice statements. Please try again."

This is likely because the updated Edge Function hasn't been deployed to your Supabase account.

## Solution

The Edge Function code in the repository has been updated to support generating valueProposition and brandVoice statements using Google's Generative AI (Gemini), but these changes need to be deployed to your Supabase account.

Follow these steps to resolve the issue:

1. **Deploy the updated Edge Function** by following the instructions in `DEPLOYMENT_GUIDE.md`
2. The key commands you'll need to run are:
   ```bash
   # Link your local project to your Supabase project
   supabase link --project-ref YOUR_PROJECT_REF
   
   # Deploy the updated Edge Function
   supabase functions deploy generate-branding
   ```
3. After deploying the Edge Function, restart your application and try generating content again.

## Verifying the Deployment

To verify that the Edge Function has been deployed successfully:

1. Open your Supabase dashboard
2. Navigate to Edge Functions
3. Check that the `generate-branding` function is listed and has a status of "Active"
4. The "Last Deployed" timestamp should reflect your recent deployment

## Additional Troubleshooting

If you're still experiencing issues after deploying the Edge Function:

1. **Check your Gemini API key**: Make sure you've entered a valid Gemini API key in the first step of the wizard.
2. **Check browser console**: Look for any error messages that might provide more details about the issue.
3. **Verify network requests**: In your browser's developer tools, check the Network tab to see if the request to the Edge Function is being made and what response is being returned.
4. **Check Edge Function logs**: In your Supabase dashboard, check the logs for the `generate-branding` function to see if there are any errors.

## Need More Help?

If you continue to experience issues after following these steps, please refer to the "Getting Help" section in `DEPLOYMENT_GUIDE.md` for additional resources.