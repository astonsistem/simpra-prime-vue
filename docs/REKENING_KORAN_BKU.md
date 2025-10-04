# Aksi BKU pada REKENING KORAN

url: @http://localhost:5173/Kas/rekening-koran

Deskripsi:
Menampilkan form / modal data yang berfungsi untuk membuat BKU langsung pada rekening koran.

Form / modal ini akan ditampilkan ketika Action BKU dijalankan yang berfungsi untuk melakukan BKU mutasi rekening koran secara langsung, tanpa menggunakan menu BKU. Hal ini dilakukan karena akun hasil klarifikasi langsung ini bukan merupakan akun pendapatan

#### Requirenments
- Hanya berjalan jika mutasi rekening koran dengan field not `akunls_id` is null dan `bku_id` is null , link di action akan disabled jika tidak memenuhi syarat ini.

#### Form 
Contoh Label dan value:

| Label                    | Nilai                                |
| ------------------------ | ------------------------------------ |
| **Data BKU Bank**        | #2038                                |
| **Tgl. RC**              | 02-06-2025                           |
| **No RC**                | 000347430808                         |
| **Uraian**               | SP2D 35.00/04.0/000351/LS/1.02       |
| **Bank**                 | -- Pilih Bank Tujuan --              |
| **Debit**                | 217116464                            |
| **Mutasi**               | ✔ (Checked)                          |
| **Klarifikasi Langsung** | 20101 - Bank Bendahara Pengeluaran P |
| **No. BKU**              | MUTASI/01                            |
| **Keterangan BKU**       | Droping ke bendara pengeluaran       |

###### Form map label dengan field di table database
| Label                    | Field                                |
| ------------------------ | ------------------------------------ |
| **Tgl. RC**              | `tgl_rc`                             |
| **No RC**                | `no_rc`                              |
| **Uraian**               | `uraian`                             |
| **Bank**                 | `bank`                               |
| **Debit**                | `debit`                              |
| **Mutasi**               | `mutasi`                             |
| **Klarifikasi Langsung** | `klarif_langsung`               |
| **No. BKU**              | `no_bku`                             |
| **Keterangan BKU**       | `ket_bku`                     |



#### Action
| No. | Nama Fitur | Fungsi | Rule |
| --- | --- | --- | --- |
| 1 | Kirim PAD | Menjalankan fungsi menyimpan informasi BKU sekaligus melakukan pengiriman data mutasi rekening koran yang di BKU ke aplikasi PAD Online | Jika debit > 0 dan mutasi tidak dicentang jenisnya pengeluaran jika debit > 0 dan mutasi dicentang jenisnya pindah kas jika kredit > 0 dan mutasi dicentang maka jenisnya penerimaan kas |
| 2 | Batal | Menutup form / modal | - |

#### Penjelasan
Penjelasan detail fungsi Kirim PAD yang berfungsi untuk mengirim data BKU ke aplikasi PAD Online milik BPKAD Prov. Jatim. Untuk mengirim data ke aplikasi PAD ini disediakan API untuk komunikasi datanya. Berikut secara alur Action Kirim PAD jika dijalankan 

1. Dapatkan terlebih dahulu informasi Tahun, URL base aplikasi PAD Online serta user dan password nya dari database SIMPRA untuk authentifikasi API PAD berdasarkan spesifikasi endpoint authentifikasi yang disediakan dan digunakan untuk membangun request body endpoint authentifikasi PAD. Berikut script SQL untuk mendapatkan user dan password nya :

    ```
    Script 1 : select max(value) from setting where key = 'sync_pad_url';
    Script 2 : select max(value) from setting where key = 'sync_pad_user';
    Script 3 : select max(value) from setting where key = 'sync_pad_password';
    Script 4 : select max(value) from setting where key = 'sync_tahun';
    ```
    Anggaplah hasil script 1 ditampung pada variabel pad_url, script 2 ditampung variabel pad_user dan script 3 ditampung pada variabel pad_password, script 4 ditampiung variabel pad_tahun

2. Bangun Request body untuk request token menggunakan endpoint authentifikasi API PAD online yang disediakan:

    ```javascript
    {
        "username": pad_user ,
        "password": pad_password ,
        "aplikasi": " pad",
        "tahun" : pad_tahun
    }
    ```
    
