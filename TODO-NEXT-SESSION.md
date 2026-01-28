# Next Session TODO

## 5. CRM Sync
- Schema has `CrmAppointment` and `CrmLead` models but no sync logic
- Need to integrate with the clinic's CRM system
- Create sync endpoints and scheduled jobs to pull appointment/lead data
- Map UTM sources to marketing campaigns for attribution

## 6. Reddit Monitoring
- Cron routes exist at `/api/cron/reddit` (monitor every 15min, digest daily at 8am)
- Need real Reddit API credentials (REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, etc.)
- AI analysis pipeline with Anthropic API for lead scoring
- RedditMonitorConfig, RedditPost, RedditNotificationConfig models ready

## 7. Email Notifications
- `resend` package installed but not configured
- Need RESEND_API_KEY and verified domain
- Use cases: task assignments, proposal approvals, budget alerts, daily digests
- Integrate with UserAlert system for email delivery

## 8. E2E Tests
- Currently only 66 unit tests for tRPC routers (user, task, alerts)
- Add Playwright or Cypress for end-to-end testing
- Key flows: login, create task, submit proposal, upload asset, manage calendar

## 9. Performance Tuning
- Database indexes defined in schema but query performance under load untested
- Consider connection pooling optimization (PgBouncer settings)
- Add React Query cache tuning for heavy pages (analytics, calendar)
- Monitor Vercel function cold starts

## 10. PWA Support
- Add service worker for offline capabilities
- Cache critical assets for mobile staff in the field
- Push notifications via web push API
- Add manifest.json for install-to-homescreen
