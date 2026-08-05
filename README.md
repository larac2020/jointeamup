# TeamUp Connect

Build a modern web app called “TeamUp” (working title) that connects fitness competition athletes with people reselling competition tickets or teams looking for replacement teammates.

The app solves this problem:

Fitness competitions like HYROX, Turf Games, and other emerging sport events often sell out quickly and in advance. Life changes, injuries, work & family commitments happen and force the ticket holder to miss the competition. Tickets are expensive and many individuals end up with non-recoverable costs. It's even harded in case of team competitions where it's not only the individual that can't anymore attend to be affected, but the team as a whole which now needs in fast fashion find a new suitable team member.

This app I want to build is therefore a fitness community app, with functionalities similar to Spareroom, that aims at connecting supply and demand. It is not meant to process payments and perform the ticket transfer, but simply to connect. 

Core features:

1. Athlete Profiles
Users can create a personal athlete profile (both for ticket holders and ticket searchers) that acts like a sports business card. Profile fields:

a. Profile photo

 b.First name

 c.Optional nickname

 d.Age

 e.Where they are from

 f.Where they currently live

 g.Sports they practice

 h.Gym(s) they train at

 i.Competitions completed

 j.Personal bests / times

 k.“Sport superpower” (favorite or strongest skill)

 l.“Sport kryptonite” (weakest or most disliked exercise)

Avoid long free-text biographies. Prefer structured fields, tags, dropdowns, and short answers.

The profile should feel sporty, social, and community-driven.

2. Listings Marketplace
Users can create listings for:

 - Selling a competition ticket

 - Looking for a replacement teammate

 - Looking to join a team

Each listing should include:

 a.Competition name

 b.Competition type

 c.Date

 d.Location

 e.Team or individual

 f.Skill level

 g.Short description

 h.Spots available

 i.Gender category if relevant

 j.Search & Discovery
Users should be able to:

a. Browse athlete profiles

 b.Browse listings

 c.Filter by competition type

 d.Date

 e.Location

 f.Skill level

 g.Team vs individual

 h.Experience level

The experience should prioritize easy discovery and matching.

4. Messaging
Users can message each other directly:

a. A buyer can contact a ticket seller

b. A team can contact an athlete

c. An athlete can apply to join a team



>> Design Direction
The app should feel:

 - Athletic

 - Energetic

 - Clean

 - Community-oriented

 - Modern startup aesthetic



>> Pages
Create:

a. Main page that says what the app does, with a catchy engaging but short intro + CTA to login or sign up

 b.Sign up / login, integrated already with social media login (e.g. google)

 c.Athlete profile page (aka user profile)

 d.Listings feed

 e.Listing detail page

 f.Search page with filters

 g.Messages/conversation space 

h.Notification centre

 

Keep the architecture simple and scalable.

Use realistic mock data throughout the app.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://jointeamup.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/20b27b88-12de-4fc2-95c3-8332370e0871).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
