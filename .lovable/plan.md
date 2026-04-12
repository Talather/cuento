

# Plan: Remove Runware Integration and Simplify to Gemini-Only

## Summary

This plan removes all Runware-related code and simplifies the image generation to use only the Lovable AI Gateway (Gemini). This will reduce complexity and eliminate the conditional logic for paying vs non-paying users.

## Cost Information

**How you're paying for AI services:**
- All AI usage (text and image generation) goes through the **Lovable AI Gateway**
- Billing is via your **Lovable workspace credits** using the auto-provisioned `LOVABLE_API_KEY`
- You can check your usage and add credits at: **Settings → Workspace → Usage** in the Lovable dashboard

**Unfortunately, I cannot directly access your Lovable workspace billing data** to show exact costs from the last month. You'll need to check your Lovable dashboard for detailed usage analytics.

## Files to Delete

| File | Reason |
|------|--------|
| `supabase/functions/authenticate-runware/index.ts` | Runware authentication function |
| `supabase/functions/authenticate-runware/config.toml` | Runware function config |
| `supabase/functions/generate-image/runwareImageGeneration.ts` | Runware image generation logic |
| `supabase/functions/send-admin-alert/index.ts` | Only used for Runware credit alerts |
| `supabase/functions/send-admin-alert/config.toml` | Admin alert function config |
| `src/hooks/useWebSocketSession.ts` | Runware WebSocket session hook (unused) |

## Files to Modify

### 1. `supabase/functions/generate-image/index.ts`
- Remove import of `generateImageWithRunware`
- Remove `serviceType` logic and validation
- Always use `generateImageWithGemini` directly
- Fix TypeScript errors for unknown error types

### 2. `supabase/functions/generate-image/requestValidation.ts`
- Remove `validateServiceType` function
- Simplify validation logic

### 3. `src/services/ImageGenerationService.ts`
- Remove subscription check logic
- Remove `serviceType` parameter (always use gemini)
- Remove fallback logic for `INSUFFICIENT_RUNWARE_CREDITS`
- Simplify to a single image generation path

### 4. `src/services/RunwareService.ts`
- Delete this file (currently just re-exports ImageGenerationService)

### 5. `supabase/functions/whatsapp-webhook/storyGenerator.ts`
- Remove `serviceType: 'gemini'` parameter since it will be the default

## TypeScript Error Fixes

While making these changes, I'll also fix the build errors by:
- Adding proper type guards for `unknown` error types across all affected edge functions
- Using `error instanceof Error ? error.message : 'Unknown error'` pattern consistently

## Architecture After Changes

```text
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│  ImageGenerationService.generateImage(prompt)   │
└───────────────────────┬─────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│        Edge Function: generate-image            │
│  - Validates prompt                             │
│  - Calls Lovable AI Gateway                     │
│  - Uploads to Supabase Storage                  │
│  - Returns public URL                           │
└───────────────────────┬─────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│        Lovable AI Gateway                       │
│  google/gemini-2.5-flash-image-preview          │
│  (Nano Banana model)                            │
└─────────────────────────────────────────────────┘
```

## Technical Details

### Edge Functions to Deploy After Changes
- `generate-image` - Updated to use Gemini only

### Edge Functions to Delete
- `authenticate-runware`
- `send-admin-alert`

### Benefits
1. Simpler codebase with no conditional service selection
2. No Runware API key management needed
3. Reduced edge function count (2 fewer functions)
4. Consistent image quality for all users (no tiered service)
5. Single billing source (Lovable workspace credits)

