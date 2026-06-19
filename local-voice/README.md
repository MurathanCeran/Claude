# J.A.R.V.I.S — Yerel Ses Sunucusu (faster-whisper + Kokoro)

Fotolardaki **STEP 3 / THE VOICE** adımının çalışan hâli: mikrofon → **faster-whisper** (yerel STT) ve metin → **Kokoro** (yerel TTS). Kulaklar + ağız %100 yerel kalır; internet/anahtar gerekmez.

Bu sunucu **bir bilgisayarda** çalışır (Mac/Windows/Linux). Jarvis web uygulaması açıldığında otomatik olarak bu sunucuyu arar; bulursa sesi ondan üretir, bulamazsa tarayıcı sesini kullanır.

## Kurulum

```bash
cd local-voice
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python server.py
```

İlk çalıştırmada modeller indirilir (faster-whisper "base", Kokoro sesi). Sunucu şurada açılır: **http://localhost:8008**

Sağlık kontrolü: tarayıcıda `http://localhost:8008/health` → `{"ok": true, ...}`

## Web uygulamasıyla bağlama

1. Sunucuyu çalıştır (yukarıdaki gibi).
2. Jarvis'i **aynı bilgisayarda** Chrome/Edge ile aç: https://murathanceran.github.io/Claude/
3. Jarvis otomatik bağlanır — HUD'da **Ses: Yerel** yazar, alt sağda **🎤 Bas-konuş** düğmesi çıkar.
4. Konuşmak için düğmeye basılı tut, bırakınca yerel whisper çözer.

### Telefondan kullanmak (ileri seviye)
Telefon `localhost`'a erişemez. Sunucuyu bilgisayarında çalıştırıp telefonu **aynı Wi-Fi**'ye bağla, sonra Jarvis panelinden ses sunucusu adresini bilgisayarının yerel IP'siyle değiştir (ör. `http://192.168.1.20:8008`). Mikrofon erişimi için HTTPS gerekebilir; bu yüzden en kolay kullanım masaüstüdür.

## Notlar
- Kokoro kurulamazsa sunucu otomatik olarak sistem TTS'ine (pyttsx3) düşer; yine yerel çalışır.
- Tümü açık kaynak ve ücretsizdir.
