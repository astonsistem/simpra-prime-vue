# Implementasi Fitur Edit Rekening Koran

## 📋 Overview

Fitur Edit Rekening Koran memungkinkan user untuk mengubah data klarifikasi pada rekening koran yang belum terkunci atau belum masuk BKU.

## 🎯 Fitur Utama

### Field yang Dapat Diubah:
- **Tgl. RC** - Tanggal rekening koran
- **No. RC** - Nomor rekening koran
- **Klarifikasi Langsung** - Dropdown akun berdasarkan kredit/debit
- **Klarifikasi Layanan** - Nominal klarifikasi layanan
- **Klarifikasi Lain** - Nominal klarifikasi lain

### Field Read-Only:
- Uraian
- Rekening Dari
- Nama Pemilik Rekening
- Bank
- Debit
- Kredit
- Klarifikasi Monev

## 🔧 Backend Implementation

### 1. Controller: `MasterAkunController.php`

**Location:** `/app/Http/Controllers/MasterAkunController.php`

**Endpoints:**
- `GET /api/master_akun/list` - Get all master akun
- `GET /api/master_akun/klarifikasi?type=kredit|debit` - Get akun for klarifikasi dropdown

**Business Logic:**
```php
// Jika Kredit > 0: akun_kode LIKE '1%'
// Jika Debit > 0: NOT akun_kode LIKE '1%' OR akun_kode LIKE '103%'
```

### 2. Request Validation: `RekeningKoranUpdateRequest.php`

**Location:** `/app/Http/Requests/RekeningKoranUpdateRequest.php`

**Validation Rules:**
```php
'tgl_rc' => 'required|date',
'no_rc' => 'required|string|max:255',
'akunls_id' => 'required|integer|exists:master_akun,akun_id',
'klarif_layanan' => 'required|numeric|min:0',
'klarif_lain' => 'required|numeric|min:0',
```

### 3. Controller Update Method: `RekeningKoranController::update()`

**Location:** `/app/Http/Controllers/RekeningKoranController.php`

**Endpoint:** `PUT /api/rekening_koran/{id}`

**Validasi Bisnis:**
1. ✅ Data harus ditemukan
2. ✅ Data tidak boleh terkunci (`kunci` = false)
3. ✅ Data belum masuk BKU (`bku_id` = null)
4. ✅ Total klarifikasi tidak boleh melebihi nominal kredit/debit

**Response Success:**
```json
{
  "success": true,
  "message": "Data rekening koran berhasil diubah.",
  "data": {
    "rc_id": 123,
    "tgl_rc": "01/10/2025",
    "no_rc": "RC001",
    "akunls_id": 5,
    "klarif_layanan": 100000,
    "klarif_lain": 50000,
    ...
  }
}
```

**Response Error:**
```json
{
  "success": false,
  "message": "Data sudah terkunci dan tidak dapat diubah.",
}
```

### 4. Model Relationships: `DataRekeningKoran.php`

**Added Relationships:**
```php
public function akunData() // Klarifikasi Monev
public function akunlsData() // Klarifikasi Langsung
```

### 5. Resource: `RekeningKoranResource.php`

**Updated Fields:**
- `akun_data` - Eager loaded dari relasi
- `akunls_data` - Eager loaded dari relasi
- `terklarifikasi` - Calculated field (klarif_layanan + klarif_lain)
- `belum_terklarifikasi` - Calculated field (nominal - terklarifikasi)

## 🎨 Frontend Implementation

### 1. Component: `EditRekeningKoran.vue`

**Location:** `/src/components/pendapatan/rekeningKoran/EditRekeningKoran.vue`

**Features:**
- ✅ Modal dialog form
- ✅ Dynamic dropdown akun based on kredit/debit
- ✅ Real-time total klarifikasi calculation
- ✅ Client-side validation
- ✅ Error handling from backend
- ✅ Loading states
- ✅ Currency formatting

**Props:**
```javascript
modelValue: Boolean  // Dialog visibility
item: Object        // Rekening koran data
```

**Events:**
```javascript
@update:modelValue  // Close dialog
@saved             // After successful save
```

### 2. Composable: `useRekeningKoranEdit.js`

**Location:** `/src/composables/useRekeningKoranEdit.js`

**Methods:**
```javascript
updateRekeningKoran(id, data) // PUT request to update
```

**Returns:**
```javascript
{
  loading: Ref<Boolean>,
  error: Ref<Error>,
  updateRekeningKoran: Function
}
```

### 3. Composable: `useMasterAkun.js`

**Location:** `/src/composables/useMasterAkun.js`

**Methods:**
```javascript
fetchAkunKlarifikasi(type, search) // Get akun by type (kredit/debit)
fetchAllAkun(search)               // Get all akun
```

**Returns:**
```javascript
{
  loading: Ref<Boolean>,
  error: Ref<Error>,
  akuns: Ref<Array>,
  fetchAkunKlarifikasi: Function,
  fetchAllAkun: Function
}
```

### 4. Integration: `DataRekeningKoran.vue`

