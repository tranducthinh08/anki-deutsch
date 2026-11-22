#!/usr/bin/env bash
export PATH="/Users/vking34/.nvm/versions/node/v20.20.2/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"

# 1. Mở Anki Desktop nếu chưa mở
open -a "Anki" 2>/dev/null

# 2. Kiểm tra nếu dev server chưa chạy thì khởi động
if ! curl -s http://localhost:3000 >/dev/null 2>&1; then
    cd /Users/vking34/.gemini/antigravity/scratch/anki-deutsch
    nohup npm run dev </dev/null >/tmp/anki-deutsch-dev.log 2>&1 &
    
    # Chờ server sẵn sàng (tối đa 10s)
    for i in {1..20}; do
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            break
        fi
        sleep 0.5
    done
fi

# 3. Mở trình duyệt vào app
open "http://localhost:3000"
