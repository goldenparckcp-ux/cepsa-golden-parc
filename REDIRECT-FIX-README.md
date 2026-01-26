# Fix: Redirect After Login

## Problem
When users clicked "Se Connecter" from the `/orders` page, they were redirected to `/profile?redirect=/orders`, but after successful login, they stayed on the profile page instead of being redirected back to `/orders`.

## Solution
Updated the authentication flow in `app/profile/page.tsx` to handle the `redirect` query parameter:

### Changes Made:

1. **`loadUserProfile` function** - After loading the user profile (for Google login):
   - Checks if `redirectTo` parameter exists and is not the default routes
   - Redirects to the intended page using `router.push(redirectTo)`
   - Otherwise, shows the profile dashboard

2. **`handleVerifyOtp` function** - After OTP verification:
   - Same redirect logic after successful verification
   - Redirects to intended page or shows dashboard

3. **`handleSaveProfile` function** - After profile creation:
   - Same redirect logic after profile is created
   - Redirects to intended page or shows dashboard

## User Flow Now:
1. User visits `/orders` without being logged in
2. Sees "Connexion Requise" message
3. Clicks "Se Connecter" → redirected to `/profile?redirect=/orders`
4. User logs in (phone/OTP or Google)
5. ✅ **Automatically redirected back to `/orders`**
6. Can now see their order history

## Testing:
- Visit `/orders` while logged out
- Click "Se Connecter"
- Complete login
- Should be redirected back to `/orders` automatically
