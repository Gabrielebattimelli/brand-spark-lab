# BrandIt - Text Generation Update

## Issue Description

The user requested to switch from using OpenAI's API to Google's Generative AI (Gemini) for text generation in the Edge Function.

## Solution

I've updated the Edge Function to use Google's Generative AI (Gemini) instead of OpenAI's API. The key changes are:

1. Updated the Edge Function to import and use the GoogleGenerativeAI library
2. Changed the model to "gemini-1.5-pro" (the same model used in the frontend code)
3. Modified the Edge Function to receive the API key directly from the frontend, eliminating the need for environment variables
4. Updated the frontend code to pass the API key to the Edge Function
5. Created a deployment guide to help you deploy the updated Edge Function

## Steps to Implement

1. Follow the instructions in `DEPLOYMENT_GUIDE.md` to deploy the updated Supabase Edge Function.
2. After deploying the Edge Function, restart your application and try generating content again.
3. Enter your Gemini API key in the first step of the wizard (API Key Setup) when using the application.

## Verification

After deploying the Edge Function, you should be able to:
1. Click on the generate buttons in the Brand Wizard
2. See the loading indicators while the content is being generated
3. See the generated text appear in the respective sections

If you still encounter issues after following these steps, please check the browser console for any error messages and refer to the troubleshooting section in the deployment guide.

## Benefits of Using Gemini

1. **Consistency**: Now both the frontend and backend use the same API (Gemini) for text generation
2. **Simplified API Key Management**: You only need to manage one API key (Gemini) instead of two (Gemini and OpenAI)
3. **Improved Performance**: Gemini is optimized for creative text generation tasks like brand content creation
