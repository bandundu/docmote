# Docmote

Minimal macOS desktop client for [Docmost](https://docmost.com) — the open-source collaborative wiki and documentation platform.

Docmote lets you run your personal or team-hosted **Docmost instance** as a native macOS app with clean system integration and a focused UI.

---

### ✨ Features

- 🧭 macOS-style window behavior with drag regions and traffic lights
- 💾 Persistent custom instance URL (entered once on first launch)


<img width="1245" alt="image" src="https://github.com/user-attachments/assets/0c08a259-43ff-4cac-8e40-db59cf42c0f0" />

---

### 📦 Download

Grab the latest release here:  
[**Download Docmote for macOS**](https://github.com/bandundu/docmote/releases/tag/v1.0.0)

Supports Apple Silicon (`.dmg`, arm64).

The app is not notarized. If macOS says "Docmote is damaged", run:

```sh
sudo xattr -rd com.apple.quarantine "/Applications/Docmote.app"
sudo codesign --force --deep --sign - "/Applications/Docmote.app"
```

---

### 📄 License

This project is MIT licensed.

It wraps the [Docmost](https://github.com/docmost/docmost) web platform, which is licensed under AGPL 3.0.
