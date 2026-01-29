# AWS Cloud Storage Setup Checklist

Complete this checklist to migrate from localStorage to AWS cloud storage.

## Phase 1: AWS Account & Prerequisites ✅

- [ ] AWS Account created (https://aws.amazon.com)
- [ ] AWS CLI installed (`aws --version` returns version)
- [ ] AWS credentials configured (`aws configure` completed)
  - [ ] Access Key ID set
  - [ ] Secret Access Key set
  - [ ] Default region set (e.g., us-east-1)
- [ ] Node.js 16+ installed
- [ ] npm/yarn available in project

## Phase 2: Create AWS Resources 📦

### DynamoDB Tables
```bash
# Copy and run these commands from AWS_MIGRATION_GUIDE.md section "Create DynamoDB Tables"
```
- [ ] fundtracer-users table created
  - [ ] Partition key: `id` (String)
  - [ ] TTL attribute: `ttl` (90 days)
  - [ ] On-demand billing enabled
- [ ] fundtracer-settings table created
  - [ ] Partition key: `userId` (String)
  - [ ] Sort key: `settingKey` (String)
- [ ] fundtracer-sessions table created
  - [ ] Partition key: `userId` (String)
  - [ ] TTL attribute: `ttl` (90 days)

### S3 Bucket
```bash
# Copy and run these commands from AWS_MIGRATION_GUIDE.md section "Create S3 Bucket"
```
- [ ] fundtracer-storage bucket created
  - [ ] Region: us-east-1 (or your region)
  - [ ] Versioning: Enabled
  - [ ] Server-side encryption: AES-256
  - [ ] Block public access: All enabled
  - [ ] ACL: Private by default

### IAM User & Permissions
```bash
# Copy and run these commands from AWS_MIGRATION_GUIDE.md section "Create IAM User"
```
- [ ] IAM user created (e.g., `fundtracer-app`)
  - [ ] Programmatic access enabled
  - [ ] Access Key & Secret Key generated
- [ ] Permissions policy attached
  - [ ] DynamoDB: ListTables, GetItem, PutItem, UpdateItem, DeleteItem, Query, Scan
  - [ ] S3: GetObject, PutObject, DeleteObject, ListBucket
- [ ] Access keys saved securely

## Phase 3: Frontend Configuration 🔧

### Environment Variables
- [ ] Copy `.env.aws` to `.env.local`
  ```bash
  cp .env.aws .env.local
  ```
- [ ] Edit `.env.local` with AWS credentials:
  ```
  NEXT_PUBLIC_USE_AWS_STORAGE=true
  NEXT_PUBLIC_AWS_REGION=us-east-1
  AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
  AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
  NEXT_PUBLIC_S3_BUCKET=fundtracer-storage
  NEXT_PUBLIC_DYNAMODB_USERS_TABLE=fundtracer-users
  NEXT_PUBLIC_DYNAMODB_SETTINGS_TABLE=fundtracer-settings
  NEXT_PUBLIC_DYNAMODB_SESSIONS_TABLE=fundtracer-sessions
  ```
- [ ] `.env.local` added to `.gitignore`
- [ ] Never commit credentials to version control

### Package Dependencies
- [ ] AWS SDK installed
  ```bash
  npm install aws-sdk
  # or
  yarn add aws-sdk
  ```
- [ ] New files verified to exist:
  - [ ] `frontend/lib/aws-storage.ts` (380 lines)
  - [ ] `frontend/lib/cloud-storage.ts` (190 lines)
  - [ ] `frontend/lib/use-cloud-storage.ts` (280 lines)

### Code Verification
- [ ] TypeScript compilation passes
  ```bash
  npm run build
  # or
  yarn build
  ```
- [ ] No import errors in console

## Phase 4: Component Migration 🚀

### Priority 1: Authentication Components
Update these files to use cloud storage:

- [ ] `frontend/app/auth/page.tsx`
  - [ ] Replace `localStorage.setItem("user", ...)` with `cloudStorageService.setItem()`
  - [ ] Replace `localStorage.getItem("user")` with `cloudStorageService.getItem()`
  - [ ] Use `useUser()` hook for state management
  - [ ] Use `useAuthTokens()` hook for tokens
  - [ ] Test login flow works

- [ ] `frontend/app/components/header.tsx`
  - [ ] Replace localStorage access with `useUser()` hook
  - [ ] Update logout function to call `clearUser()`
  - [ ] Test user display updates on login/logout

### Priority 2: Dashboard/Profile Components
- [ ] `frontend/app/profile/page.tsx`
  - [ ] Use `useSettings()` hook for user preferences
  - [ ] Replace settings localStorage with `updateSetting()`
  - [ ] Test settings persistence

- [ ] `frontend/app/components/theme-switcher.tsx` (if exists)
  - [ ] Use `useSettings()` hook for theme
  - [ ] Call `updateSetting("theme", newTheme)` on change
  - [ ] Verify theme persists across sessions

### Priority 3: Data Components
- [ ] `frontend/app/campaigns/[id]/page.tsx`
  - [ ] Use `useFileUpload()` hook for milestone uploads
  - [ ] Use `cloudStorageService.uploadFile()` for S3 uploads
  - [ ] Test file upload works

- [ ] `frontend/app/components/milestone-viewer.tsx`
  - [ ] Use `useFileUpload()` for proof uploads
  - [ ] Update file path to: `campaigns/{campaignId}/milestones/{milestoneId}/`
  - [ ] Test upload progress display

## Phase 5: Testing & Validation 🧪

### Local Testing
- [ ] Start dev server: `npm run dev`
- [ ] Test AWS is disabled (set `NEXT_PUBLIC_USE_AWS_STORAGE=false`)
  - [ ] Login works with localStorage fallback
  - [ ] Logout clears data
  - [ ] Settings persist
  - [ ] Files "upload" locally
- [ ] Enable AWS (set `NEXT_PUBLIC_USE_AWS_STORAGE=true`)
  - [ ] Login persists to DynamoDB
  - [ ] User data appears in AWS Console
  - [ ] Settings sync to DynamoDB
  - [ ] Files upload to S3
  - [ ] Session created with TTL

### Cross-Device Testing
- [ ] Login on Device A
- [ ] Access same account on Device B
  - [ ] User data syncs
  - [ ] Settings available
  - [ ] Theme matches
- [ ] Logout on Device A
- [ ] Data cleared on Device A only

### Error Handling Testing
- [ ] Disable AWS credentials in `.env.local`
- [ ] Verify app falls back to localStorage automatically
- [ ] Re-enable credentials and verify AWS works again
- [ ] Test network disconnect scenario
  - [ ] App should queue operations
  - [ ] Retry when connection restored

## Phase 6: Monitoring & Security 🔒

### Security Audit
- [ ] `.env.local` is in `.gitignore`
- [ ] No credentials in git history
  ```bash
  git log -p -- .env.local  # Should show nothing
  ```
- [ ] AWS Access Keys rotated regularly
- [ ] CloudTrail enabled for S3 access logging
- [ ] DynamoDB backup enabled

### Performance Monitoring
- [ ] CloudWatch metrics checked
  - [ ] DynamoDB read/write capacity
  - [ ] S3 request metrics
  - [ ] API latency
- [ ] Cost analysis reviewed
  - [ ] Estimated monthly cost ~$1-2
  - [ ] Usage patterns identified
  - [ ] Alerts set if usage spikes

### Backup & Recovery
- [ ] DynamoDB point-in-time recovery enabled
- [ ] S3 versioning verified
- [ ] Backup strategy documented
- [ ] Recovery procedure tested

## Phase 7: Production Deployment 🚀

### Pre-Deployment Checklist
- [ ] All tests passing
- [ ] No console errors in dev tools
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Credentials review completed

### Deployment
- [ ] Add `.env.local` values to CI/CD secrets
  ```
  NEXT_PUBLIC_USE_AWS_STORAGE=true
  AWS_ACCESS_KEY_ID=***
  AWS_SECRET_ACCESS_KEY=***
  # ... other env vars
  ```
- [ ] Deploy to staging environment
- [ ] Smoke test in staging:
  - [ ] Login works
  - [ ] File uploads succeed
  - [ ] Settings persist
  - [ ] No errors in logs
- [ ] Deploy to production
- [ ] Monitor for errors (CloudWatch, Sentry, etc.)

### Post-Deployment
- [ ] Monitor CloudWatch metrics for 24 hours
- [ ] User feedback collected
- [ ] Performance metrics tracked
- [ ] Budget alerts configured
- [ ] Documentation updated

## Phase 8: Cleanup & Optimization 📝

### Remove Old Code
- [ ] Verify localStorage is no longer used in critical paths
- [ ] Remove any hardcoded localStorage fallbacks that aren't needed
- [ ] Update API clients to use cloud storage for tokens
- [ ] Delete old storage utility files (if any)

### Optimize Performance
- [ ] DynamoDB read capacity auto-scaling enabled
- [ ] S3 CloudFront distribution setup (optional)
  - [ ] Improves file download speed
  - [ ] Reduces S3 requests
- [ ] Batch operations reviewed
  - [ ] Multiple settings updates combined
  - [ ] Unnecessary API calls eliminated

### Documentation
- [ ] README updated with AWS setup instructions
- [ ] Team trained on new storage system
- [ ] Troubleshooting guide created
- [ ] Architecture diagram updated

## Common Issues & Solutions 🆘

### Issue: "Credentials not found"
```
Solution: 
1. Check .env.local exists and has values
2. Run: aws configure
3. Verify: aws sts get-caller-identity
```

### Issue: "DynamoDB table not found"
```
Solution:
1. Check table name matches .env.local
2. Verify in AWS Console: DynamoDB > Tables
3. Run CLI commands from migration guide
```

### Issue: "S3 access denied"
```
Solution:
1. Verify IAM user has S3 permissions
2. Check bucket policy allows access
3. Verify credentials in .env.local
```

### Issue: "localStorage fallback not working"
```
Solution:
1. Check NEXT_PUBLIC_USE_AWS_STORAGE=false
2. Verify localStorage.setItem works in console
3. Check browser storage limits (5-10MB)
```

## Success Metrics ✨

You know you're done when:

✅ Users can login and data persists across sessions  
✅ Settings sync across devices  
✅ Files upload to S3 successfully  
✅ DynamoDB shows active records  
✅ S3 bucket contains uploaded files  
✅ CloudWatch shows healthy metrics  
✅ Zero localStorage reliance in production  
✅ Team is trained and confident  
✅ Documentation is complete  
✅ Cost is tracking as projected  

## Support Resources

- **AWS Documentation**: https://docs.aws.amazon.com
- **AWS SDK JS Docs**: https://docs.aws.amazon.com/AWSJavaScriptSDK/
- **Next.js Docs**: https://nextjs.org/docs
- **This Project's Guide**: See `AWS_MIGRATION_GUIDE.md`
- **Example Code**: See `EXAMPLE_AWS_MIGRATION.md`

## Notes Section

Use this space to track your progress:

```
Started: ________________
Phase 1 Complete: ________________
Phase 2 Complete: ________________
Phase 3 Complete: ________________
Phase 4 Complete: ________________
Phase 5 Complete: ________________
Phase 6 Complete: ________________
Phase 7 Complete: ________________
Production Launch: ________________
```

---
**Last Updated**: 2024  
**Maintained by**: Your Team
