# Testing Checklist - Edit Rekening Koran

## 🧪 Manual Testing Checklist

### Pre-requisites
- [ ] Backend server running
- [ ] Frontend dev server running
- [ ] Database seeded with test data
- [ ] User logged in with proper permissions

---

## 1️⃣ Basic Functionality Tests

### Test 1.1: Open Edit Modal
- [ ] Navigate to Rekening Koran page
- [ ] Click "Ubah" button on any row
- [ ] Modal opens successfully
- [ ] All fields are populated with correct data
- [ ] Read-only fields are disabled (uraian, rek_dari, nama_dari, bank, debit, kredit)
- [ ] Editable fields are enabled (tgl_rc, no_rc, akunls_id, klarif_layanan, klarif_lain)

**Expected Result:** Modal opens with pre-filled data

---

### Test 1.2: Dropdown Akun Klarifikasi (Kredit > 0)
- [ ] Select rekening koran with `kredit > 0`
- [ ] Click "Ubah"
- [ ] Check dropdown "Klarifikasi Langsung"
- [ ] Verify only akun with `akun_kode LIKE '1%'` are shown
- [ ] Search functionality works in dropdown

**Expected Result:** Dropdown shows correct akun options for kredit

---

### Test 1.3: Dropdown Akun Klarifikasi (Debit > 0)
- [ ] Select rekening koran with `debit > 0`
- [ ] Click "Ubah"
- [ ] Check dropdown "Klarifikasi Langsung"
- [ ] Verify akun with `NOT akun_kode LIKE '1%' OR akun_kode LIKE '103%'` are shown
- [ ] Search functionality works in dropdown

**Expected Result:** Dropdown shows correct akun options for debit

---

### Test 1.4: Real-time Total Calculation
- [ ] Open edit modal
- [ ] Change "Klarifikasi Layanan" value
- [ ] Observe "Total Klarifikasi" updates automatically
- [ ] Change "Klarifikasi Lain" value
- [ ] Observe "Total Klarifikasi" updates automatically
- [ ] Verify calculation: Total = Layanan + Lain

**Expected Result:** Total klarifikasi calculated in real-time

---

### Test 1.5: Successful Update
- [ ] Open edit modal
- [ ] Modify tgl_rc
- [ ] Modify no_rc
- [ ] Select different akunls_id
- [ ] Change klarif_layanan
- [ ] Change klarif_lain
- [ ] Ensure total ≤ nominal
- [ ] Click "Simpan"
- [ ] Success toast appears
- [ ] Modal closes
- [ ] Table refreshes with updated data

**Expected Result:** Data updated successfully

---

## 2️⃣ Validation Tests

### Test 2.1: Required Field - Tgl RC
- [ ] Open edit modal
- [ ] Clear "Tgl. RC" field
- [ ] Click "Simpan"
- [ ] Error message appears: "Tanggal RC harus diisi"
- [ ] Field highlighted as invalid

**Expected Result:** Validation error shown

---

### Test 2.2: Required Field - No RC
- [ ] Open edit modal
- [ ] Clear "No. RC" field
- [ ] Click "Simpan"
- [ ] Error message appears: "No. RC harus diisi"
- [ ] Field highlighted as invalid

**Expected Result:** Validation error shown

---

### Test 2.3: Required Field - Klarifikasi Langsung
- [ ] Open edit modal
- [ ] Clear "Klarifikasi Langsung" dropdown
- [ ] Click "Simpan"
- [ ] Error message appears: "Klarifikasi Langsung harus dipilih"
- [ ] Field highlighted as invalid

**Expected Result:** Validation error shown

---

### Test 2.4: Negative Value - Klarifikasi Layanan
- [ ] Open edit modal
- [ ] Enter negative value in "Klarifikasi Layanan"
- [ ] Click "Simpan"
- [ ] Error message appears: "Klarifikasi Layanan tidak boleh negatif"

**Expected Result:** Validation error shown

---

### Test 2.5: Negative Value - Klarifikasi Lain
- [ ] Open edit modal
- [ ] Enter negative value in "Klarifikasi Lain"
- [ ] Click "Simpan"
- [ ] Error message appears: "Klarifikasi Lain tidak boleh negatif"

