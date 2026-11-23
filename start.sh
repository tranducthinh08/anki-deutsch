#!/usr/bin/env bash
export PATH="/Users/vking34/.nvm/versions/node/v20.20.2/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"

# 1. Mở Anki Desktop nếu chưa mở
open -a "Anki" 2>/dev/null

APP_DIR="/Users/vking34/.gemini/antigravity/scratch/anki-deutsch"
cd "$APP_DIR" || exit 1

# Kiểm tra xem anki-deutsch đã chạy trên port nào chưa (3000, 3002)
is_anki_deutsch() {
    local port=$1
    local res
    res=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${port}/api/anki/today" 2>/dev/null)
    [ "$res" = "200" ] || [ "$res" = "503" ]
}

is_port_in_use() {
    local port=$1
    lsof -i ":${port}" >/dev/null 2>&1
}

TARGET_PORT=3000

if is_anki_deutsch 3000; then
    TARGET_PORT=3000
elif is_anki_deutsch 3002; then
    TARGET_PORT=3002
else
    # Chưa chạy anki-deutsch. Chọn port khả dụng
    if ! is_port_in_use 3000; then
        TARGET_PORT=3000
    elif ! is_port_in_use 3002; then
        TARGET_PORT=3002
    else
        TARGET_PORT=3005
    fi

    nohup npm run dev -- -p "$TARGET_PORT" </dev/null >/tmp/anki-deutsch-dev.log 2>&1 &

    # Chờ server sẵn sàng
    for i in {1..30}; do
        if is_anki_deutsch "$TARGET_PORT"; then
            break
        fi
        sleep 0.5
    done
fi

# Mở trình duyệt vào đúng port của Anki Deutsch
open "http://localhost:${TARGET_PORT}"
