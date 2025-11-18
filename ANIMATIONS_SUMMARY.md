# Animations and Transitions Summary

This document summarizes all the animations and transitions added to the Kube Ingress Dashboard application.

## Animation Keyframes

### Core Animations

- **fadeIn**: Smooth opacity transition from 0 to 1 (300ms)
- **slideUp**: Slides content up while fading in (300-400ms)
- **scaleIn**: Scales content from 95% to 100% while fading in (200-250ms)
- **shimmer**: Loading skeleton animation with moving gradient (2s infinite)
- **pulse**: Pulsing opacity animation for loading states (2s infinite)

## Component Animations

### 1. Ingress Cards

- **Hover Effect**: Lift animation with shadow on hover
- **Fade In**: Cards fade in when rendered
- **Smooth Transitions**: All state changes are animated (200ms)

### 2. Grouped Ingress Grid

- **Staggered Entry**: Groups animate in with 50ms delay between each
- **Collapse/Expand**: Smooth 300ms transition for group sections
- **Grid Fade**: Grid content fades in when displayed

### 3. Modal (Ingress Details)

- **Open/Close**: Scale animation (250ms cubic-bezier)
- **Overlay**: Fade in animation (200ms)
- **Section Stagger**: Each section slides up with progressive delay (0-200ms)
- **Collapse Sections**: Labels and annotations collapse smoothly (300ms)

### 4. Interactive Elements

#### Buttons

- **Hover**: Slight lift with shadow (200ms)
- **Active**: Press down effect (100ms)
- **Outline Variant**: Border color and transform transitions

#### Action Icons

- **Hover**: Scale up to 105% with border color change
- **Icon Scale**: SVG icons scale on hover (150ms)
- **Copy Success**: Scale in animation when copy succeeds

#### Input Fields

- **Hover**: Border color transitions to primary (200ms)
- **Focus**: Smooth border and shadow transitions (200ms)

### 5. Dropdowns and Popovers

- **Select Dropdown**: Slides up when opening (200ms)
- **MultiSelect Dropdown**: Slides up when opening (200ms)
- **Tooltip**: Scale in animation (150ms)
- **Popover**: Scale in animation (200ms)

### 6. Loading States

- **Skeleton Cards**: Pulse animation (2s infinite)
- **Skeleton Elements**: Shimmer gradient animation (1.5s infinite)
- **Stats Skeleton**: Pulse animation on all elements

### 7. Search Bar

- **Clear Button**: Scale in animation when visible
- **Input Transitions**: Smooth border color changes

### 8. Alerts and Notifications

- **Entry**: Slide up animation (300ms)
- **Dividers**: Fade in animation (300ms)

## Performance Optimizations

### Will-Change Properties

Applied to frequently animated elements:

- `.hover-lift`
- `.mantine-Card-root`
- `.mantine-Button-root`
- `.mantine-ActionIcon-root`

### Reduced Motion Support

Respects user preferences with `prefers-reduced-motion`:

- All animations reduced to 0.01ms for users who prefer reduced motion
- Ensures accessibility compliance

## Timing Functions

### Ease Functions Used

- **ease**: Default smooth transitions
- **ease-out**: Decelerating animations (most common)
- **cubic-bezier(0.4, 0, 0.2, 1)**: Material Design standard easing
- **cubic-bezier(0.4, 0, 0.6, 1)**: Pulse animation easing

## Animation Durations

### Quick (100-150ms)

- Icon hover effects
- Button press effects
- Tooltip appearances

### Standard (200-250ms)

- Card hover effects
- Button hover effects
- Modal open/close
- Input focus transitions

### Smooth (300-400ms)

- Group section animations
- Collapse/expand transitions
- Alert appearances
- Layout changes

### Loading (1.5-2s infinite)

- Skeleton shimmer
- Pulse animations

## CSS Classes

### Utility Classes

- `.animate-fade-in`: Fade in animation
- `.animate-slide-up`: Slide up animation
- `.animate-scale-in`: Scale in animation
- `.animate-shimmer`: Shimmer loading animation
- `.animate-pulse`: Pulse loading animation
- `.transition-layout`: Smooth layout transitions
- `.hover-lift`: Hover lift effect
- `.copy-success`: Copy button success animation
- `.group-section`: Group section with staggered animation

## Browser Compatibility

All animations use standard CSS properties supported by:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- All animations respect `prefers-reduced-motion` media query
- Animations are subtle and don't interfere with usability
- Focus states are clearly visible with smooth transitions
- No flashing or rapid animations that could trigger seizures
