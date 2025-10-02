# Implementasi Fitur PB (Pindah Buku) Rekening Koran

## Overview
Fitur PB Rekening Koran memungkinkan pengguna untuk menandai mutasi kredit Bank Jatim sebagai hasil PB dari bank lainnya dan menautkan mutasi dari bank lain ke mutasi Bank Jatim.

## Business Rules
PB hanya dapat dilakukan jika memenuhi kriteria:
- `kredit > 0`
- `akun_id is null`
- `akunls_id is null`
- `bku_id is null`

## Backend Implementation

### API Endpoints

#### 1. Get PB Data
```
GET /rekening_koran/pb/check/{rc_id}
```
**Response:**
```json
{
  "data": {
    "rc_id": "...",
    "no_rc": "...",
    "tgl_rc": "...",
    "uraian": "...",
    "bank": "JATIM",
    "kredit": 1000000,
    "mutasi": true,
    "pb_dari": "BCA"
  },
  "linked_records": [...]
}
```

#### 2. Get Unlinked Records
```
GET /rekening_koran/pb/uncheck?tgl_rc=2024-01-01&page=1&per_page=10
```
**Response:** Paginated list of unlinked mutations (bank != JATIM, pb is null)

#### 3. Update PB Data
```
PUT /rekening_koran/pb/{rc_id}
```
**Request Body:**
```json
{
  "mutasi": true,
  "pb_dari": "BCA"
}
```

#### 4. Link Mutation to Bank Jatim
```
PUT /rekening_koran/pb_link/{rc_id}
```
**Request Body:**
```json
{
  "pb_rc_id": "rc_id_bank_jatim"
}
```

#### 5. Cancel PB Link
```
PUT /rekening_koran/pb_cancel/{rc_id}
```
Sets `pb` field to null for the specified record.

### Controller Methods
File: `/app/Http/Controllers/RekeningKoranController.php`

- `pbUncheck(Request $request)` - Get unlinked mutations
- `pbCheck(Request $request, string $id)` - Get PB data with linked records
- `updatePb(Request $request, string $id)` - Update mutasi and pb_dari
- `updatePbCancel(Request $request, string $id)` - Cancel PB link
- `linkPb(Request $request, string $id)` - Link mutation to Bank Jatim

### Routes
File: `/routes/api.php`

```php
Route::get('rekening_koran/pb/uncheck', [RekeningKoranController::class, 'pbUncheck']);
Route::get('rekening_koran/pb/check/{rc_id}', [RekeningKoranController::class, 'pbCheck']);
Route::put('rekening_koran/pb/{id}', [RekeningKoranController::class, 'updatePb']);
Route::put('rekening_koran/pb_cancel/{id}', [RekeningKoranController::class, 'updatePbCancel']);
Route::put('rekening_koran/pb_link/{id}', [RekeningKoranController::class, 'linkPb']);
```

## Frontend Implementation

### Composable
File: `/src/composables/useRekeningKoranPb.js`

**Exported Functions:**
- `getPbData(rcId)` - Fetch PB data and linked records
- `getUnlinkedRecords(tglRc, page, perPage)` - Fetch unlinked mutations
- `updatePb(rcId, data)` - Update mutasi and pb_dari
- `linkPb(rcId, pbRcId)` - Link mutation to Bank Jatim
- `cancelPb(rcId)` - Cancel PB link

**Reactive State:**
- `loading` - Loading state
- `pbData` - Current PB data
- `linkedRecords` - Array of linked mutations
- `unlinkedRecords` - Array of unlinked mutations
- `unlinkedTotal`, `unlinkedPage`, `unlinkedPerPage` - Pagination state

### Component
File: `/src/components/pendapatan/rekeningKoran/PbRekeningKoran.vue`

**Props:**
- `modelValue` (Boolean) - Dialog visibility
- `item` (Object) - Selected Bank Jatim record

**Events:**
- `update:modelValue` - Update dialog visibility
- `saved` - Emitted after successful save

**Features:**

