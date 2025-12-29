# Security Documentation

## Security Measures Implemented

This document outlines the comprehensive security hardening applied to the One Tiny Thing Electron application.

### 1. Electron Security Best Practices

#### ✅ Core Security Settings
- **Node Integration**: Disabled (`nodeIntegration: false`)
- **Context Isolation**: Enabled (`contextIsolation: true`)
- **Remote Module**: Disabled (`enableRemoteModule: false`)
- **Sandbox Mode**: Enabled (`sandbox: true`)
- **Webview Tag**: Disabled (`webviewTag: false`)
- **Insecure Content**: Blocked (`allowRunningInsecureContent: false`)
- **Experimental Features**: Disabled (`experimentalFeatures: false`)

#### ✅ IPC Security
- **Input Validation**: All IPC messages validated before processing
- **Rate Limiting**: 10 calls/second limit per IPC channel
- **Type Checking**: Strict type validation for all data structures
- **Size Limits**: Maximum string lengths enforced (name: 100 chars, task: 500 chars)
- **Format Validation**: Regex validation for time formats and date formats

### 2. Content Security Policy (CSP)

#### Production CSP
```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self' data:;
connect-src 'self';
```

#### Development CSP (Relaxed for Hot Reload)
```
default-src 'self' 'unsafe-inline' 'unsafe-eval' localhost:* ws://localhost:*;
img-src 'self' data: blob:;
```

### 3. Navigation & Window Security

#### ✅ Navigation Protection
- External navigation blocked
- Only localhost (dev) and file:// protocols allowed
- All navigation attempts logged

#### ✅ Window Creation Prevention
- `setWindowOpenHandler` blocks all new windows
- Pop-ups and external links denied
- Target="_blank" attacks prevented

#### ✅ Web Request Filtering
- External HTTP/HTTPS requests blocked in production
- Only localhost allowed in development
- Suspicious requests logged and denied

### 4. File System Security

#### ✅ Path Traversal Prevention
- All file paths validated and sanitized
- Path normalization and resolution
- Restricted to userData directory only
- Directory traversal attacks blocked

#### ✅ Atomic File Writes
- Temp file + rename pattern for data integrity
- File permissions set to 0o600 (owner read/write only)
- Prevents race conditions and corruption

#### ✅ Data Validation
- All data validated before file write
- JSON parsing with error handling
- Malformed data rejected

### 5. Permission Management

#### ✅ Allowed Permissions
- **Notifications**: ✅ Allowed (core feature)
- **All Others**: ❌ Denied

#### ✅ Permission Handlers
- `setPermissionRequestHandler`: Whitelist approach
- `setPermissionCheckHandler`: Double verification
- Denied permissions logged

### 6. Security Headers

All responses include:
- `Content-Security-Policy`: Strict CSP
- `X-Content-Type-Options: nosniff`: MIME sniffing prevention
- `X-Frame-Options: DENY`: Clickjacking prevention
- `X-XSS-Protection: 1; mode=block`: XSS protection

### 7. Download Protection

- All downloads blocked via `will-download` handler
- Prevents drive-by downloads
- Download attempts logged

### 8. Data Validation Rules

#### User Settings
- `name`: String, max 100 characters
- `dayStart`: String, format `HH:MM`
- `dayEnd`: String, format `HH:MM`
- `notifications.enableReminders`: Boolean only
- `notifications.enableCheckIns`: Boolean only

#### Day Entries
- Date key: Format `YYYY-MM-DD` only
- `task`: String, max 500 characters
- `startedAt`: Number (timestamp)
- `shipped`: Boolean only

### 9. Rate Limiting

- **Limit**: 10 IPC calls per second per channel
- **Window**: 1 second sliding window
- **Channels**: All IPC channels rate-limited
- **Overflow**: Rejected with warning log

### 10. Development vs Production

#### Development
- CSP relaxed for hot reload
- Localhost connections allowed
- DevTools enabled
- External requests to localhost allowed

#### Production
- Strict CSP enforced
- Only file:// protocol
- DevTools disabled
- All external requests blocked

## Security Considerations

### ✅ Implemented
1. Context isolation with secure IPC bridge
2. Input validation on all IPC messages
3. Rate limiting on IPC calls
4. CSP headers
5. Navigation restrictions
6. Permission controls
7. File system security
8. Path traversal prevention
9. Atomic file writes
10. Security headers

### ⚠️ Recommendations

1. **Future Enhancement**: Consider encrypting sensitive data at rest
2. **Code Signing**: Sign the application for distribution
3. **Auto-Updates**: Implement secure auto-update mechanism (electron-updater)
4. **Logging**: Consider adding structured security logging
5. **Monitoring**: Monitor for suspicious patterns in production

## Reporting Security Issues

If you discover a security vulnerability, please email security@[domain].com

## Security Checklist

- [x] Node integration disabled
- [x] Context isolation enabled
- [x] Remote module disabled
- [x] Sandbox enabled
- [x] Webview tag disabled
- [x] CSP headers configured
- [x] Navigation restricted
- [x] Window creation blocked
- [x] IPC input validation
- [x] Rate limiting implemented
- [x] Permission controls
- [x] File system hardening
- [x] Security headers
- [x] Download blocking
- [x] Path traversal prevention

## References

- [Electron Security Checklist](https://www.electronjs.org/docs/latest/tutorial/security)
- [OWASP Electron Security](https://owasp.org/www-community/vulnerabilities/Electron_Security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
