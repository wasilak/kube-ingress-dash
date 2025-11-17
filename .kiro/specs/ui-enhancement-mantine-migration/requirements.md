# Requirements Document

## Introduction

This document outlines the requirements for enhancing the Kube Ingress Dashboard with a modern UI framework migration (Mantine) and advanced features including detailed ingress modals, certificate information display, and flexible grouping capabilities. The goal is to create a more maintainable, feature-rich, and user-friendly dashboard experience.

## Glossary

- **Dashboard**: The main application interface displaying Kubernetes ingress resources
- **Ingress Card**: A visual component representing a single Kubernetes ingress resource
- **Modal**: A dialog window displaying detailed information about an ingress resource
- **Mantine**: A React component library providing comprehensive UI components and hooks
- **Certificate Details**: Information about TLS certificates associated with ingress resources
- **Grouping**: The ability to organize ingress cards into categorized sections
- **YAML Manifest**: The raw Kubernetes resource definition in YAML format
- **Kubernetes API**: The API server providing access to cluster resources
- **shadcn/ui**: The current UI component library being replaced

## Requirements

### Requirement 1: UI Framework Migration

**User Story:** As a developer, I want to migrate from shadcn/ui to Mantine, so that the codebase is easier to maintain and extend with built-in components.

#### Acceptance Criteria

1. WHEN the Dashboard initializes, THE Dashboard SHALL render all UI components using Mantine library
2. THE Dashboard SHALL remove all shadcn/ui dependencies from package.json
3. THE Dashboard SHALL remove all Radix UI primitive dependencies that are replaced by Mantine equivalents
4. THE Dashboard SHALL maintain visual consistency with the current design during migration
5. THE Dashboard SHALL configure Mantine theme to match the existing color scheme and design tokens

### Requirement 2: Ingress Details Modal

**User Story:** As a user, I want to view comprehensive ingress details in a modal window, so that I can access all information about an ingress resource in one place.

#### Acceptance Criteria

1. WHEN a user clicks the details icon on an Ingress Card, THE Dashboard SHALL open a scrollable Modal displaying ingress information
2. THE Modal SHALL display main ingress details at the top including name, namespace, creation timestamp, and status
3. THE Modal SHALL display all labels in a formatted, readable layout below main details
4. THE Modal SHALL display all annotations in a formatted, readable layout below labels
5. THE Modal SHALL display human-readable ingress configuration including hosts, paths, and backend services
6. THE Modal SHALL display the raw YAML manifest with syntax highlighting at the bottom
7. THE Modal SHALL provide a copy button that copies the YAML manifest to clipboard
8. WHEN the Modal is open, THE Dashboard SHALL update the browser URL to include the ingress identifier
9. WHEN a user navigates to a URL with an ingress identifier, THE Dashboard SHALL open the Modal for that specific ingress
10. THE Modal SHALL be scrollable to accommodate all content without truncation

### Requirement 3: Certificate Information Display

**User Story:** As a user, I want to view TLS certificate details for ingresses with TLS enabled, so that I can monitor certificate expiration and validity.

#### Acceptance Criteria

1. WHEN an ingress has TLS enabled, THE Dashboard SHALL fetch certificate details from the Kubernetes API
2. THE Dashboard SHALL retrieve certificate information from the associated Secret resource
3. THE Modal SHALL display certificate expiration date in a prominent, readable format
4. THE Modal SHALL display certificate issuer information
5. THE Modal SHALL display certificate subject information
6. THE Modal SHALL display all valid domains covered by the certificate
7. WHEN a certificate is expiring within 30 days, THE Modal SHALL highlight the expiration date with a warning indicator
8. WHEN a certificate is expired, THE Modal SHALL highlight the expiration date with an error indicator
9. WHERE certificate details cannot be retrieved, THE Modal SHALL display an informative message explaining the limitation

### Requirement 4: Application Title Update

**User Story:** As a user, I want to see a properly formatted application title, so that the dashboard appears professional and readable.

#### Acceptance Criteria

