# Echo
Voice-first AI companion. Flutter app, Next.js site, NestJS API (Groq). No Firebase.

## Run
API:     cd apps/api && cp .env.example .env && npm i && npm run start:dev   (port 4000)
Website: cd apps/website && npm i && npm run dev                              (port 3000)
Mobile:  cd apps/mobile && flutter create . --project-name echo && flutter pub get \
         && flutter run --dart-define=API_URL=http://10.0.2.2:4000/api/v1

After `flutter create .`, add platform permissions (see docs/PROJECT.md section "Mobile permissions").
Verify Groq model IDs, accepted audio formats and the hugeicons package API before release.
