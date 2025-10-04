# ExplorerX Testing Guide

This document outlines the testing procedures for ExplorerX plugin before release.

## Test Environment Setup

### Requirements
- Unraid 7.2.0-rc.1 or later
- Test data directories with various file types
- Minimum 10GB free space for testing large file operations

### Setup Test Environment

```bash
# Create test directory structure
mkdir -p /mnt/user/explorerx-test/{empty,small,large,nested/deep/structure}

# Create test files
dd if=/dev/urandom of=/mnt/user/explorerx-test/small/file1.bin bs=1M count=10
dd if=/dev/urandom of=/mnt/user/explorerx-test/large/file2.bin bs=100M count=5

# Create many small files for stress test
for i in {1..1000}; do
  echo "Test file $i" > /mnt/user/explorerx-test/small/test_$i.txt
done
```

## Functional Test Cases

### 1. Installation Tests

**Test 1.1: Plugin Installation**
- [ ] Install plugin via URL
- [ ] Verify plugin appears in Plugins page
- [ ] Verify plugin appears in Tools menu
- [ ] Check `/usr/local/emhttp/plugins/explorerx/` directory exists
- [ ] Check config file created at `/boot/config/plugins/explorerx/settings.cfg`

**Test 1.2: Post-Installation Verification**
- [ ] Access plugin page from Tools menu
- [ ] Verify no PHP errors in nginx log
- [ ] Verify no JavaScript console errors
- [ ] Check default configuration loaded correctly

### 2. Navigation Tests

**Test 2.1: Basic Navigation**
- [ ] Load default directory (`/mnt`)
- [ ] Click into subdirectory
- [ ] Use breadcrumb to navigate back
- [ ] Navigate to root via breadcrumb home icon
- [ ] Navigate using quick links

**Test 2.2: Dual Pane Navigation**
- [ ] Toggle dual pane mode
- [ ] Navigate independently in each pane
- [ ] Switch active pane
- [ ] Close dual pane mode

**Test 2.3: Breadcrumb Navigation**
- [ ] Click each breadcrumb segment
- [ ] Verify correct navigation
- [ ] Test with deep directory structure (10+ levels)

### 3. File Listing Tests

**Test 3.1: Display Tests**
- [ ] List empty directory
- [ ] List directory with files
- [ ] List directory with mixed files and folders
- [ ] List directory with 1000+ files (performance)
- [ ] List directory with 20000+ files (stress test)

**Test 3.2: Sorting Tests**
- [ ] Sort by name (ascending/descending)
- [ ] Sort by size (ascending/descending)
- [ ] Sort by modified date (ascending/descending)
- [ ] Verify directories always listed first

**Test 3.3: Icon Display**
- [ ] Verify folder icons
- [ ] Verify file type icons (images, videos, archives, documents)
- [ ] Verify default file icon for unknown types

### 4. Selection Tests

**Test 4.1: Single Selection**
- [ ] Click checkbox to select file
- [ ] Click checkbox to deselect file
- [ ] Verify selection count in status bar

**Test 4.2: Multi-Selection**
- [ ] Select multiple files individually
- [ ] Use "Select All" checkbox
- [ ] Deselect individual items from multi-selection
- [ ] Clear all selections

**Test 4.3: Keyboard Selection (if applicable)**
- [ ] Ctrl+A to select all
- [ ] Ctrl+Click to toggle selection
- [ ] Shift+Click for range selection

### 5. File Operation Tests

**Test 5.1: Create Directory**
- [ ] Create new directory
- [ ] Verify directory appears in listing
- [ ] Try creating duplicate directory (should fail)
- [ ] Try creating directory with invalid characters

**Test 5.2: Rename**
- [ ] Rename file
- [ ] Rename directory
- [ ] Try renaming to existing name (should fail)
- [ ] Try renaming with path traversal `../test` (should fail)

**Test 5.3: Delete**
- [ ] Delete single file
- [ ] Delete single directory
- [ ] Delete multiple files
- [ ] Delete with confirmation dialog
- [ ] Try deleting protected paths (should fail)

**Test 5.4: Copy**
- [ ] Copy single file
- [ ] Copy single directory (recursive)
- [ ] Copy multiple files
- [ ] Copy to same directory (should handle naming)
- [ ] Copy large file (1GB+)

**Test 5.5: Move**
- [ ] Move single file
- [ ] Move single directory
- [ ] Move multiple files
- [ ] Move across different mount points

**Test 5.6: Upload**
- [ ] Upload single small file (<1MB)
- [ ] Upload single large file (100MB+)
- [ ] Upload multiple files simultaneously
- [ ] Verify upload progress (if implemented)
- [ ] Test file size limits

**Test 5.7: Download**
- [ ] Download single file
- [ ] Download multiple files (as ZIP if implemented)
- [ ] Verify correct MIME types
- [ ] Verify filename preservation

### 6. Advanced Feature Tests

**Test 6.1: ZIP Operations**
- [ ] Create ZIP from single file
- [ ] Create ZIP from directory
- [ ] Create ZIP from multiple selections
- [ ] Extract ZIP file
- [ ] Verify ZIP contents

**Test 6.2: Checksum**
- [ ] Calculate MD5 checksum
- [ ] Calculate SHA256 checksum
- [ ] Verify checksum accuracy
- [ ] Test on large file (1GB+)

**Test 6.3: Search**
- [ ] Search by filename
- [ ] Verify case-insensitive search
- [ ] Search with special characters
- [ ] Search in large directory

### 7. Security Tests