#### Tab 1: Ubah ID Transaksi
Form untuk mengubah data PB:
- No. RC (readonly)
- Tgl. RC (readonly)
- Uraian (readonly)
- Bank (readonly)
- Kredit (readonly)
- Mutasi (editable checkbox)
- PB dari Bank (editable dropdown, excludes JATIM)

#### Tab 2: Mutasi bank yang dimasukkan
DataTable menampilkan mutasi yang sudah ditautkan:
- Query: `SELECT * FROM data_rekening_koran WHERE pb = [current rc_id]`
- Action: **Batalkan** - Membatalkan penandaan (set pb = null)

#### Tab 3: Mutasi bank yang belum dimasukkan
DataTable menampilkan mutasi yang belum ditautkan:
- Query: `SELECT * FROM data_rekening_koran WHERE pb IS NULL AND bank <> 'JATIM' AND tgl_rc <= [tgl_rc]`
- Action: **Daftarkan** - Menautkan mutasi (set pb = [rc_id Bank Jatim])
- Pagination: Lazy loading with server-side pagination

### Integration
File: `/src/components/pendapatan/rekeningKoran/DataRekeningKoran.vue`

**Changes:**
1. Import PbRekeningKoran component
2. Add `modalPb` ref
3. Add `canShowPB()` function for business rule validation
4. Update `handlePB()` function to open modal
5. Add PB modal to template
6. Set `visible` property on PB menu item in SplitButton

**Business Rule Check (canShowPB):**
```javascript
function canShowPB(item) {
  // Check business rules for PB visibility
  return (
    item.kredit > 0 &&
    item.akun_id === null &&
    item.akunls_id === null &&
    item.bku_id === null
  )
}
```

**Menu Item Configuration:**
```javascript
{
  label: 'PB',
  icon: 'pi pi-check',
  visible: () => canShowPB(slotProps.data), // Only show if business rules met
  command: () => handlePB(slotProps.data),
}
```

## Database Schema
Table: `data_rekening_koran`

**Relevant Fields:**
- `rc_id` (PK) - Record ID
- `no_rc` - Nomor rekening koran
- `tgl_rc` - Tanggal rekening koran
- `uraian` - Uraian/description
- `bank` - Bank name
- `kredit` - Kredit amount
- `debit` - Debit amount
- `mutasi` - Boolean flag
- `pb` - Foreign key to rc_id (self-referencing)
- `pb_dari` - Bank name where PB originated from
- `akun_id` - Akun ID (must be null for PB)
- `akunls_id` - Akun LS ID (must be null for PB)
- `bku_id` - BKU ID (must be null for PB)

## User Flow

1. User views data rekening koran list
2. **PB** menu item only appears in action dropdown if record meets business rules:
   - kredit > 0
   - akun_id is null
   - akunls_id is null
   - bku_id is null
3. User clicks **PB** action button
4. Modal opens with 3 tabs
5. **Tab 1**: User can update Mutasi checkbox and PB dari Bank dropdown
6. **Tab 2**: User can see and cancel linked mutations
7. **Tab 3**: User can see and link unlinked mutations
8. User clicks **Simpan** to save changes
9. System updates the database and refreshes the data

## Testing Checklist

- [ ] PB menu item only visible for records that meet business rules (kredit > 0, akun_id/akunls_id/bku_id null)
- [ ] PB menu item invisible for records that don't meet business rules
- [ ] Clicking PB opens modal without validation warnings
- [ ] Tab 1 displays correct data and allows editing mutasi and pb_dari
- [ ] Tab 2 shows linked records correctly
- [ ] Batalkan action in Tab 2 works and refreshes data
- [ ] Tab 3 shows unlinked records with tgl_rc <= current record's tgl_rc
- [ ] Daftarkan action in Tab 3 works and refreshes data
- [ ] Pagination in Tab 3 works correctly
- [ ] Save button updates mutasi and pb_dari fields
- [ ] All API endpoints return proper error messages
- [ ] Toast notifications display correctly

## Notes

- Bank dropdown excludes JATIM as per business rules
- Unlinked records are filtered by tgl_rc to show only records before or on the same date as the Bank Jatim record
- All mutations are ordered by tgl_rc DESC, no_rc ASC
- The feature uses lazy loading for unlinked records to handle large datasets efficiently
