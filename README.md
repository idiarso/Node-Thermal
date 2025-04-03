# Parking System Client Application

Aplikasi client untuk sistem parkir yang menangani kamera, printer thermal, dan kontrol gerbang Arduino.

## Fitur

- Manajemen kamera untuk mengambil gambar kendaraan
- Pembuatan dan pencetakan tiket dengan barcode
- Kontrol gerbang parkir melalui Arduino
- Integrasi dengan database PostgreSQL
- API REST untuk integrasi dengan sistem lain

## Persyaratan Sistem

- Node.js v14 atau lebih baru
- PostgreSQL 12 atau lebih baru
- Printer thermal yang kompatibel (EPSON/POS-58)
- Webcam yang kompatibel
- Arduino (opsional, untuk kontrol gerbang)

## Instalasi di Windows

1. Install Node.js:
   - Download Node.js dari https://nodejs.org/
   - Pilih versi LTS (Long Term Support)
   - Jalankan installer dan ikuti petunjuk instalasi
   - Setelah selesai, buka Command Prompt dan verifikasi instalasi:
     ```cmd
     node --version
     npm --version
     ```

2. Install PostgreSQL:
   - Download PostgreSQL dari https://www.postgresql.org/download/windows/
   - Jalankan installer dan catat password yang diset untuk user 'postgres'
   - Tambahkan path PostgreSQL ke Environment Variables jika diperlukan

3. Konfigurasi Printer Thermal:
   - Install driver printer sesuai dengan merk dan model
   - Untuk printer EPSON:
     1. Download driver dari website resmi EPSON
     2. Install driver
     3. Hubungkan printer dan tunggu Windows mendeteksi
     4. Buka Settings > Printers & Scanners
     5. Pastikan printer terdeteksi dan set sebagai default
   - Catat nama printer untuk konfigurasi di .env

4. Konfigurasi Arduino (jika menggunakan):
   - Install driver CH340 jika menggunakan Arduino clone
   - Hubungkan Arduino dan catat nomor COM Port dari Device Manager
   - COM Port biasanya berbentuk COM3, COM4, dst

5. Konfigurasi Visual Studio Build Tools (jika diperlukan):
   ```cmd
   npm install --global windows-build-tools
   ```

## Instalasi di Linux

1. Install Node.js dan npm:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. Install dependensi sistem yang diperlukan:
   ```bash
   sudo apt-get update
   sudo apt-get install -y build-essential libcups2-dev libpq-dev
   ```

3. Konfigurasi printer thermal:
   - Pastikan printer sudah terhubung dan terdeteksi
   - Cek nama printer dengan perintah:
     ```bash
     lpstat -p -d
     ```
   - Catat nama printer untuk konfigurasi di .env

4. Sesuaikan permission USB untuk Arduino (jika menggunakan Arduino):
   ```bash
   sudo usermod -a -G dialout $USER
   sudo chmod a+rw /dev/ttyUSB0  # Sesuaikan dengan port Arduino Anda
   ```

## Instalasi

