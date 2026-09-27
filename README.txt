Mongkol Mai - Save + Help Center Fix

Replace these files in the existing project folder:
- app.js
- index.html
- style.css

firestore.rules is included as a reference; publish it to Firebase only if it matches your intended rules.

Main fixes:
1. savePlant() requires Admin and shows a clear permission message.
2. New plants are saved to Firestore using the plant ID (A01/B01/...) as document ID.
3. Firestore onSnapshot automatically moves saved plants into the Library and category counts.
4. Members are redirected to the Library after login.
5. Added Help button in the header and Help Center modal.


MONGKOL MAI UI 3.0
- Midnight contrast refresh
- Theme chooser: Default / Lavender / NaturSun / Midnight
- Navigation layout: top bar / left sidebar
- Support inbox restricted to BENYAPA (Display Name: benyapabaibuaw, Email: benyapabaibuaw@gmail.com)
- Firestore Rules updated for support inbox recipient restriction