**Expected Result:** Validation error shown

---

### Test 2.6: Total Exceeds Nominal
- [ ] Open edit modal with kredit = 100,000
- [ ] Set klarif_layanan = 80,000
- [ ] Set klarif_lain = 30,000 (total = 110,000)
- [ ] Observe warning message: "Total klarifikasi melebihi nominal kredit"
- [ ] "Simpan" button disabled
- [ ] Try to click "Simpan"
- [ ] Error toast appears

**Expected Result:** Cannot save when total > nominal

---

## 3️⃣ Business Logic Tests

### Test 3.1: Cannot Edit Locked Data
- [ ] Find rekening koran with `kunci = true`
- [ ] Click "Ubah"
- [ ] Modal opens (or doesn't - check implementation)
- [ ] Try to save
- [ ] Error response: "Data sudah terkunci dan tidak dapat diubah"
- [ ] HTTP status: 403 Forbidden

**Expected Result:** Cannot edit locked data

---

### Test 3.2: Cannot Edit Data in BKU
- [ ] Find rekening koran with `bku_id IS NOT NULL`
- [ ] Click "Ubah"
- [ ] Modal opens (or doesn't - check implementation)
- [ ] Try to save
- [ ] Error response: "Data sudah masuk BKU dan tidak dapat diubah"
- [ ] HTTP status: 403 Forbidden

**Expected Result:** Cannot edit data already in BKU

---

### Test 3.3: Audit Trail
- [ ] Edit a rekening koran successfully
- [ ] Check database: `data_rekening_koran` table
- [ ] Verify `is_web_change` = true for edited record
- [ ] Verify updated fields match input

**Expected Result:** Audit flag set correctly

---

## 4️⃣ UI/UX Tests

### Test 4.1: Loading States
- [ ] Open edit modal
- [ ] Observe loading spinner while data loads
- [ ] Observe loading state on dropdown while fetching akun
- [ ] Click "Simpan"
- [ ] Observe loading state on button
- [ ] Button disabled during save

**Expected Result:** Proper loading indicators shown

---

### Test 4.2: Error Handling
- [ ] Disconnect internet
- [ ] Try to open edit modal
- [ ] Error toast appears
- [ ] Reconnect internet
- [ ] Try to save with invalid data
- [ ] Backend validation errors displayed correctly
- [ ] Multiple errors shown if multiple fields invalid

**Expected Result:** Errors handled gracefully

---

### Test 4.3: Modal Close Behavior
- [ ] Open edit modal
- [ ] Click "Batal" button
- [ ] Modal closes
- [ ] Open modal again
- [ ] Click outside modal (overlay)
- [ ] Modal closes
- [ ] Open modal again
- [ ] Press ESC key
- [ ] Modal closes

**Expected Result:** Modal closes properly

---

### Test 4.4: Currency Formatting
- [ ] Open edit modal
- [ ] Check "Debit" field format: Rp 100.000
- [ ] Check "Kredit" field format: Rp 100.000
- [ ] Enter value in "Klarifikasi Layanan"
- [ ] Verify formatted as currency
- [ ] Check "Total Klarifikasi" format

**Expected Result:** All currency fields properly formatted

---

## 5️⃣ Integration Tests

### Test 5.1: Data Consistency
- [ ] Edit rekening koran
- [ ] Save successfully
- [ ] Refresh page
- [ ] Verify data persists
- [ ] Open edit modal again
- [ ] Verify all fields show updated values

**Expected Result:** Data consistent across sessions

---

### Test 5.2: Table Refresh
- [ ] Edit rekening koran
- [ ] Save successfully
- [ ] Verify table row updates immediately
- [ ] Check "Klarifikasi Langsung" column shows new value
- [ ] Check "Terklarifikasi" column updates
- [ ] Check "Belum Terklarifikasi" column updates

**Expected Result:** Table reflects changes immediately

---

## 6️⃣ API Tests

### Test 6.1: Update Endpoint
```bash
curl -X PUT http://localhost:8000/api/rekening_koran/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "tgl_rc": "2025-10-01",
    "no_rc": "RC001",
    "akunls_id": 5,
    "klarif_layanan": 100000,
    "klarif_lain": 50000
  }'
```
- [ ] Response 200 with success message
- [ ] Data updated in database

---

### Test 6.2: Master Akun Endpoint (Kredit)
```bash
curl -X GET "http://localhost:8000/api/master_akun/klarifikasi?type=kredit" \
  -H "Authorization: Bearer {token}"
```
- [ ] Response 200 with akun list
- [ ] All akun have `akun_kode LIKE '1%'`

---

### Test 6.3: Master Akun Endpoint (Debit)
```bash
curl -X GET "http://localhost:8000/api/master_akun/klarifikasi?type=debit" \
  -H "Authorization: Bearer {token}"
```
- [ ] Response 200 with akun list
- [ ] All akun have `NOT akun_kode LIKE '1%' OR akun_kode LIKE '103%'`

---

## 7️⃣ Edge Cases

### Test 7.1: Zero Values
- [ ] Set klarif_layanan = 0
- [ ] Set klarif_lain = 0
- [ ] Save successfully
- [ ] Verify accepted

**Expected Result:** Zero values allowed

---

### Test 7.2: Maximum Values
- [ ] Set klarif_layanan = nominal (exact match)
- [ ] Set klarif_lain = 0
- [ ] Save successfully
- [ ] Set klarif_layanan = 0
- [ ] Set klarif_lain = nominal (exact match)
- [ ] Save successfully

**Expected Result:** Can use full nominal

---

### Test 7.3: Special Characters in No RC
- [ ] Enter special characters in "No. RC": RC-001/2025
- [ ] Save
- [ ] Verify accepted or rejected based on validation

**Expected Result:** Behavior consistent with validation rules

---

### Test 7.4: Very Long Strings
- [ ] Enter 300 characters in "No. RC"
- [ ] Try to save
- [ ] Error: "No. RC maksimal 255 karakter"

**Expected Result:** Max length validation works

---

## 8️⃣ Performance Tests

### Test 8.1: Large Dropdown
- [ ] Database has 1000+ master akun records
- [ ] Open edit modal
- [ ] Dropdown loads within 2 seconds
- [ ] Search in dropdown is responsive
- [ ] Scrolling is smooth

**Expected Result:** Performs well with large dataset

---

### Test 8.2: Concurrent Edits
- [ ] User A opens edit modal for record X
- [ ] User B opens edit modal for same record X
- [ ] User A saves changes
- [ ] User B saves changes
- [ ] Verify last save wins (or implement locking)

**Expected Result:** Concurrent edits handled

---

## ✅ Test Summary

### Critical Tests (Must Pass):
- [ ] Test 1.5: Successful Update
- [ ] Test 2.6: Total Exceeds Nominal
- [ ] Test 3.1: Cannot Edit Locked Data
- [ ] Test 3.2: Cannot Edit Data in BKU
- [ ] Test 5.2: Table Refresh

### High Priority Tests:
- [ ] Test 1.2: Dropdown Akun (Kredit)
- [ ] Test 1.3: Dropdown Akun (Debit)
- [ ] Test 1.4: Real-time Calculation
- [ ] All validation tests (2.1 - 2.5)

### Medium Priority Tests:
- [ ] All UI/UX tests
- [ ] Integration tests
- [ ] API tests

### Low Priority Tests:
- [ ] Edge cases
- [ ] Performance tests

---

## 📊 Test Results Template

```
Date: __________
Tester: __________
Environment: Development / Staging / Production

Total Tests: ___
Passed: ___
Failed: ___
Skipped: ___

Failed Tests:
1. _______________
2. _______________

Notes:
_______________
_______________
```

---

## 🐛 Bug Report Template

```
Title: _______________
Severity: Critical / High / Medium / Low
Steps to Reproduce:
1. _______________
2. _______________
3. _______________

Expected Result: _______________
Actual Result: _______________
Screenshots: _______________
Browser/Environment: _______________
```
