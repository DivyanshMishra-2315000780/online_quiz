SAVE folder contents

- chat_transcript.txt  -> human-readable summary of the session and actions taken
- PROJECT_FILES_LIST.txt -> key file list to help you find edited files
- snapshot_instructions.txt -> instructions for zipping the project locally
- quick_snapshot.ps1 -> PowerShell script to create quiz-application-snapshot.zip (includes client/frontend/SAVE if present)

How to use:
1) From PowerShell run: .\SAVE\quick_snapshot.ps1
2) The script will create `quiz-application-snapshot.zip` one level above the project folder.

If you want me to create the zip now from within this session, confirm and I'll run the zip command (note: may take time and will include folders that exist).