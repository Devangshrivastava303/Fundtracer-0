# AWS Cloud Storage - Quick Reference Guide

**TL;DR**: Store data in AWS instead of browser localStorage. Secure, scalable, cross-device.

---

## 🚀 5-Minute Setup

```bash
# 1. Copy config
cp frontend/.env.aws frontend/.env.local

# 2. Add credentials to .env.local
NEXT_PUBLIC_USE_AWS_STORAGE=true
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

# 3. Create AWS resources (see AWS_MIGRATION_GUIDE.md)
# 4. Start dev server
npm run dev
```

---

## 📖 File Guide

| File | Size | Purpose | Read Time |
|------|------|---------|-----------|
| **AWS_IMPLEMENTATION_SUMMARY.md** | 3 KB | Overview of everything | 5 min |
| **AWS_MIGRATION_GUIDE.md** | 12 KB | Step-by-step AWS setup | 15 min |
| **AWS_SETUP_CHECKLIST.md** | 10 KB | Implementation tasks | 10 min |
| **EXAMPLE_AWS_MIGRATION.md** | 8 KB | Code examples | 10 min |
| **This File** | 2 KB | Quick reference | 2 min |

**Reading Order**:
1. This file (you are here) ← 2 min
2. AWS_IMPLEMENTATION_SUMMARY.md ← 5 min
3. AWS_MIGRATION_GUIDE.md (for AWS setup) ← 15 min
4. EXAMPLE_AWS_MIGRATION.md (for code patterns) ← 10 min
5. AWS_SETUP_CHECKLIST.md (during implementation) ← 10 min

**Total**: 42 minutes to understand everything + setup

---

## 🔧 Three Ways to Use Cloud Storage

### Method 1: Direct Service (Low-level)
```typescript
import { cloudStorageService } from "@/lib/cloud-storage";

// Old way
localStorage.setItem("user", JSON.stringify(user));

// New way (async, handles AWS/localStorage)
await cloudStorageService.setItem("user", JSON.stringify(user));
```

**When to use**: Direct storage operations, custom implementations

---

### Method 2: React Hooks (Recommended)
```typescript
import { useUser } from "@/lib/use-cloud-storage";

function MyComponent() {
  const { user, saveUser, clearUser, loading } = useUser();
  
  const handleLogin = async () => {
    await saveUser({ id: 1, name: "John" });
    // Auto-saves to AWS or localStorage
  };
}
```

**When to use**: React components (99% of use cases)

---

### Method 3: Django Backend
```python
from core.aws_utils import AWSStorageHelper

aws = AWSStorageHelper()
aws.save_user_session(user_id="123", tokens={...})
aws.get_signed_url("s3_key")
aws.delete_s3_file("s3_key")
```

**When to use**: Backend session/file operations

---

## 📝 Common Patterns

### Login Flow
```typescript
const { saveUser, saveTokens } = useUser();
const { accessToken } = useAuthTokens();

async function handleLogin(email, password) {
  const response = await api.login(email, password);
  await saveUser(response.user);
  await saveTokens(response.access_token, response.refresh_token);
  // Saved to AWS DynamoDB automatically!
}
```

### File Upload
```typescript
const { uploadFile, progress, uploading } = useFileUpload();

async function handleFileSelect(file) {
  const url = await uploadFile(
    file,
    `campaigns/123/files/${file.name}`,
    userId
  );
  // File in S3, URL ready to use!
}
```

### Settings Management
```typescript
const { settings, updateSetting } = useSettings();

async function handleThemeChange(theme) {
  await updateSetting("theme", theme);
  // Syncs across all devices!
}
```

### Logout
```typescript
const { clearUser } = useUser();

async function handleLogout() {
  await clearUser();
  // All user data cleared from AWS and localStorage
}
```

---

## 🎯 What Gets Stored Where

### DynamoDB Tables

**1. Users Table** (`fundtracer-users`)
```
id          (primary key)
email       (string)
name        (string)
profile     (JSON)
updatedAt   (timestamp)
ttl         (auto-delete: 90 days)
```

