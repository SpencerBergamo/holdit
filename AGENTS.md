<!-- AGENTS.md -->
# HoldIt — Agent Guidelines

## Project Overview

HoldIt lets users save products to digital wishlists called **collections**. Save via URL, photo upload, or manual entry. Google Gemini extracts product details from photos and incomplete URLs. Users friend each other and share collections for gift inspiration.

---

## Tech Stack

| Layer | Service |
|-------|---------|
| Auth | Supabase Authentication |
| Database / Realtime | Supabase Realtime |
| File Storage | Supabase Storage |
| AI | Google Gemini 1.5 Flash |
| Framework | Expo Router (file-based) |
| Styling | Custom theme (see below) |

---

## Style Guide

- **Friendly but focused**: Most of the color and imagery will come from product images; the UI stays out of the way
- **Celebratory moments**: Success states feel rewarding (new item added, friend request accepted)
- **Trustworthy**: Handling friends' wishlists requires confidence and clarity
- **Native**: UI should feel native to the platform (ios & android) and intuitive to the user.

## Important Packages
- expo-camera: native photo upload experience
- react-hook-form: manage form validation & errors easily
- @shopify/flash-list: advanced list items
- react-native-reanimated: HoldIt should feel fun and animated
