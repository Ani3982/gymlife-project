"""
GymLife PostgreSQL / Supabase Migration & Verification Tool
------------------------------------------------------------
Usage:
    python migrate_to_postgres.py [--database-url <SUPABASE_POSTGRES_URL>]

This automated tool:
1. Verifies the JSON data backup fixture (gymlife_backup.json).
2. Connects to the Supabase / PostgreSQL instance via DATABASE_URL.
3. Applies all schema migrations (python manage.py migrate).
4. Loads the dataset into PostgreSQL (python manage.py loaddata).
5. Runs complete row-by-row and relational integrity verification.
"""

import os
import sys
import argparse
import django
from pathlib import Path

# Ensure standard UTF-8 stream handling on Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

BASE_DIR = Path(__file__).resolve().parent
BACKUP_FILE = BASE_DIR / 'gymlife_backup.json'
SQLITE_DB = BASE_DIR / 'db.sqlite3'


def main():
    parser = argparse.ArgumentParser(description="Migrate GymLife database to Supabase / PostgreSQL")
    parser.add_argument("--database-url", help="PostgreSQL connection URL", default=None)
    parser.add_argument("--backup-file", help="Path to JSON backup fixture", default=str(BACKUP_FILE))
    args = parser.parse_args()

    backup_path = Path(args.backup_file)
    if not backup_path.exists():
        print(f"[ERROR] Backup fixture not found at {backup_path}")
        print("Run: python manage.py dumpdata --natural-foreign --natural-primary -e contenttypes -e auth.Permission --indent 2 -o gymlife_backup.json")
        sys.exit(1)

    print("=================================================================")
    print("      GymLife Supabase PostgreSQL Automated Migration Engine     ")
    print("=================================================================")

    # Initialize Django environment
    os.environ['DJANGO_SETTINGS_MODULE'] = 'gymlife_project.settings'
    
    # Check for target PostgreSQL connection string
    pg_url = args.database_url or os.environ.get('POSTGRES_DATABASE_URL') or os.environ.get('DATABASE_URL')
    
    if not pg_url or pg_url.startswith('sqlite'):
        print("\n[STEP 1/3] Local SQLite Baseline Verification:")
        os.environ['DATABASE_URL'] = f"sqlite:///{SQLITE_DB}"
        django.setup()
        from django.core.management import call_command
        call_command('verify_database_migration', backup_file=str(backup_path))
        print("\n[READY FOR SUPABASE MIGRATION]")
        print("To migrate your data to Supabase / PostgreSQL, provide your connection URL:")
        print("    python migrate_to_postgres.py --database-url 'postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require'")
        return

    # Execute Migration to PostgreSQL / Supabase
    print(f"\n[STEP 1/3] Connecting to PostgreSQL at: {pg_url.split('@')[-1]} ...")
    os.environ['DATABASE_URL'] = pg_url

    django.setup()
    from django.conf import settings
    import dj_database_url
    from django.db import connections
    connections.close_all()
    
    parsed_config = dj_database_url.parse(pg_url)
    parsed_config['CONN_MAX_AGE'] = 600
    parsed_config['CONN_HEALTH_CHECKS'] = True
    settings.DATABASES['default'] = parsed_config

    from django.core.management import call_command

    print("\n[STEP 2/3] Applying schema migrations & loading data...")
    call_command('migrate', interactive=False)
    call_command('loaddata', str(backup_path), interactive=False)

    print("\n[STEP 3/3] Running Row Count & Relational Integrity Verification...")
    call_command('verify_database_migration', backup_file=str(backup_path))

    print("\n[SUCCESS] Supabase PostgreSQL migration and verification completed!")


if __name__ == '__main__':
    main()
