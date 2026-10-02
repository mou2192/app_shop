#!/usr/bin/env bash
set -euo pipefail
SOURCE_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET_DIR="${1:-.}"
mkdir -p "$TARGET_DIR"
rsync -a --exclude='.git/' --exclude='node_modules/' --exclude='dist/' --exclude='.env' --exclude='.env.*' "$SOURCE_DIR/" "$TARGET_DIR/"
echo "تم نسخ ملفات دفتر الزهوب إلى: $TARGET_DIR"
