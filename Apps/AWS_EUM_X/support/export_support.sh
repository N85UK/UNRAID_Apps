#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT_DIR/support-bundle-$(date -u +%Y%m%dT%H%M%SZ).tgz"
cd "$ROOT_DIR"

echo "Collecting logs and config into $OUT"
mkdir -p /tmp/eum-support
cp -a data /tmp/eum-support/ 2>/dev/null || true
cp -a public /tmp/eum-support/ 2>/dev/null || true
cp -a views /tmp/eum-support/ 2>/dev/null || true

# Sanitize configuration before adding to support bundle (remove AWS secrets)
if [ -f "$ROOT_DIR/data/messages.db" ]; then
  node -e "const Database=require('better-sqlite3');const fs=require('fs');const db=new Database(process.argv[1]);try{const row=db.prepare('SELECT v FROM config WHERE k=?').get('config');const cfg=row?JSON.parse(row.v||'{}'):{};['AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY','AWS_SESSION_TOKEN','aws_access_key_id','aws_secret_access_key','aws_session_token'].forEach(k=>delete cfg[k]);fs.writeFileSync('/tmp/eum-support/config.json', JSON.stringify(cfg,null,2));}catch(e){/* ignore */}finally{db.close();}}" "$ROOT_DIR/data/messages.db"
elif [ -f "$ROOT_DIR/data/config.json" ]; then
  node -e "const fs=require('fs');const p=process.argv[1];try{const cfg=JSON.parse(fs.readFileSync(p,'utf8')||'{}');['AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY','AWS_SESSION_TOKEN','aws_access_key_id','aws_secret_access_key','aws_session_token'].forEach(k=>delete cfg[k]);fs.writeFileSync('/tmp/eum-support/config.json', JSON.stringify(cfg,null,2));}catch(e){}" "$ROOT_DIR/data/config.json"
fi

tar czf "$OUT" -C /tmp eum-support || true
rm -rf /tmp/eum-support || true

echo "Created support bundle: $OUT"
