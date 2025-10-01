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
`/Users/semarang/Irnovi/Sites/simpra-laravel/public/rekening-koran-format/bank_jatim.xlsx`
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
##### Mapping (TODO - Sesuaikan dengan format asli)
| No | Kolom Excel | Field tabel data_rekening_koran | Keterangan |
|----|----|----|----|
| 1 | Tanggal | tgl_rc | 
| 2 | Keterangan | uraian | 
| 3 | Debet | debit |
| 4 | Kredit | kredit |
| 5 | No Referensi | no_rc |

#### 3. Bank BCA
##### Mapping (TODO - Sesuaikan dengan format asli)
| No | Kolom Excel | Field tabel data_rekening_koran | Keterangan |
|----|----|----|----|
| 1 | Date | tgl_rc | 
| 2 | Description | uraian | 
| 3 | Debit | debit |
| 4 | Credit | kredit |
| 5 | Reference | no_rc |

#### 4. Bank BNI
##### Mapping (TODO - Sesuaikan dengan format asli)
| No | Kolom Excel | Field tabel data_rekening_koran | Keterangan |
|----|----|----|----|
| 1 | Tanggal | tgl_rc | 
| 2 | Keterangan | uraian | 
| 3 | Debit | debit |
| 4 | Kredit | kredit |
| 5 | No Ref | no_rc |

#### 5. Bank BRI
##### Mapping (TODO - Sesuaikan dengan format asli)
| No | Kolom Excel | Field tabel data_rekening_koran | Keterangan |
|----|----|----|----|
| 1 | Tanggal | tgl_rc | 
| 2 | Keterangan | uraian | 
| 3 | Debit | debit |
| 4 | Kredit | kredit |
| 5 | No Referensi | no_rc |

## IMPLEMENTASI STATUS

### ✅ SELESAI - Bank JATIM
- [x] Frontend component ImportBankPilihan.vue
- [x] Frontend composable useImportBankPilihan.js
- [x] Backend method importBank di RekeningKoranController
- [x] Route POST /rekening_koran/import
- [x] Excel parsing dengan mapping Bank JATIM
- [x] Preview data sebelum import
- [x] Sinkronisasi data ke database
- [x] Error handling dan validation
- [x] Toast notifications untuk feedback user

### 🔄 CARA PENGGUNAAN
1. Buka menu Kas > Rekening Koran
2. Klik tombol "Import Bank Pilihan"
3. Pilih "JATIM" dari dropdown Bank
4. Upload file Excel dengan format Bank JATIM
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
- **`transformMandiriExcel()`** - 🔄 TODO
- **`transformBcaExcel()`** - 🔄 TODO  
- **`transformBniExcel()`** - 🔄 TODO
- **`transformBriExcel()`** - 🔄 TODO
- **`transformDefaultExcel()`** - ✅ Fallback ke JATIM
- **`parseExcelDate()`** - ✅ Helper untuk parsing tanggal

### 🎯 KEUNTUNGAN STRUKTUR INI
- **Modular**: Setiap bank terpisah, mudah maintain
- **Scalable**: Mudah menambah bank baru
- **Reusable**: Helper functions bisa dipakai ulang
- **Debuggable**: Error handling per bank
- **Flexible**: Bisa custom logic per bank