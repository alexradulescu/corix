# Production Notes

This document outlines important considerations, edge cases, and recommendations for deploying Corix to production.

## Edge Cases Handled

### 1. Last Admin Scenarios
- **Account Deletion**: Users cannot delete their account if they are the sole admin of any group
- **Group Leaving**: Last admin cannot leave a group; they must either promote another member or delete the group
- **Validation**: The `canDeleteAccount` query checks for sole admin status before allowing deletion
- **User Flow**: Clear error messages guide users to resolve these situations

### 2. Concurrent Role Changes
- **Database Consistency**: Convex provides ACID transactions by default
- **Optimistic Updates**: All mutations properly handle errors and revert state on failure
- **Race Conditions**: Backend validates permissions on every mutation to prevent privilege escalation

### 3. Deleted User Displays
- **Soft Delete Pattern**: User accounts are soft-deleted with `deletedAt` timestamp
- **Message Preservation**: Messages from deleted users are preserved with "Deleted User {ID}" display
- **PII Removal**: Email and sensitive data removed, but messages remain for historical context
- **Group Attribution**: Groups created by deleted users show "Deleted User {ID}" as creator

### 4. Soft-Deleted Groups
- **Access Control**: All members automatically set to "removed" role when group is soft-deleted
- **UI Indicators**: Clear warnings displayed for soft-deleted groups
- **Restoration**: Only super-admins can restore soft-deleted groups
- **Data Integrity**: Messages, invitations, memberships, and audit logs preserved during soft delete

### 5. Email Validation
- **RFC 5322 Compliance**: Basic email validation using regex pattern
- **Normalization**: All emails lowercased and trimmed before storage
- **Duplicate Prevention**: Backend checks prevent duplicate invitations

### 6. Authentication Edge Cases
- **OAuth Flow**: Proper error handling for failed OAuth attempts
- **Email Verification**: Auto-accepts pending invitations on email verification
- **2FA**: TOTP implementation with proper verification flow
- **Session Handling**: Convex Auth handles session management automatically

## Security Considerations

### 1. Permission Checks
- **Backend Validation**: All mutations validate user permissions before execution
- **Role-Based Access**: Groups have admin/editor/viewer/removed roles
- **Super-Admin Powers**: Separate `isSuperAdmin` flag for system administrators
- **Defensive Programming**: Never trust client-side permission checks alone

### 2. Data Protection
- **Soft Deletes**: PII removed but data preserved for audit trail
- **Hard Deletes**: Super-admin only, permanently removes all related data
- **Password Validation**: 12+ characters, letters, numbers, symbols required
- **Email Normalization**: Case-insensitive email handling

### 3. Rate Limiting (TODO for Production)
- **Login Attempts**: Consider implementing rate limiting on authentication endpoints
- **Invitation Sending**: Consider limiting invitations per group/user to prevent spam
- **Message Posting**: Consider rate limiting message creation
- **Implementation**: Use Convex's scheduled functions or external service like Cloudflare

## Email Configuration

### Resend Integration
The application supports Resend for sending invitation emails:

1. **Environment Variables**:
   ```bash
   RESEND_API_KEY=re_xxxxx
   FROM_EMAIL=noreply@yourdomain.com  # Optional, defaults to onboarding@resend.dev
   SITE_URL=https://yourdomain.com     # For invitation links
   ```

2. **Fallback Behavior**:
   - If `RESEND_API_KEY` not configured, emails logged to console (useful for development)
   - Production should always have valid Resend API key

3. **Email Verification**:
   - Domain must be verified in Resend dashboard
   - SPF/DKIM records configured for deliverability

## Database Indexes

The schema includes optimized indexes for common queries:

- **Groups**: `by_name`, `by_createdBy`
- **Memberships**: `by_user`, `by_group`, `by_group_user`, `by_group_role`
- **Messages**: `by_group`, `by_group_created`, `by_author`
- **Invitations**: `by_group`, `by_email`, `by_group_email`, `by_status`
- **Audit Logs**: `by_group`, `by_group_created`, `by_actor`

These indexes ensure fast queries even with large datasets.

## Performance Considerations

### 1. Pagination
- **Messages**: Implemented with `usePaginatedQuery` (20 items per page)
- **Audit Logs**: Implemented with `usePaginatedQuery` (50 items per page)
- **Future**: Consider paginating member lists for very large groups

### 2. Data Loading
- **Loading States**: Consistent loading indicators across all pages
- **Optimistic Updates**: Forms show loading state during mutations
- **Error Recovery**: All mutations handle errors gracefully

### 3. Real-Time Updates
- **Convex Subscriptions**: All data updates in real-time automatically
- **No Polling**: Convex uses WebSocket connections for live updates
- **Efficient**: Only changed data sent to clients

## Deployment Checklist

### Pre-Deployment
- [ ] Set up Convex production deployment
- [ ] Configure Resend API key and verify domain
- [ ] Configure Google OAuth credentials for production domain
- [ ] Set `SITE_URL` environment variable
- [ ] Review and set `FROM_EMAIL` for Resend
- [ ] Create at least one super-admin user (set `isSuperAdmin: true` directly in Convex dashboard)

### Post-Deployment
- [ ] Test authentication flow (email/password and Google OAuth)
- [ ] Test invitation email sending
- [ ] Test all group operations (create, invite, messages, etc.)
- [ ] Test admin panel functionality (restore/hard delete)
- [ ] Verify email deliverability
- [ ] Monitor Convex dashboard for errors

## Known Limitations

### 1. Password Changes
- Current implementation doesn't fully integrate with Convex Auth password provider
- `changePassword` mutation is a placeholder
- Consider implementing through Convex Auth's password reset flow

### 2. TOTP 2FA
- Current implementation uses simplified code validation
- Production should use proper TOTP library (e.g., `otpauth`, `speakeasy`)
- Consider backup codes for account recovery

### 3. Invitation Expiry
- Currently, invitations never expire
- Consider adding `expiresAt` field and cleanup job
- Spec deferred this to future considerations

### 4. Rate Limiting
- No built-in rate limiting on mutations
- Production should implement via Convex middleware or external service
- Particularly important for: login, invitation sending, message posting

## Monitoring Recommendations

### Key Metrics to Track
1. **Authentication**: Failed login attempts, OAuth errors
2. **Invitations**: Send success rate, acceptance rate
3. **Messages**: Post frequency, error rate
4. **Performance**: Query latency, mutation duration
5. **Errors**: Failed mutations, validation errors

### Convex Dashboard
- Monitor function execution logs
- Watch for repeated errors
- Track database query performance
- Monitor storage usage

## Support & Maintenance

### Regular Tasks
1. **Monitor Audit Logs**: Review admin actions for suspicious activity
2. **Clean Up Soft-Deleted Data**: Periodically hard delete old soft-deleted entities
3. **Email Deliverability**: Monitor bounce rates and spam reports
4. **User Feedback**: Collect and address usability issues

### Backup & Recovery
- Convex provides automatic backups
- Export data periodically for additional safety
- Test restoration procedures

## Future Enhancements

See `/specs/v1.md` section 14 for deferred features:
- Session management (view/revoke active sessions)
- Invitation expiry and self-request to join
- Message edit/delete functionality
- Enhanced admin dashboard with analytics
- Sub-groups / nested hierarchy
- Passkey support

---

**Last Updated**: January 2026
**Spec Version**: v1.0
