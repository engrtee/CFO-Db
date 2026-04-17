# pip install pandas sqlalchemy psycopg2-binary openpyxl watchdog
import os
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from caseware_ingest import ingest_file

WATCH_DIR = r"C:\Users\USER\Zenith\Communication site - Documents\CasewareExport"
# Prompt user for password if passing via environment is not setup
DB_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:password@localhost:5432/FinancialDB")

class CasewareHandler(FileSystemEventHandler):
    def on_created(self, event):
        self.process(event)

    def on_modified(self, event):
        self.process(event)

    def process(self, event):
        if event.is_directory:
            return
        
        filepath = event.src_path
        if filepath.endswith('.xlsx') and not os.path.basename(filepath).startswith('~$'):
            print(f"\n📂 Detected file activity: {filepath}")
            print("⏳ Waiting 3 seconds for SharePoint sync to complete...")
            time.sleep(3)
            
            print("▶️ Starting ingestion...")
            ingest_file(filepath, DB_URL)

def main():
    print("=" * 60)
    print("👀 CaseWare Folder Watcher Started")
    print(f"📁 Watching: {WATCH_DIR}")
    print("=" * 60)
    
    if not os.path.exists(WATCH_DIR):
        print(f"❌ Warning: Folder {WATCH_DIR} does not exist yet.")
        print("Creating folder to watch...")
        os.makedirs(WATCH_DIR, exist_ok=True)
        
    event_handler = CasewareHandler()
    observer = Observer()
    observer.schedule(event_handler, WATCH_DIR, recursive=False)
    observer.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        print("\n🛑 Watcher stopped.")
    observer.join()

if __name__ == "__main__":
    main()
