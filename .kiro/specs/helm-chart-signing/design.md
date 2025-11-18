# Design Document

## Overview

This design document outlines the architecture and implementation approach for establishing a cryptographic signing system for the Kube Ingress Dashboard Helm chart. The system will integrate with Artifact Hub's verification mechanisms to provide users with confidence in the authenticity and integrity of the chart.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Development Workflow                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Developer commits → GitHub → CI/CD Pipeline                 │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   CI/CD Pipeline (GitHub Actions)            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Build Helm Chart                                         │
│  2. Package Chart → chart-version.tgz                        │
│  3. Load GPG Private Key (from secrets)                      │
│  4. Sign Chart → Generate .prov file                         │
│  5. Verify Signature                                         │
│  6. Upload to Chart Repository                               │
│     ├─ chart-version.tgz                                     │
│     └─ chart-version.tgz.prov                                │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Chart Repository                          │
│                  (GitHub Pages / OCI Registry)               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  - index.yaml (chart metadata)                               │
│  - chart-1.0.0.tgz (signed chart package)                    │
│  - chart-1.0.0.tgz.prov (provenance file)                    │
│  - artifacthub-repo.yml (Artifact Hub metadata)              │
│  - public-key.asc (GPG public key)                           │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Artifact Hub                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Scan Repository                                          │
│  2. Read artifacthub-repo.yml                                │
│  3. Download Charts + Provenance Files                       │
│  4. Verify Signatures with Public Key                        │
│  5. Display "Signed" Badge if Valid                          │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         End Users                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Browse Artifact Hub                                      │
│  2. See "Signed" Badge                                       │
│  3. Download Chart + Provenance                              │
│  4. Verify Locally: helm verify chart.tgz                    │
│  5. Install with Confidence                                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. GPG Key Management

#### Key Generation

**Tool:** GPG (GNU Privacy Guard)

**Key Requirements:**

- Algorithm: RSA
- Key size: 4096 bits (recommended for long-term security)
- Expiration: 2-3 years (with rotation plan)
- User ID: Chart maintainer email and name

**Generation Command:**

```bash
gpg --full-generate-key
# Select: (1) RSA and RSA
# Key size: 4096
# Expiration: 2y
# Real name: Kube Ingress Dashboard Maintainer
# Email: maintainer@example.com
```

#### Key Storage

**Private Key:**

- Store in GitHub Secrets as `GPG_PRIVATE_KEY`
- Export format: ASCII-armored
- Never commit to repository
- Backup securely offline

**Public Key:**

- Store in chart repository as `public-key.asc`
- Publish on key servers (optional)
- Include in documentation

**Export Commands:**

```bash
# Export private key (for CI/CD secrets)
gpg --export-secret-keys --armor KEY_ID > private-key.asc

# Export public key (for repository)
gpg --export --armor KEY_ID > public-key.asc
```

### 2. Chart Signing Process

#### Signing Workflow

**Step 1: Package Chart**

```bash
helm package ./chart-directory
# Output: kube-ingress-dash-1.0.0.tgz
```

**Step 2: Sign Chart**

```bash
helm package --sign --key 'KEY_NAME' --keyring ~/.gnupg/secring.gpg ./chart-directory
# Output:
#   kube-ingress-dash-1.0.0.tgz
#   kube-ingress-dash-1.0.0.tgz.prov
```

**Step 3: Verify Signature**

```bash
helm verify kube-ingress-dash-1.0.0.tgz
# Should output: "Signed by: ..."
```

#### Provenance File Structure

The `.prov` file contains:

- Chart package hash (SHA256)
- GPG signature
- Signing timestamp
- Signer information

**Example .prov file:**

```
-----BEGIN PGP SIGNED MESSAGE-----
Hash: SHA256

apiVersion: v2
name: kube-ingress-dash
version: 1.0.0
...
files:
  kube-ingress-dash-1.0.0.tgz: sha256:abc123...
-----BEGIN PGP SIGNATURE-----
...
-----END PGP SIGNATURE-----
```

### 3. CI/CD Pipeline Integration

#### GitHub Actions Workflow

**Location:** `.github/workflows/release-chart.yml`

**Key Steps:**

1. **Checkout Code**
2. **Set up Helm**
3. **Import GPG Key**
4. **Package and Sign Chart**
5. **Verify Signature**
6. **Upload to Repository**
7. **Update Chart Index**

**Workflow Example:**

