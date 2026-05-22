## What's wrong now

The profile header doesn't show a dedicated avatar. The "main photo" is just the first slide of the swipeable gallery (`gallery = [avatar, ...photos]`). As soon as the user scrolls the carousel, the account picture is no longer visible — and on desktop the name/bio block has no thumbnail at all.

## Change

Add a **dedicated, always-visible circular avatar** in the identity block, decoupled from the gallery carousel.

1. Render a 96×96 (md: 112×112) circular avatar with a 4px ring (`ring-background`) and soft shadow next to the name/age/nickname.
2. On desktop: avatar sits to the left of the name block (flex row).
3. On mobile: avatar overlaps the bottom-left of the gallery (`-mt-12 ml-4`), so it remains visible while the gallery scrolls.
4. The gallery keeps showing all photos including the avatar as slide 1 (so users can still tap to see it large).
5. Source: `a.avatar_url ?? fallbackAvatar(a.id)` — unchanged.

## Files

- `src/routes/profile.$id.tsx` — restructure the identity row to include the avatar `<img>` and adjust the gallery wrapper margin on mobile.

No backend, schema, or server-function changes. Pure UI.