1. Clone repository ini:
   ```bash
   git clone <repository-url>
   cd parking-client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Salin file `.env.example` ke `.env` dan sesuaikan konfigurasi:
   ```bash
   cp .env.example .env
   ```

4. Sesuaikan konfigurasi di file `.env`:
   - Port aplikasi
   - Koneksi database
   - Pengaturan kamera
   - Pengaturan printer
   - Port Arduino

5. Build aplikasi:
   ```bash
   npm run build
   ```

## Penggunaan

1. Jalankan aplikasi:
   ```bash
   npm start
   ```
   Atau untuk development:
   ```bash
   npm run dev
   ```

2. API Endpoints:

   ### Kamera
   - `GET /camera/list` - Daftar kamera yang tersedia
   - `POST /camera/capture` - Ambil gambar dari kamera

   ### Printer
   - `GET /printer/status` - Cek status printer
   - `POST /printer/test` - Cetak halaman test
   - `POST /printer/ticket` - Cetak tiket parkir

   ### Arduino/Gerbang
   - `GET /arduino/ports` - Daftar port serial yang tersedia
   - `GET /arduino/status` - Cek status koneksi Arduino
   - `POST /arduino/connect` - Hubungkan ke Arduino
   - `POST /arduino/disconnect` - Putuskan koneksi Arduino
   - `POST /arduino/gate/open` - Buka gerbang
   - `POST /arduino/gate/close` - Tutup gerbang

## Contoh Penggunaan API

1. Cetak tiket:
   ```bash
   curl -X POST http://localhost:3001/printer/ticket \
     -H "Content-Type: application/json" \
     -d '{
       "ticketNo": "PKR001",
       "plateNumber": "B1234KJH",
       "entryTime": "2024-04-03T10:30:00Z",
       "vehicleType": "CAR"
     }'
   ```

2. Ambil gambar:
   ```bash
   curl -X POST http://localhost:3001/camera/capture
   ```

3. Buka gerbang:
   ```bash
   curl -X POST http://localhost:3001/arduino/gate/open
   ```

## Troubleshooting

1. Masalah Kamera:
   - Pastikan webcam terhubung dan terdeteksi sistem
   - Di Windows:
     1. Buka Device Manager
     2. Cek di bagian "Imaging devices" atau "Cameras"
     3. Pastikan tidak ada tanda warning atau error
   - Gunakan endpoint `/camera/list` untuk melihat kamera yang tersedia

2. Masalah Printer:
   - Pastikan printer thermal terhubung dan driver terinstall
   - Di Windows:
     1. Buka Settings > Printers & Scanners
     2. Cek status printer
     3. Coba Print Test Page dari Windows
     4. Jika printer tidak terdeteksi:
        - Uninstall dan reinstall driver
        - Coba port USB yang berbeda
        - Restart Windows Print Spooler:
          ```cmd
          net stop spooler
          net start spooler
          ```
   - Cek status printer dengan endpoint `/printer/status`
   - Coba cetak test page dengan endpoint `/printer/test`

3. Masalah Arduino:
   - Pastikan Arduino terhubung dan port serial terdeteksi
   - Di Windows:
     1. Buka Device Manager
     2. Cek di bagian "Ports (COM & LPT)"
     3. Catat nomor COM port yang digunakan
     4. Jika muncul tanda kuning:
        - Update driver
        - Install ulang driver CH340 jika menggunakan Arduino clone
   - Cek daftar port dengan endpoint `/arduino/ports`
   - Verifikasi baudrate di file `.env` sesuai dengan konfigurasi Arduino

## Contoh Konfigurasi .env untuk Windows

```env
# Port aplikasi
PORT=3001

# Konfigurasi Printer
PRINTER_TYPE=EPSON
PRINTER_INTERFACE=printer:EPSON TM-T82 Receipt  # Sesuaikan dengan nama printer di Windows
PRINTER_TIMEOUT=5000

# Konfigurasi Arduino
ARDUINO_PORT=COM3  # Sesuaikan dengan COM port di Device Manager
ARDUINO_BAUDRATE=9600

# Konfigurasi Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=parking
DB_USER=postgres
DB_PASSWORD=your_password

# Konfigurasi Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

## Pengembangan

1. Struktur Proyek:
   ```
   parking-client/
   ├── src/
   │   ├── services/
   │   │   ├── printer.service.ts    # Printer thermal dan barcode
   │   │   ├── camera.service.ts     # Integrasi kamera CCTV
   │   │   └── arduino.service.ts    # Kontrol gerbang dan button
   │   ├── utils/
   │   │   ├── logger.ts             # System logging
   │   │   └── ticket.utils.ts       # Utilitas pembuatan tiket
   │   └── index.ts                  # Entry point
   ├── dist/                         # Compiled JavaScript
   ├── logs/                         # Application logs
   │   ├── error.log                 # Error messages
   │   └── combined.log              # All log messages
   ├── captures/                     # Captured images
   ├── .env                          # Environment config
   ├── .env.example                  # Environment template
   └── package.json                  # Dependencies
   ```

## Printer Commands (ESC/POS)

### Barcode Printing Sequence
Urutan perintah untuk mencetak barcode pada printer EPSON TM-T82X:

1. Set posisi HRI (Human Readable Interpretation) di bawah barcode:
   ```
   \x1D\x48\x02
   ```

2. Set tinggi barcode (80 dots):
   ```
   \x1D\x68\x50
   ```

3. Set lebar barcode (multiplier 2):
   ```
   \x1D\x77\x02
   ```

4. Select CODE128 format:
   ```
   \x1D\x6B\x49
   ```

## Maintenance

1. Backup database secara berkala
2. Monitor log files di folder `logs/`
3. Cek disk space untuk captured images
4. Update dependencies secara berkala

## Security

1. Gunakan HTTPS untuk production
2. Ganti default credentials
3. Batasi akses ke API endpoints
4. Monitor log untuk suspicious activities

## Support

Untuk bantuan dan informasi:
- Email: support@rsibna.com
- Phone: (0286) 123456

## Lisensi

MIT License # Node-Thermal
