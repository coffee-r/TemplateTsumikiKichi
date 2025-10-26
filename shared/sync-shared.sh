#!/bin/bash
# sync-shared.sh
# shared/tsumiki-capture.js を各ゲームエンジンのテンプレートにコピーする

set -e

# スクリプトのあるディレクトリに移動
cd "$(dirname "$0")/.."

SHARED_JS="shared/tsumiki-capture.js"

# Unity: コピー先のリスト
UNITY_TARGETS=(
  "Unity/WebGLTemplates/TsumikiKichiNoFullscreen/TemplateData/tsumiki-capture.js"
  "Unity/WebGLTemplates/TsumikiKichiWithFullscreen/TemplateData/tsumiki-capture.js"
)

# Godot: インライン化するファイルのリスト
GODOT_TARGETS=(
  "Godot4/no_fullscreen/index.html"
  "Godot4/with_fullscreen/index.html"
)

echo "🔄 Syncing tsumiki-capture.js from shared/..."
echo ""

# shared/tsumiki-capture.js が存在するかチェック
if [ ! -f "$SHARED_JS" ]; then
  echo "❌ Error: $SHARED_JS not found"
  exit 1
fi

# ==========================================
# Unity: 外部ファイルとしてコピー
# ==========================================
echo "📦 Unity templates (external script file):"

for target in "${UNITY_TARGETS[@]}"; do
  # ディレクトリが存在するか確認
  target_dir=$(dirname "$target")
  if [ ! -d "$target_dir" ]; then
    echo "⚠️  Warning: Directory not found: $target_dir"
    echo "   Creating directory..."
    mkdir -p "$target_dir"
  fi
  
  # コピー実行
  cp "$SHARED_JS" "$target"
  echo "  ✓ $target"
done

echo ""

# ==========================================
# Godot: インライン化
# ==========================================
echo "📦 Godot templates (inline script):"

for target in "${GODOT_TARGETS[@]}"; do
  if [ ! -f "$target" ]; then
    echo "⚠️  Warning: File not found: $target"
    continue
  fi

  # マーカー間のスクリプトを置き換え
  # インデントを検出
  INDENT=$(grep "<!-- START: TsumikiKichi Video Capture Script -->" "$target" | sed 's/<!-- START: TsumikiKichi Video Capture Script -->.*//')

  # 一時ファイルを作成
  TEMP_FILE=$(mktemp)

  # マーカーの前の部分を出力
  sed -n '1,/<!-- START: TsumikiKichi Video Capture Script -->/p' "$target" | sed '$d' > "$TEMP_FILE"

  # 新しいスクリプトセクションを出力
  echo "${INDENT}<!-- START: TsumikiKichi Video Capture Script -->" >> "$TEMP_FILE"
  echo "${INDENT}<!-- This section is automatically updated by sync-shared.sh -->" >> "$TEMP_FILE"
  echo "${INDENT}<script>" >> "$TEMP_FILE"

  # JavaScriptファイルの内容を各行にインデントを追加して出力
  while IFS= read -r line; do
    echo "${INDENT}$line" >> "$TEMP_FILE"
  done < "$SHARED_JS"

  echo "${INDENT}</script>" >> "$TEMP_FILE"
  echo "${INDENT}<!-- END: TsumikiKichi Video Capture Script -->" >> "$TEMP_FILE"

  # マーカーの後の部分を出力
  sed -n '/<!-- END: TsumikiKichi Video Capture Script -->/,$p' "$target" | sed '1d' >> "$TEMP_FILE"

  # 元のファイルを置き換え
  mv "$TEMP_FILE" "$target"

  echo "  ✓ $target (inlined)"
done

echo ""
echo "✅ Sync complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Test the changes"
echo "  2. git add -A"
echo "  3. git commit -m 'sync: update tsumiki-capture.js'"
echo "  4. git push"
