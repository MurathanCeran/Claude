#!/usr/bin/env python3
"""
J.A.R.V.I.S — Yerel Ses Sunucusu
  STT: faster-whisper  (mikrofon sesi -> metin)
  TTS: Kokoro (varsa) yoksa pyttsx3  (metin -> ses)
Hepsi yerel; internet/anahtar gerekmez. CORS açıktır, web uygulaması bağlanır.
Çalıştır:  python server.py   ->  http://localhost:8008
"""
import io
import tempfile
import wave

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel

app = FastAPI(title="JARVIS Local Voice")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)

# ----------------------------------------------------------------------------
# STT — faster-whisper
# ----------------------------------------------------------------------------
_whisper = None
def get_whisper():
    global _whisper
    if _whisper is None:
        from faster_whisper import WhisperModel
        # "base" hız/doğruluk dengesi iyidir; istersen "small" yap.
        _whisper = WhisperModel("base", device="cpu", compute_type="int8")
    return _whisper

# ----------------------------------------------------------------------------
# TTS — önce Kokoro, olmazsa pyttsx3
# ----------------------------------------------------------------------------
_kokoro = None
_tts_kind = None
def get_tts():
    global _kokoro, _tts_kind
    if _tts_kind is not None:
        return _tts_kind
    try:
        from kokoro import KPipeline  # type: ignore
        _kokoro = KPipeline(lang_code="t")  # çok dilli; Türkçe için 't'
        _tts_kind = "kokoro"
    except Exception:
        _tts_kind = "pyttsx3"
    return _tts_kind


class TTSReq(BaseModel):
    text: str
    voice: str | None = None


@app.get("/health")
def health():
    return {
        "ok": True,
        "stt": "faster-whisper",
        "tts": get_tts(),
        "service": "jarvis-local-voice",
    }


@app.post("/stt")
async def stt(audio: UploadFile = File(...)):
    """Ses dosyası (webm/wav/ogg/m4a) -> {text}."""
    data = await audio.read()
    with tempfile.NamedTemporaryFile(suffix=".bin", delete=True) as f:
        f.write(data); f.flush()
        model = get_whisper()
        segments, info = model.transcribe(f.name, language="tr", vad_filter=True)
        text = "".join(seg.text for seg in segments).strip()
    return {"text": text, "lang": getattr(info, "language", "tr")}


@app.post("/tts")
def tts(req: TTSReq):
    """Metin -> WAV ses baytları."""
    kind = get_tts()
    text = (req.text or "").strip()
    if not text:
        return JSONResponse({"error": "empty"}, status_code=400)

    if kind == "kokoro":
        import numpy as np
        import soundfile as sf
        audio_chunks = []
        for _, _, audio in _kokoro(text, voice=req.voice or "af_heart"):
            audio_chunks.append(audio)
        wav = np.concatenate(audio_chunks) if audio_chunks else np.zeros(1)
        buf = io.BytesIO()
        sf.write(buf, wav, 24000, format="WAV")
        return Response(content=buf.getvalue(), media_type="audio/wav")

    # Yedek: pyttsx3 -> wav dosyası
    import pyttsx3
    engine = pyttsx3.init()
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        path = f.name
    engine.save_to_file(text, path)
    engine.runAndWait()
    with open(path, "rb") as fh:
        return Response(content=fh.read(), media_type="audio/wav")


if __name__ == "__main__":
    import uvicorn
    print("JARVIS yerel ses sunucusu -> http://localhost:8008  (CTRL+C ile durdur)")
    uvicorn.run(app, host="0.0.0.0", port=8008)
