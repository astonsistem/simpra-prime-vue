## AKSI UBAH REKENING KORAN

### Form
Form Modal Ubah Rekening Koran

#### FIELDS and Maps
Tgl. Rc | date | required | tgl_rc
No. Rc | string | required | no_rc
Uraian | string | readonly | uraian
Rekening Dari | string | readonly | rek_dari
Nama Pemilik Rekening | string | readonly | nama_dari
Bank | string dropdown | readonly | bank
Debit | number | readonly | debit
Kredit | number | readonly | kredit
Mutasi | boolean | readonly | mutasi

##### Hasil Klarifikasi
Klarifikasi monev | dropdown | readonly | akun_id
Klarifikasi Langsung | dropdown | required | akunls_id
Klarifikasi Layanan | number | required | klarif_layanan | default 0
Klarifikasi Lain | number | required | klarif_lain | default 0

### Flow
Sedangkan yang dimaksud fungsi klarifikasi langsung pada form / modal ubah ini yaitu tindakan user memilih akun dari mutasi rekening koran, yaitu pada isian kolom `Klarifikasi Langsung` dengan cara memilih akun klarifikasinya, dengan rule sabagai berikut :
 1. Jika `Kredit` > 0 maka Pilih Akun yang ditampilkan SQL Script nya:
```sql
Select akun_id, akun_kode, akun_nama from master_akun where akun_kode like ‘1%’
```
2. Jika `Debit` > 0 maka Pilih Akun yang ditampilkan SQL Script nya:
```sql
Select akun_id, akun_kode, akun_nama from master_akun where not akun_kode like ‘1%’ or akun_kode like ‘103%’
```
