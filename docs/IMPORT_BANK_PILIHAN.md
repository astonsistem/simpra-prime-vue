## FLOW IMPORT BANK PILIHAN
- user memilih bank yang ada di dropdown
- user unggah file berupa excel
- Klik preview -> menampilkan data di datatable with columns (No, No. RC, Tgl. RC, Rek Dari, Nama Dari, Uraian, Bank, Debit, Kredit)
- Button sync -> menyimpan data hasil import ke table data_rekening_koran 

Note:
- Setiap bank memiliki format excel yang berbeda
- List bank bisa lihat di table `master_bank`
- Akan disediakan Mapping format excel untuk setiap bank
- Filter hanya baris yang ada tanggalnya saja yang diimpor

## MAPPING FORMAT EXCEL dengan TABLE data_rekening_koran

#### 1. Bank JATIM
##### File Excel
`[simpra-laravel]/public/rekening-koran-format/bank_jatim.xlsx`
##### Mapping
| No | Kolom Excel | Field tabel data_rekening_koran | Keterangan |
|----|----|----|----|
| 1 | Post Date | Tgl_rc | 
| 2 | Effective Date | | Tidak dipakai | 
| 3 | Account | Rek_dari | 
| 4 | Name | Nama_dari | 
| 5 | Description | Uraian | 
| 6 | Currency | | Tidak dipakai |
| 7 | Debit | Debit |
| 8 | Credit | Kredit |
| 9 | Balance | | Tidak dipakai |
| 10 | Reference No | No_rc |
| 11 | bank | | Diisi JATIM |

#### 2. Bank Mandiri
##### File Excel
`[simpra-laravel]/public/rekening-koran-format/bank_mandiri.xlsx`
##### Mapping
| No. | Kolom Excel        | Field tabel data_rekening_koran | Keterangan        |
|-----|--------------------|---------------------------------|-------------------|
| 1   | Tgl.               | Tgl_rc                          |                   |
| 2   | Tgl. Val.          |                                 | Tidak dipakai     |
| 3   | Rincian Transaksi  | Uraian                          |                   |
| 4   | No. Referensi      | No_rc                           |                   |
| 5   | Debit              | Debit                           |                   |
| 6   | Kredit             | Kredit                          | Tidak dipakai     |
| 7   | Saldo              |                                 |                   |
| 8   | Branch Code        | Rek_dari                        |                   |
| 9   |                    | bank                            | Diisi MANDIRI     |


#### 3. Bank BCA
##### File Excel
`[simpra-laravel]/public/rekening-koran-format/bank_bca.xlsx`
##### Mapping
| No. | Kolom Excel        | Field tabel data_rekening_koran | Keterangan                                                                 |
|-----|--------------------|---------------------------------|----------------------------------------------------------------------------|
| 1   | Tanggal Transaksi  | Tgl_rc                          |                                                                            |
| 2   | Keterangan         | uraian                          |                                                                            |
| 3   | Cabang             |                                 | Tidak dipakai                                                              |
| 4   | jumlah             | Debit / kredit                  | Jika nilainya mengandung DB maka masuk field debit, jika CR maka masuk field kredit |
| 5   | tgl                | tgl                             | Diisi sesuai dengan tanggal waktu impor                                    |
| 6   | bank               | bank                            | Diisi BCA                                                                  |



#### 4. Bank BNI
##### File Excel
`[simpra-laravel]/public/rekening-koran-format/bank_bni.xlsx`
##### Mapping
| No. | Kolom Excel        | Field tabel data_rekening_koran | Keterangan    |
|-----|--------------------|---------------------------------|---------------|
| 1   | No.                |                                 | Tidak dipakai |
| 2   | Tanggal Kirim      | Tgl_rc                          |               |
| 3   | Cabang             | Nama_dari                       |               |
| 4   | Journal No.        | No_rc                           |               |
| 5   | Deskripsi          | Uraian                          |               |
| 6   | Amount             | Debit                           | Jika kolom Db/ Cr = D |
| 7   | Amount             | Kredit                          | Jika kolom Db/ Cr = C |
| 8   | tgl                | tgl                             | Diisi sesuai dengan tanggal impor |
| 9   | bank               | bank                            | Diisi BNI     |