**2. Sessions Table** (`fundtracer-sessions`)
```
userId      (primary key)
accessToken (string)
refreshToken (string)
expiresAt   (timestamp)
ttl         (auto-delete: on expiry)
```

**3. Settings Table** (`fundtracer-settings`)
```
userId      (primary key)
settingKey  (sort key: 'theme', 'notifications', etc.)
settingValue (value)
updatedAt   (timestamp)
```

### S3 Bucket (`fundtracer-storage`)
```
campaigns/
├── 1/
│   └── milestones/
│       └── 1/
│           └── proof.pdf
└── 2/
    └── milestones/
        └── 2/
            └── document.pdf
```

---

## 🔄 Fallback Behavior

Cloud Storage automatically handles:

```
┌─ Check AWS enabled? ─→ Yes ─→ Use AWS DynamoDB/S3
│
└─ Check AWS credentials? ─→ Valid ─→ Use AWS
                         ↓
                    Invalid/Missing
                         ↓
                   Use localStorage
                   (with warning log)
```

**In Development**:
```bash
# Explicitly use localStorage for testing
NEXT_PUBLIC_USE_AWS_STORAGE=false npm run dev

# Use AWS
NEXT_PUBLIC_USE_AWS_STORAGE=true npm run dev
```

---

## 🐛 Troubleshooting

### "Credentials not found"
```
✅ Fix: Check .env.local has AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
```

### "DynamoDB table not found"
```
✅ Fix: Run AWS CLI commands from AWS_MIGRATION_GUIDE.md to create tables
```

### "S3 access denied"
```
✅ Fix: Verify IAM user has S3 permissions (policy in AWS_MIGRATION_GUIDE.md)
```

### "localStorage fallback not working"
```
✅ Fix: Check NEXT_PUBLIC_USE_AWS_STORAGE=false in .env.local
```

### "AWS disabled but I want to use it"
```
✅ Fix: Set NEXT_PUBLIC_USE_AWS_STORAGE=true and fill credentials
```

---

## 📊 Migration Impact

### No Breaking Changes
```typescript
// Old code still works
localStorage.setItem("key", "value");
const val = localStorage.getItem("key");

// New code is better
await cloudStorageService.setItem("key", "value");
const val = await cloudStorageService.getItem("key");
```

### Gradual Rollout
1. Keep old components unchanged
2. Update new components with hooks
3. Migrate existing components one-by-one
4. No forced migration date

### Performance
- **First load**: Slightly slower (AWS network call)
- **Subsequent loads**: Faster (cached in browser)
- **File uploads**: Faster (direct to S3)
- **Sessions**: Faster (cached locally)

---

## 💾 Data You Control

### Automatic Sync
- ✅ User profile
- ✅ Session tokens
- ✅ Settings & preferences
- ✅ Theme selection

### Manual Upload
- ✅ Campaign proof documents
- ✅ User profile pictures (optional)
- ✅ Campaign images (optional)
- ✅ Any custom files

### Never Sent
- ❌ Passwords (handled by JWT)
- ❌ Credit card data (use payment processor)
- ❌ Sensitive PII (only when needed)

---

## 🔒 Security Checklist

- ✅ Credentials in .env.local (never in git)
- ✅ S3 bucket is private by default
- ✅ DynamoDB encryption enabled
- ✅ Signed URLs expire in 1 hour
- ✅ IAM policy restricts operations
- ✅ CloudTrail enabled for audit
- ✅ No hardcoded secrets

---

## 📱 Browser Compatibility

| Browser | localStorage | Cloud Storage |
|---------|------------|---------------|
| Chrome | ✅ | ✅ |
| Firefox | ✅ | ✅ |
| Safari | ✅ | ✅ |
| Edge | ✅ | ✅ |
| IE 11 | ✅ | ⚠️ (polyfills needed) |

---

## 🎓 Learning Resources

