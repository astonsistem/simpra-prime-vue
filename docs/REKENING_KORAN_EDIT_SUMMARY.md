# Edit Rekening Koran - Quick Reference

## 🚀 Quick Start

### Backend Files Created/Modified:
```
✅ app/Http/Controllers/MasterAkunController.php (NEW)
✅ app/Http/Requests/RekeningKoranUpdateRequest.php (NEW)
✅ app/Http/Controllers/RekeningKoranController.php (MODIFIED - update method)
✅ app/Models/DataRekeningKoran.php (MODIFIED - added relationships)
✅ app/Http/Resources/RekeningKoranResource.php (MODIFIED - eager loading)
✅ routes/api.php (MODIFIED - added master_akun routes)
```

### Frontend Files Created/Modified:
```
✅ src/components/pendapatan/rekeningKoran/EditRekeningKoran.vue (NEW)
✅ src/composables/useRekeningKoranEdit.js (NEW)
✅ src/composables/useMasterAkun.js (NEW)
✅ src/components/pendapatan/rekeningKoran/DataRekeningKoran.vue (MODIFIED)
```

## 📡 API Endpoints

### 1. Update Rekening Koran
```
PUT /api/rekening_koran/{id}
Body: { tgl_rc, no_rc, akunls_id, klarif_layanan, klarif_lain }
```

### 2. Get Akun Klarifikasi
```
GET /api/master_akun/klarifikasi?type=kredit|debit&search=optional
```

### 3. Get All Master Akun
```
GET /api/master_akun/list?search=optional
```

## 🎯 Key Features

1. **Dynamic Dropdown** - Akun options change based on kredit/debit
2. **Validation** - Cannot edit if locked or in BKU
3. **Real-time Calculation** - Total klarifikasi calculated automatically
4. **Error Handling** - Backend and frontend validation
5. **Audit Trail** - `is_web_change` flag for tracking

## 🔒 Business Rules

### Dropdown Logic:
- **Kredit > 0:** Show akun with `akun_kode LIKE '1%'`
- **Debit > 0:** Show akun with `NOT akun_kode LIKE '1%' OR akun_kode LIKE '103%'`

### Edit Restrictions:
- ❌ Cannot edit if `kunci = true`
- ❌ Cannot edit if `bku_id` is not null
- ❌ Total klarifikasi cannot exceed nominal (kredit or debit)

## 🧪 Testing

### Manual Test Steps:
1. Open Rekening Koran page
2. Click "Ubah" on any row
3. Modal opens with pre-filled data
4. Change klarifikasi langsung dropdown
5. Update klarifikasi layanan/lain
6. Click "Simpan"
7. Verify data updated in table

### Test Cases:
- ✅ Edit with valid data
- ✅ Edit locked data (should fail)
- ✅ Edit data in BKU (should fail)
- ✅ Total > nominal (should fail)
- ✅ Empty required fields (should fail)

## 💡 Usage Example

### Frontend Component Usage:
```vue
<EditRekeningKoran 
  v-model="modalEdit" 
  :item="selectedItem" 
  @saved="onSaved" 
/>
```

### Composable Usage:
```javascript
import useRekeningKoranEdit from '@/composables/useRekeningKoranEdit'
import useMasterAkun from '@/composables/useMasterAkun'

const { updateRekeningKoran, loading } = useRekeningKoranEdit()
const { fetchAkunKlarifikasi } = useMasterAkun()

// Fetch akun options
const akuns = await fetchAkunKlarifikasi('kredit')

// Update data
await updateRekeningKoran(rcId, {
  tgl_rc: '2025-10-01',
  no_rc: 'RC001',
  akunls_id: 5,
  klarif_layanan: 100000,
  klarif_lain: 50000
})
```

## 🐛 Common Issues

### Issue: Dropdown empty
**Solution:** Check if `type` parameter is correct ('kredit' or 'debit')

### Issue: Cannot save
**Solution:** Check validation errors in console, verify total klarifikasi ≤ nominal

### Issue: 403 Forbidden
**Solution:** Data is locked or already in BKU, cannot be edited

### Issue: Relasi tidak muncul
**Solution:** Pastikan eager loading `with(['akunData', 'akunlsData'])` sudah ditambahkan

## 📞 Support

For issues or questions, check:
1. Browser console for frontend errors
2. Laravel logs for backend errors (`storage/logs/laravel.log`)
3. Network tab for API response details