```yaml
name: Release Helm Chart

on:
  push:
    tags:
      - 'chart-v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Set up Helm
        uses: azure/setup-helm@v3
        with:
          version: 'latest'

      - name: Import GPG key
        run: |
          echo "${{ secrets.GPG_PRIVATE_KEY }}" | gpg --import
          echo "${{ secrets.GPG_PASSPHRASE }}" | gpg --batch --yes --passphrase-fd 0 --quick-add-uid KEY_ID

      - name: Package and sign chart
        run: |
          helm package --sign --key 'KEY_NAME' --keyring ~/.gnupg/secring.gpg ./charts/kube-ingress-dash

      - name: Verify signature
        run: |
          helm verify kube-ingress-dash-*.tgz

      - name: Upload to repository
        # Upload .tgz and .prov files
```

### 4. Artifact Hub Configuration

#### artifacthub-repo.yml

**Location:** Root of chart repository

**Structure:**

```yaml
repositoryID: unique-repo-id
owners:
  - name: Maintainer Name
    email: maintainer@example.com

# Signing configuration
signing:
  # Method: gpg or cosign
  method: gpg
  # URL to public key
  url: https://charts.example.com/public-key.asc
  # Key fingerprint
  fingerprint: ABCD1234EFGH5678...
```

#### Chart Metadata

**Chart.yaml additions:**

```yaml
apiVersion: v2
name: kube-ingress-dash
version: 1.0.0
maintainers:
  - name: Maintainer Name
    email: maintainer@example.com
    url: https://github.com/username
annotations:
  # Artifact Hub specific annotations
  artifacthub.io/signKey: |
    fingerprint: ABCD1234EFGH5678...
    url: https://charts.example.com/public-key.asc
```

### 5. Transparency Log Integration (Optional)

#### Sigstore/Rekor Setup

**Components:**

- **Rekor**: Transparency log for signing events
- **Fulcio**: Certificate authority for short-lived certs
- **Cosign**: Tool for signing and verification

**Signing with Cosign:**

```bash
# Sign chart with keyless signing
cosign sign-blob --bundle cosign.bundle kube-ingress-dash-1.0.0.tgz

# Verify with transparency log
cosign verify-blob --bundle cosign.bundle --signature sig kube-ingress-dash-1.0.0.tgz
```

**Benefits:**

- Immutable audit trail
- Timestamped signing events
- No long-lived key management
- Public verification

**Trade-offs:**

- Additional complexity
- Requires internet connectivity for verification
- Newer technology (less widespread adoption)

**Recommendation:** Start with GPG signing, add Sigstore as enhancement later.

## Data Models

### Provenance File Schema

```typescript
interface ProvenanceFile {
  // Chart metadata
  apiVersion: string;
  name: string;
  version: string;

  // File hashes
  files: {
    [filename: string]: string; // SHA256 hash
  };

  // Signature (PGP format)
  signature: string;

  // Signing metadata
  signedAt: string; // ISO 8601 timestamp
  signedBy: {
    name: string;
    email: string;
    keyId: string;
  };
}
```

### Artifact Hub Metadata

```typescript
interface ArtifactHubRepo {
  repositoryID: string;
  owners: Array<{
    name: string;
    email: string;
  }>;
  signing?: {
    method: 'gpg' | 'cosign';
    url: string;
    fingerprint: string;
  };
}
```

## Error Handling

### Signing Failures

**Scenarios:**

1. GPG key not found → Check key import in CI/CD
2. Passphrase incorrect → Verify secret configuration
3. Chart packaging fails → Fix chart validation errors
4. Signature verification fails → Regenerate signature

**Strategy:**

- Fail fast in CI/CD pipeline
- Clear error messages
- Automated notifications
- Rollback mechanism

### Verification Failures

**User-Side Scenarios:**

1. Public key not found → Provide download instructions
2. Signature mismatch → Chart may be tampered, do not install
3. Expired key → Update to latest chart version with new key

**Artifact Hub Scenarios:**

1. Cannot fetch public key → Check URL in metadata
2. Invalid signature → Chart won't show "signed" badge
3. Missing provenance file → Treat as unsigned

## Testing Strategy

### Unit Tests

**Key Management:**

- Test key generation scripts
- Test key export/import
- Test passphrase handling

**Signing Process:**

- Test chart packaging
- Test signature generation
- Test provenance file creation

### Integration Tests

**CI/CD Pipeline:**

- Test complete signing workflow
- Test with valid and invalid keys
- Test error handling
- Test artifact upload

