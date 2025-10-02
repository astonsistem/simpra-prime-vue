# Aksi PB REKENING KORAN

Table: `data_rekening_koran`

**Fungsi:**
Menampilkan form / modal data yang berfungsi untuk mendaftarkan rekening koran yang akan di PB kan ke rekening induk (rekening bank jatim)

Form ini berfungsi untuk menandai bahwa mutasi kredit Bank Jatim tersebut merupakan hasil PB dari bank lainnya.

**Rule:**
Hanya bisa berjalan jika memenuhi kriteria : 
- kredit > 0
- akun_id is null 
- akunls_id is null
- bku_id is null


**Modal ini terdapat 3 tab yaitu:**

1. Ubah ID Transaksi #[rc_id]
2. Mutasi bank yang dimasukkan
3. Mutasi bank yang belum dimasukkan

Selain itu terdapat tombol simpan dan batal di footer.

### Tab 1
Pada tab 1, berisi form untuk mengubah Mutasi dan PB dari bank , ID Transaksi #[rc_id] dengan format baru yaitu:

- No. Rc | readonly
- Tgl. Rc | readonly
- Uraian | readonly
- Bank | readonly
- Kredit | readonly
- Mutasi | editable berupa checkbox
- PB dari bank | editable berupa dropdown list bank, diambil dari `master_bank` selain JATIM.


### Tab 2
Tab ini menampilkan data mutasi rekening koran selain bank jatim yang di PB kan ke rekening kredit Bank Jatim atau mutasi rekening selain bank jatim yang ditautkan dengan mutasi rekening koran Bank Jatim. Berupa Simple DataTable with pagination, field:

- No. Rc
- Tgl. Rc
- Uraian
- Kredit
- Bank
- Mutasi
- PB dari bank

Untuk mendapatkan data yang ditampikan pada tabel ini bisa dengan menggunakan Script SQL sebagai berikut :
```sql
Select * from data_rekening_koran where pb = [current rc_id row data_rekening_koran bank jatim yang sedang dilihat PB nya]
```

Pada setiap baris data tabel Mutasi bank yang dimasukkan terdapat Action Batalkan yang berfungsi untuk membatalkan atau menghapus penandaan / pentautan rekening mutasi koran tersebut. Atau dengan menggunakan script sebagai berikut :    
```sql
Update data_rekening_koran set pb = null where rc_id = [rc_id rekening koran yang ditautkan]
```

### Tab 3
Tab ini menampilkan datatable mutasi rekening koran selain bank jatim yang belum ditautkan dengan mutasi kredit rekening koran bank jatim. Fields sama dengan di tab 2.

Untuk mendapatkan data yang ditampilkan pada tabel pada tab ini yaitu dengan menggunakan script SQL sebagai berikut :
```sql
Select * from data_rekening_koran where pb is null and bank <> ‘JATIM’ and tgl_rc <= [tgl_rc tabel data_rekening_koran bank jatim yang merupakan PB dari bank lainnya]
```

Kemudian pada setiap data_rekening_koran selain bank jatim yang ditampilkan tersebut terdapat Action Daftarkan yang berfungsi untuk mentautkan mutasi rekening tersebut dengan mutasi rekening bank jatim. Atau jika dijalankan akan menjalankan script SQL sebagai berikut :
```sql
Update data_rekening_koran set pb = [rc_id mutasi data_rekening_koran bank jatim] where rc_id = [rc_id rekening koran yang ditautkan]
```