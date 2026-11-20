FILE ORGANIZER AI 2.0 — BROWSER WEBSITE

RUN ON WINDOWS
1. Extract this ZIP.
2. Open the extracted File_Organizer_AI_Website folder in VS Code.
3. Open Terminal > New Terminal.
4. Run: npx serve .
5. Open the local address shown by the terminal (usually http://localhost:3000).
6. Use current Microsoft Edge or Google Chrome.

FEATURES
- Select one folder explicitly using the browser folder permission picker.
- The app scans file names, extensions, sizes and modified dates in that selected folder and its subfolders.
- Search by filename/type, sort, category filter, large-file and potential duplicate indicators.
- Voice input using the browser Web Speech SpeechRecognition API, with language selection for English (India), Hindi and Telugu.
- Spoken assistant replies using SpeechSynthesis, when the selected language voice is installed in the browser/operating system.
- Typed assistant commands for file names, latest files, large files and potential duplicates.
- Basic Hindi/Telugu command matching and localized assistant response strings. Search matching is metadata/keyword based, not a full conversational AI or translation engine.
- Organization preview and a separate explicit confirmation before moves. Browser support for the file move API varies.
- Dark/light appearance.

IMPORTANT BROWSER LIMITATIONS
- Folder access is limited to the folder(s) the user explicitly selects and grants permission for. A normal website cannot silently scan the whole computer, protected system folders, or arbitrary paths.
- Folder picker support is browser-dependent. Use a recent Edge or Chrome version and serve on localhost or HTTPS. Re-select the folder after a browser restart if permission is no longer available.
- SpeechRecognition is not supported in every browser. In some browsers, recognition sends audio to the browser vendor's online speech service; it may require internet and is not guaranteed to be on-device. Microphone permission is required. Browser/OS speech voices determine which spoken languages are available.
- SpeechSynthesis uses voices installed/provided by the browser or operating system. Hindi/Telugu voices may not be present on every computer.
- A browser website cannot reliably start arbitrary local files in Windows default desktop applications (for example, opening a .docx directly in Microsoft Word) because browsers sandbox local file access and do not expose a general OS-launch API. This version opens supported file content in a browser tab or downloads it. For guaranteed Windows default-app launching, use a signed desktop app (such as Electron) or a separately installed local helper with explicit permissions.
- The assistant searches file names and metadata only; it does not read document contents or send file data to an external AI service.
- Demo files are synthetic examples and cannot be opened.

SAFETY
- Select only folders you want this website to access.
- The app does not upload your files.
- No file is moved until you review the plan and confirm.
- Test organization with copies of non-important files first.
