# Environment Variables Update

## Issue Description

You asked: "Why do I need to set up the environment variables if the user inputs it in the first step of the wizard?"

This is a great question! You're right - it doesn't make sense to have users enter their API key in the wizard and also require setting up environment variables on the server.

## Solution

I've updated the code to eliminate the need for environment variables. Here's what changed:

1. **Edge Function Update**: The Edge Function now accepts the API key directly from the frontend request instead of using an environment variable.

2. **Frontend Update**: The frontend code now passes the API key (that users enter in the first step of the wizard) to the Edge Function.

## Benefits

This approach has several benefits:

1. **Simplified Setup**: You no longer need to set up environment variables in your Supabase project.

2. **Consistent User Experience**: Users only need to enter their API key once, in the wizard interface.

3. **Easier Deployment**: The deployment process is simpler without the need to manage environment variables.

4. **Better Security**: API keys are only stored in the user's browser session and are never stored on your server.

## How It Works

1. When a user enters their Gemini API key in the first step of the wizard, it's stored in the application's state.

2. When the user clicks a "Generate" button (for mission, vision, values, etc.), the frontend passes the API key along with the generation request to the Edge Function.

3. The Edge Function uses this API key to make requests to the Gemini API.

## Next Steps

Simply follow the updated deployment instructions in the `DEPLOYMENT_GUIDE.md` file. You no longer need to set any environment variables!

If you have any questions or encounter any issues, please refer to the troubleshooting section in the deployment guide.