1. THE Dashboard SHALL display "Kube Ingress Dash" as the application title in the header
2. THE Dashboard SHALL replace the current "kube-ingress-dash" title with the formatted version

### Requirement 5: Flexible Grouping System

**User Story:** As a user, I want to group ingress cards by different criteria, so that I can organize and view ingresses based on my current focus.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a single-select dropdown control for choosing grouping mode
2. THE Dashboard SHALL support "None" grouping mode displaying all ingresses in a single grid
3. THE Dashboard SHALL support "Namespace" grouping mode organizing ingresses by namespace
4. THE Dashboard SHALL support "TLS Status" grouping mode organizing ingresses by TLS enabled/disabled
5. WHEN a grouping mode is selected, THE Dashboard SHALL display multiple grid sections with captions
6. THE Dashboard SHALL display the group name and count in each section caption using format "Group Name (count)"
7. THE Dashboard SHALL display empty groups with zero count when no ingresses match the group criteria
8. THE Dashboard SHALL apply grouping independently of search and filter operations
9. THE Dashboard SHALL maintain the selected grouping mode when filters or search queries change
10. THE Dashboard SHALL persist the grouping selection in the browser URL for bookmarking

### Requirement 6: Enhanced Ingress Card Design

**User Story:** As a user, I want ingress cards to have a details button, so that I can easily access comprehensive information.

#### Acceptance Criteria

1. THE Ingress Card SHALL display a details icon button in a prominent location
2. WHEN a user clicks the details icon, THE Dashboard SHALL open the ingress details Modal
3. THE Ingress Card SHALL maintain all existing information display including hosts, paths, and TLS indicator
4. THE Ingress Card SHALL use Mantine Card component for consistent styling

### Requirement 7: API Enhancement for Certificate Data

**User Story:** As a developer, I want the API to provide certificate details, so that the frontend can display certificate information.

#### Acceptance Criteria

1. THE Kubernetes API client SHALL fetch Secret resources associated with TLS ingresses
2. THE API SHALL parse certificate data from Secret resources
3. THE API SHALL extract expiration date, issuer, subject, and valid domains from certificates
4. THE API SHALL include certificate details in the ingress data response
5. WHERE certificate parsing fails, THE API SHALL log the error and continue without certificate details
6. THE API SHALL handle missing or inaccessible Secret resources gracefully

### Requirement 8: Type System Enhancement

**User Story:** As a developer, I want comprehensive TypeScript types for certificate data, so that the codebase maintains type safety.

#### Acceptance Criteria

1. THE type system SHALL define an interface for certificate details including all required fields
2. THE IngressData interface SHALL include an optional certificate details field
3. THE type system SHALL define types for certificate expiration status (valid, expiring, expired)
4. THE type system SHALL provide type definitions for all new Modal component props

### Requirement 9: URL Routing for Modal State

**User Story:** As a user, I want to share direct links to specific ingress details, so that I can reference specific ingresses in documentation or communication.

#### Acceptance Criteria

1. WHEN the Modal opens, THE Dashboard SHALL update the URL to include the ingress namespace and name
2. THE Dashboard SHALL use URL format: `/ingress/{namespace}/{name}`
3. WHEN a user navigates to a direct ingress URL, THE Dashboard SHALL open the Modal automatically
4. WHEN the Modal closes, THE Dashboard SHALL restore the base URL
5. THE Dashboard SHALL handle invalid ingress identifiers in URLs gracefully by showing an error message

### Requirement 10: Performance Optimization

**User Story:** As a user, I want the dashboard to remain responsive with large numbers of ingresses, so that I can efficiently manage my cluster resources.

#### Acceptance Criteria

1. THE Dashboard SHALL render grouped sections efficiently without blocking the UI thread
2. THE Dashboard SHALL lazy-load certificate details only when the Modal is opened
3. THE Dashboard SHALL cache certificate details to avoid redundant API calls
4. THE Dashboard SHALL use React memoization for Ingress Cards to prevent unnecessary re-renders
5. WHERE more than 100 ingresses are displayed, THE Dashboard SHALL implement virtualization for the card grid
