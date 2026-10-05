# Echo project notes
Source of truth: Echo Project Documentation v2.0. Endpoints implemented: GET /api/v1/health, POST /api/v1/voice/turn, POST /api/v1/chat.
Not implemented yet (by design): database, auth, conversations endpoints.

## Mobile permissions
Android: add `<uses-permission android:name="android.permission.RECORD_AUDIO"/>` and `INTERNET` to AndroidManifest.xml.
iOS: add `NSMicrophoneUsageDescription` to Info.plist ("Echo uses the microphone to hear your requests. Audio is sent to our server and an AI provider for processing.").