3. Jalankan requet bodynya dengan spesifikasi sebagai berikut :
    ```javascript
    "URL" : pad_url+"/login",
    "Method" : "POST",
    "Content-Type" :  "application/json",
    "Request Body" :
    {
        "username": pad_user ,
        "password": pad_password ,
        "aplikasi": " pad",
        "tahun" : pad_tahun
    }
    ```
    Jika request berhasil akan mendapatkan response :

    ```javascript
    {
        "expires_in":3600,
        "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MTYwNjA3MDMsInVzZXJuYW1lIjoib255IiwiaWRfcGsiOm51bGwsImlkX3VuaXQiOjIwNzMzMjAwMDAxLCJrb2RlX3BrX2plbmlzIjpudWxsfQ.zK6eOr79OBkOUdo3xqL9cIwYF5Bu3EYMUA_vdr9msiU",
        "token_type":"bearer",
        "user":{
        "username":"XXXXXX",
        "nama":"XXXXXX",
        "id_pk":XXXXXX,
        "id_unit":XXXXXX,
        "nama_pk":"XXXXXX",
        "nip_pk":"XXXXXX",
        "kode_pk_jenis":"BPN",
        "nama_unit":"XXXXXX",
        "alias_unit":null,
        "config_no_jual":null,
        "config_no_terima":null,
        "tgl_sts_kunci":"2021-02-28T00:00:00Z",
        "tgl_akun_kunci":null,
        "is_blud":false,
        "is_pembina":false,
        "is_admin":false
    }
    ```
4. Gunakan token hasil response endpoint authentifikasi tersebut saat akan mengirim atau request input data ke aplikasi PAD online sebagai headernya, dengan spesifikasi sebagai berikut :
    ```javascript
    "Content-Type"	: application/json
    "Authorization"	: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MTYwNjA3MDMsInVzZXJuYW1lIjoib255IiwiaWRfcGsiOm51bGwsImlkX3VuaXQiOjIwNzMzMjAwMDAxLCJrb2RlX3BrX2plbmlzIjpudWxsfQ.zK6eOr79OBkOUdo3xqL9cIwYF5Bu3EYMUA_vdr9msiU
    ```
5. Dapatkan informasi rekening kas terlebih dahulu pada database SIMPRA dengan menggunakan Script SQL berdasarkan kriteria / rule BKU rekening koran diantaranya (penerimaan kas, pengeluaran kas dan pindah kas) adalah sebagai berikut :

    **Penerimaan Kas**
    ```sql
    -- Penerimaan Kas 
    Select bku_kaske from master_jenisbku where jenisbku_id = 7
    ```
    Hasil Script tampung ke variabel `pad_kaske`

    **Pindah Kas**
    ```sql
    Select bku_kasdari from master_jenisbku where jenisbku_id = 8
    ```
    Hasil Script tampung ke variabel `pad_kasdari`

    **Pengeluaran Kas**
    ```sql
    Script  1: Select bku_kaske from master_jenisbku where jenisbku_id = 9
    Script  2: Select bku_kasdari from master_jenisbku where jenisbku_id = 9
    ```
   Hasil Script 1 tampung ke variabel `pad_kaske`, hasil scipt 2 tampung ke variabel `pad_kasdari`

6. Spesifikasi Request Body pengiriman data BKU ke PAD online adalah :
Jika `data_rekening_koran.debit` > 0 :
    ```json
    URL : pad_url+"/"+transfer-kas
    Method : POST
    Content-Type :  application/json
    {
        "id_jenis":2,
        "no_bukti":[data_rekening_koran.no_bku],
        "tgl_bukti":":[data_rekening_koran.tgl_bku],
        "dr_kas":$pad_kasdari,
        "ke_kas":$pad_kaske,
        "jml": [sum(data_rekening_koran.debit)],
        "untuk":[data_rekening_koran.ket_bku]
    }
    ```
    Jika data_rekening_koran.kredit > 0 :
    ```
    URL : pad_url+"/"+transfer-kas
    Method : POST
    Content-Type :  application/json
    {
        "id_jenis":2,
        "no_bukti":[data_rekening_koran.no_bku],
        "tgl_bukti":":[data_rekening_koran.tgl_bku],
        "dr_kas":$pad_kasdari,
        "ke_kas":$pad_kaske,
        "jml": [sum(data_rekening_koran.kredit)],
        "untuk":[data_rekening_koran.ket_bku]
    }
    ```
    Berikut contoh hasil response sukses `untuk`
    ```json
    {
        "id":4589,
        "message":"Tambah data berhasil"
    }
    ```

7. Dari hasil request ke PAD online mendapatkan response jika sukses berupa ID, sehingga nilai ID tersebut disimpan di field `pad_id`, selain itu juga mengupdate field `pad_tgl` sesuai dengan tanggal sukses mengirim data ke PAD online. Jika field `pad_id` dan `pad_tgl` tidak ada maka tambahkan script :
    ```sql
    ALTER TABLE IF EXISTS public.data_rekening_koran    ADD COLUMN pad_id integer;
    ALTER TABLE IF EXISTS public. data_rekening_koran   ADD COLUMN pad_tgl date;
    ```