#### 5. Bank BRI
##### File Excel
`[simpra-laravel]/public/rekening-koran-format/bank_bri.xlsx`
##### Mapping
| No. | Kolom Excel        | Field tabel data_rekening_koran | Keterangan    |
|-----|--------------------|---------------------------------|---------------|
| 1   | ID                 |                                 | Tidak dipakai |
| 2   | NOREK              |                                 | Tidak dipakai |
| 3   | TGL_TRAN           | Tgl_rc                          |               |
| 4   | TGL_EFEKTIF        |                                 | Tidak dipakai |
| 5   | JAM_TRAN           | No_rc                           |               |
| 6   | SEQ                |                                 | Tidak dipakai |
| 7   | DESK_TRAN          | Uraian                          |               |
| 8   | SALDO_AWAL_MUTASI  |                                 | Tidak dipakai |
| 9   | MUTASI_DEBIT       | Debit                           |               |
| 10  | MUTASI_KREDIT      | Kredit                          |               |
| 11  | tgl                | tgl                             | Tanggal saat impor |
| 12  | bank               | bank                            | Diisi BRI     |




## IMPLEMENTASI STATUS

### ✅ SELESAI - Semua Bank
- [x] Frontend component ImportBankPilihan.vue
- [x] Frontend composable useImportBankPilihan.js
- [x] Backend method importBank di RekeningKoranController
- [x] Route POST /rekening_koran/import
- [x] Excel parsing dengan mapping untuk semua bank:
  - [x] Bank JATIM - ✅ Fully implemented
  - [x] Bank Mandiri - ✅ Fully implemented
  - [x] Bank BCA - ✅ Fully implemented (dengan logic DB/CR)
  - [x] Bank BNI - ✅ Fully implemented
  - [x] Bank BRI - ✅ Fully implemented
- [x] Preview data sebelum import
- [x] Sinkronisasi data ke database
- [x] Error handling dan validation
- [x] Toast notifications untuk feedback user

### 🔄 CARA PENGGUNAAN
1. Buka menu Kas > Rekening Koran
2. Klik tombol "Import Bank Pilihan"
3. Pilih bank dari dropdown (JATIM/Mandiri/BCA/BNI/BRI)
4. Upload file Excel dengan format sesuai bank yang dipilih
5. Klik "Preview" untuk melihat data yang akan diimpor
6. Jika data sudah benar, klik "Sinkronisasi" untuk menyimpan ke database

### 📋 FORMAT EXCEL BANK JATIM
File Excel harus memiliki header di baris pertama dengan kolom:
- Post Date (wajib)
- Effective Date (opsional)
- Account (opsional)
- Name (opsional)
- Description (opsional)
- Currency (opsional)
- Debit (opsional)
- Credit (opsional)
- Balance (opsional)
- Reference No (wajib)

### ⚠️ CATATAN PENTING
- Hanya baris yang memiliki tanggal (Post Date) yang akan diimpor
- Data dengan Reference No yang sama akan di-update, bukan di-insert ulang
- File Excel maksimal 5MB
- Format tanggal akan otomatis dikonversi ke format database

## ARSITEKTUR TRANSFORMER

### 🏗️ STRUKTUR TRANSFORMER
Setiap bank memiliki transformer sendiri untuk memudahkan maintenance:

```javascript
const bankTransformers = {
  'JATIM': transformJatimExcel,
  'BANK JATIM': transformJatimExcel,
  'MANDIRI': transformMandiriExcel,
  'BCA': transformBcaExcel,
  'BNI': transformBniExcel,
  'BRI': transformBriExcel,
  'DEFAULT': transformDefaultExcel
}
```

### 📝 CARA MENAMBAH BANK BARU
1. Buat function transformer baru: `transformNamaBankExcel()`
2. Definisikan mapping kolom Excel ke database
3. Tambahkan ke `bankTransformers` object
4. Update dokumentasi mapping

### 🔧 TRANSFORMER FUNCTIONS
- **`transformJatimExcel()`** - ✅ Selesai
- **`transformMandiriExcel()`** - ✅ Selesai
- **`transformBcaExcel()`** - ✅ Selesai (dengan logic DB/CR khusus)
- **`transformBniExcel()`** - ✅ Selesai
- **`transformBriExcel()`** - ✅ Selesai
- **`transformDefaultExcel()`** - ✅ Fallback ke JATIM
- **`parseExcelDate()`** - ✅ Helper untuk parsing tanggal (di utils/dateUtils)

### 🎯 KEUNTUNGAN STRUKTUR INI
- **Modular**: Setiap bank terpisah, mudah maintain
- **Scalable**: Mudah menambah bank baru
- **Reusable**: Helper functions bisa dipakai ulang
- **Debuggable**: Error handling per bank
- **Flexible**: Bisa custom logic per bank