**Updated:**
- Import `EditRekeningKoran` component
- Add `modalEdit` ref
- Update `handleEdit()` function to open edit modal
- Add modal component in template

## 📝 Usage Flow

### User Flow:
1. User clicks "Ubah" button on rekening koran row
2. Edit modal opens with pre-filled data
3. System loads appropriate akun options based on kredit/debit
4. User modifies:
   - Tgl. RC
   - No. RC
   - Klarifikasi Langsung (dropdown)
   - Klarifikasi Layanan (number)
   - Klarifikasi Lain (number)
5. System validates:
   - All required fields filled
   - Total klarifikasi ≤ nominal
6. User clicks "Simpan"
7. Backend validates:
   - Data exists
   - Not locked
   - Not in BKU
   - Total klarifikasi valid
8. Data updated successfully
9. Table refreshes with new data

### Error Handling:
- **403 Forbidden:** Data terkunci atau sudah masuk BKU
- **404 Not Found:** Data tidak ditemukan
- **422 Validation Error:** Validasi gagal (field required, total melebihi nominal)
- **500 Server Error:** Error server

## 🔒 Security & Validation

### Backend Validation:
1. ✅ Request validation via `RekeningKoranUpdateRequest`
2. ✅ Business logic validation (kunci, BKU, nominal)
3. ✅ Database transaction for data integrity
4. ✅ Audit trail via `is_web_change` flag

### Frontend Validation:
1. ✅ Required field validation
2. ✅ Numeric validation (min: 0)
3. ✅ Total klarifikasi vs nominal check
4. ✅ Real-time feedback

## 🧪 Testing Scenarios

### Happy Path:
1. ✅ Edit rekening koran with valid data
2. ✅ Change klarifikasi langsung dropdown
3. ✅ Update klarifikasi layanan and lain
4. ✅ Save and see updated data in table

### Error Cases:
1. ✅ Try to edit locked data (kunci = true)
2. ✅ Try to edit data already in BKU
3. ✅ Enter total klarifikasi > nominal
4. ✅ Leave required fields empty
5. ✅ Enter negative values

## 📊 Database Changes

### Table: `data_rekening_koran`

**Updated Fields:**
- `tgl_rc` - Can be updated
- `no_rc` - Can be updated
- `akunls_id` - Can be updated
- `klarif_layanan` - Can be updated
- `klarif_lain` - Can be updated
- `is_web_change` - Set to true on update

**Constraints:**
- Cannot update if `kunci` = true
- Cannot update if `bku_id` is not null

## 🚀 Deployment Checklist

### Backend:
- [x] MasterAkunController created
- [x] RekeningKoranUpdateRequest created
- [x] RekeningKoranController::update() implemented
- [x] Model relationships added
- [x] Resource updated
- [x] Routes registered

### Frontend:
- [x] EditRekeningKoran.vue component created
- [x] useRekeningKoranEdit.js composable created
- [x] useMasterAkun.js composable created
- [x] DataRekeningKoran.vue integrated

### Testing:
- [ ] Unit tests for backend validation
- [ ] Integration tests for API endpoints
- [ ] E2E tests for user flow
- [ ] Manual testing with various scenarios

## 📚 API Documentation

### Update Rekening Koran

**Endpoint:** `PUT /api/rekening_koran/{id}`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "tgl_rc": "2025-10-01",
  "no_rc": "RC001",
  "akunls_id": 5,
  "klarif_layanan": 100000,
  "klarif_lain": 50000
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Data rekening koran berhasil diubah.",
  "data": { ... }
}
```

**Response 403:**
```json
{
  "success": false,
  "message": "Data sudah terkunci dan tidak dapat diubah."
}
```

**Response 422:**
```json
{
  "success": false,
  "message": "Total klarifikasi tidak boleh melebihi nominal kredit.",
  "detail": [
    {
      "loc": ["body", "klarif_layanan"],
      "msg": "Total klarifikasi melebihi nominal.",
      "type": "validation"
    }
  ]
}
```

### Get Akun Klarifikasi

**Endpoint:** `GET /api/master_akun/klarifikasi`

**Query Parameters:**
- `type` (required): "kredit" | "debit"
- `search` (optional): string

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "akun_id": 1,
      "akun_kode": "101",
      "akun_nama": "Kas"
    },
    ...
  ]
}
```

## 🎓 Notes

1. **Dropdown Logic:** Akun dropdown berubah dinamis berdasarkan nilai kredit/debit
2. **Audit Trail:** Field `is_web_change` diset true untuk tracking perubahan dari web
3. **Eager Loading:** Relasi `akunData` dan `akunlsData` di-eager load untuk performa
4. **Currency Format:** Semua nominal menggunakan format IDR (Rp)
5. **Date Format:** Backend: yyyy-mm-dd, Frontend display: dd/mm/yyyy

## 🔄 Future Enhancements

- [ ] Add history/audit log untuk tracking perubahan
- [ ] Add bulk edit functionality
- [ ] Add export edited data
- [ ] Add notification/email on edit
- [ ] Add approval workflow untuk edit data penting