**Test 7.1: CSRF Protection**
- [ ] Verify CSRF token present in page
- [ ] Try operation without CSRF token (should fail)
- [ ] Try operation with invalid CSRF token (should fail)

**Test 7.2: Path Traversal Protection**
- [ ] Try accessing `/etc/passwd` (should fail)
- [ ] Try using `../../../` in paths (should fail)
- [ ] Try accessing `/boot` outside root (should fail)
- [ ] Verify operations restricted to `/mnt`

**Test 7.3: File Upload Security**
- [ ] Upload file with dangerous extension (.php, .sh)
- [ ] Verify file stored safely
- [ ] Try uploading oversized file (should fail gracefully)

**Test 7.4: Session Validation**
- [ ] Verify operations require valid session
- [ ] Test behavior with expired session

### 8. UI/UX Tests

**Test 8.1: Responsive Design**
- [ ] Test at 1920x1080 (desktop)
- [ ] Test at 1366x768 (laptop)
- [ ] Test at 768x1024 (tablet)
- [ ] Test at 375x667 (mobile)

**Test 8.2: Keyboard Shortcuts**
- [ ] Ctrl+A (Select All)
- [ ] Ctrl+C (Copy)
- [ ] Ctrl+X (Cut)
- [ ] Ctrl+V (Paste)
- [ ] Delete key
- [ ] Ctrl+N (New Folder)
- [ ] F2 (Rename)
- [ ] Ctrl+F (Search)
- [ ] Backspace (Parent Directory)
- [ ] Ctrl+P (Dual Pane)
- [ ] F5 (Refresh)

**Test 8.3: Context Menu**
- [ ] Right-click on file
- [ ] Right-click on directory
- [ ] Right-click on multiple selections
- [ ] Verify all menu items functional

### 9. Performance Tests

**Test 9.1: Load Times**
- [ ] Measure time to list 1,000 files
- [ ] Measure time to list 20,000 files
- [ ] Verify acceptable performance (<2s for 20k files)

**Test 9.2: Large File Operations**
- [ ] Copy 5GB file (monitor progress)
- [ ] Move 5GB file
- [ ] Delete 5GB file
- [ ] Verify non-blocking UI during operations

**Test 9.3: Concurrent Operations**
- [ ] Start multiple copy operations
- [ ] Verify queue management
- [ ] Test operation cancellation

### 10. Error Handling Tests

**Test 10.1: Network Errors**
- [ ] Simulate network failure during operation
- [ ] Verify graceful error message
- [ ] Verify state recovery

**Test 10.2: Permission Errors**
- [ ] Try operating on read-only file
- [ ] Try creating file in read-only directory
- [ ] Verify appropriate error messages

**Test 10.3: Edge Cases**
- [ ] Very long filename (255 characters)
- [ ] Filename with special characters
- [ ] Empty filename (should fail)
- [ ] Spaces in filenames
- [ ] Unicode characters in filenames

### 11. Background Queue Tests

**Test 11.1: Queue Management**
- [ ] Add task to queue
- [ ] View active tasks
- [ ] Monitor task progress
- [ ] Cancel running task

**Test 11.2: Concurrent Tasks**
- [ ] Run multiple tasks simultaneously
- [ ] Verify MAX_CONCURRENT_TASKS limit respected
- [ ] Test queue ordering

## Regression Tests

Run these tests after any code changes:

1. [ ] Basic navigation still works
2. [ ] File operations execute correctly
3. [ ] Security protections still in place
4. [ ] No new console errors
5. [ ] Performance hasn't degraded

## Browser Compatibility

Test in the following browsers:

- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Integration Tests

**Test with Unraid System:**
- [ ] Verify correct share paths (`/mnt/user/*`)
- [ ] Test with cache drives
- [ ] Test with array disks
- [ ] Test with unmounted disks (graceful handling)

## Load Testing

```bash
# Generate large dataset
for i in {1..20000}; do
  dd if=/dev/urandom of=/mnt/user/explorerx-test/stress/file_$i.bin bs=1k count=100
done

# Test directory listing performance
time curl "http://tower/plugins/explorerx/include/api.php" \
  -H "X-CSRF-Token: TOKEN" \
  -d '{"action":"list","path":"/mnt/user/explorerx-test/stress"}'
```

## Pre-Release Checklist

Before releasing a new version:

- [ ] All critical tests passing
- [ ] No known security vulnerabilities
- [ ] Documentation up to date
- [ ] CHANGELOG.md updated
- [ ] Version number incremented
- [ ] Package MD5 calculated
- [ ] GitHub release created
- [ ] Installation tested from URL

## Bug Reporting Template

When reporting bugs during testing:

```
**Bug Description:**
[Clear description]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Environment:**
- Unraid Version:
- ExplorerX Version:
- Browser:

**Logs:**
[Relevant logs from /var/log/explorerx/]

**Screenshots:**
[If applicable]
```

## Performance Benchmarks

Target performance metrics:

| Operation | Target Time | Notes |
|-----------|-------------|-------|
| List 1k files | < 100ms | Initial load |
| List 20k files | < 1s | Large directory |
| Copy 100MB file | ~ network speed | Background |
| Delete 1k files | < 5s | Bulk operation |
| Create ZIP (1GB) | < 20s | CPU dependent |
| Search 10k files | < 500ms | String match |

---

**Test Status Legend:**
- ✅ Pass
- ❌ Fail
- ⚠️ Warning/Issue
- 🔄 In Progress
- ⏭️ Skipped

**Last Updated:** 2025-10-04