**Artifact Hub:**

- Test metadata parsing
- Test signature verification
- Test badge display
- Test with various chart versions

### Manual Verification Tests

**User Workflow:**

1. Download chart from repository
2. Import public key
3. Verify signature with `helm verify`
4. Confirm successful verification

**Artifact Hub Workflow:**

1. Register repository
2. Wait for scan
3. Verify "signed" badge appears
4. Check signature details on chart page

## Security Considerations

### Private Key Protection

**Storage:**

- Never commit private keys to version control
- Use GitHub Secrets or equivalent secure storage
- Encrypt keys at rest
- Limit access to authorized personnel only

**Access Control:**

- Restrict who can modify CI/CD secrets
- Use separate keys for different environments (dev/prod)
- Implement key rotation schedule
- Audit key access logs

### Key Rotation

**Schedule:** Every 2-3 years or when:

- Key is compromised
- Team member with key access leaves
- Security best practices change

**Rotation Process:**

1. Generate new key pair
2. Update CI/CD secrets
3. Sign new chart releases with new key
4. Publish new public key
5. Update Artifact Hub metadata
6. Announce key change to users
7. Maintain old key for verification of old releases

### Signature Verification

**User Best Practices:**

- Always verify signatures before installation
- Import public key from trusted source
- Check key fingerprint matches documentation
- Report suspicious signatures

**Automated Verification:**

- CI/CD verifies signatures before publishing
- Artifact Hub verifies on scan
- Monitoring for verification failures

## Dependencies

### Required Tools

```json
{
  "gpg": "2.x",
  "helm": "3.x",
  "github-actions": "latest"
}
```

### Optional Tools (for Sigstore)

```json
{
  "cosign": "2.x",
  "rekor-cli": "latest"
}
```

## Documentation Requirements

### User Documentation

**Topics to Cover:**

1. Why charts are signed
2. How to verify signatures
3. Where to find public key
4. Troubleshooting verification issues
5. What to do if verification fails

**Location:** README.md, docs/verification.md

### Maintainer Documentation

**Topics to Cover:**

1. Key generation process
2. Key storage and backup
3. CI/CD configuration
4. Key rotation procedures
5. Troubleshooting signing issues
6. Emergency procedures

**Location:** docs/maintainer-guide.md

### API/Integration Documentation

**Topics to Cover:**

1. Artifact Hub metadata format
2. Provenance file structure
3. Signature verification API
4. Integration with other tools

**Location:** docs/integration.md

## Monitoring and Maintenance

### Metrics to Track

- Number of signed releases
- Signature verification success rate
- Key expiration dates
- Artifact Hub scan results
- User verification attempts

### Alerts

- Key expiring soon (90 days before)
- Signature verification failures
- Artifact Hub scan failures
- CI/CD signing failures

### Maintenance Tasks

**Monthly:**

- Review signing logs
- Check Artifact Hub status
- Verify public key accessibility

**Quarterly:**

- Review key rotation schedule
- Update documentation
- Test verification workflows

**Annually:**

- Security audit
- Key rotation (if scheduled)
- Update signing tools

## Migration Strategy

### Phase 1: Setup and Testing (Week 1-2)

- Generate GPG keys
- Configure CI/CD pipeline
- Test signing locally
- Document procedures

### Phase 2: Initial Release (Week 3)

- Sign first chart release
- Publish to repository
- Verify signatures work
- Monitor for issues

### Phase 3: Artifact Hub Integration (Week 4)

- Create artifacthub-repo.yml
- Register on Artifact Hub
- Verify badge appears
- Update documentation

### Phase 4: User Communication (Week 5)

- Announce signing to users
- Publish verification guide
- Update README with badges
- Provide support for questions

### Phase 5: Monitoring and Optimization (Ongoing)

- Monitor verification metrics
- Gather user feedback
- Optimize workflows
- Plan for Sigstore integration (future)

## Future Enhancements

### Sigstore Integration

**Benefits:**

- Keyless signing
- Transparency log
- Shorter-lived certificates
- Better audit trail

**Timeline:** 6-12 months after GPG implementation

### Multi-Signature Support

**Concept:** Require multiple maintainers to sign releases

**Benefits:**

- Increased security
- Reduced single point of failure
- Better accountability

**Timeline:** 12+ months

### Automated Key Rotation

**Concept:** Automate key generation and rotation

**Benefits:**

- Reduced manual work
- Consistent rotation schedule
- Better security hygiene

**Timeline:** 12+ months