| Topic | Where |
|-------|-------|
| Complete setup | AWS_MIGRATION_GUIDE.md |
| Code examples | EXAMPLE_AWS_MIGRATION.md |
| Implementation tasks | AWS_SETUP_CHECKLIST.md |
| Architecture | AWS_IMPLEMENTATION_SUMMARY.md |
| AWS docs | https://docs.aws.amazon.com |
| DynamoDB tutorial | https://docs.aws.amazon.com/amazondynamodb/ |
| S3 tutorial | https://docs.aws.amazon.com/s3/ |

---

## ✨ Key Benefits

| Feature | Benefit |
|---------|---------|
| **DynamoDB** | No server needed, auto-scales, pay per use |
| **S3** | Unlimited file storage, 99.99% availability |
| **Signed URLs** | Temporary access, no credential exposure |
| **TTL** | Automatic cleanup, no manual deletion |
| **Fallback** | Works offline/without AWS |
| **React Hooks** | Easy integration, TypeScript support |
| **Django helper** | Backend session management |
| **Cost** | $1-2/month for small app |

---

## 📞 Getting Help

### Step 1: Check the Guide
- ❓ "How do I set up AWS?" → AWS_MIGRATION_GUIDE.md
- ❓ "How do I use this in code?" → EXAMPLE_AWS_MIGRATION.md
- ❓ "What tasks do I need?" → AWS_SETUP_CHECKLIST.md
- ❓ "What is this all about?" → AWS_IMPLEMENTATION_SUMMARY.md

### Step 2: Check AWS Documentation
- https://docs.aws.amazon.com
- https://docs.aws.amazon.com/AWSJavaScriptSDK/

### Step 3: Check Code Comments
- Every file has detailed comments
- See `aws-storage.ts` for AWS API
- See `use-cloud-storage.ts` for React patterns

### Step 4: Ask Team
- Share this guide with your team
- References are clear and linked
- All decisions are documented

---

## 🎯 Implementation Timeline

| Phase | Duration | Task |
|-------|----------|------|
| Learn | 30 min | Read this guide + summary |
| Setup | 2 hours | Create AWS resources |
| Config | 15 min | Fill .env.local |
| Code | 4 hours | Update components |
| Test | 2 hours | Unit & integration tests |
| Deploy | 1 hour | Staging & production |

**Total**: ~10 hours to production

---

## ✅ Success Criteria

You'll know it's working when:

- ✅ Login saves user to DynamoDB
- ✅ Login persists across browser refresh
- ✅ Login syncs to 2nd device/browser
- ✅ File uploads appear in S3 bucket
- ✅ Settings change persists
- ✅ Logout clears all data
- ✅ App works without AWS (fallback)
- ✅ No console errors
- ✅ CloudWatch shows metrics
- ✅ Team is trained

---

## 🚀 Next Action

1. **Read**: AWS_IMPLEMENTATION_SUMMARY.md (5 min)
2. **Plan**: AWS_SETUP_CHECKLIST.md (10 min)
3. **Setup**: AWS_MIGRATION_GUIDE.md (follow step-by-step)
4. **Code**: EXAMPLE_AWS_MIGRATION.md (copy patterns)
5. **Test**: Follow test section in checklist
6. **Deploy**: Follow deployment section in checklist

**Questions?** See AWS_MIGRATION_GUIDE.md "Troubleshooting" section.

---

## 📋 One-Page Cheat Sheet

```typescript
// Import what you need
import { useUser, useAuthTokens, useFileUpload, useSettings } from "@/lib/use-cloud-storage";

// User management
const { user, saveUser, clearUser, loading, isLoggedIn } = useUser();

// Auth tokens
const { accessToken, refreshToken, saveTokens, clearTokens } = useAuthTokens();

// File uploads
const { uploadFile, getSignedUrl, deleteFile, uploading, progress } = useFileUpload();

// Settings
const { settings, updateSetting, updateSettings, loading } = useSettings();

// Usage
await saveUser({ id: 1, name: "John" });
await updateSetting("theme", "dark");
const url = await uploadFile(file, "path/to/file", userId);
await clearUser();
```

---

**Version**: 1.0  
**Last Updated**: 2024  
**Status**: Ready to use  
**Questions?** See the guides above ⬆️
