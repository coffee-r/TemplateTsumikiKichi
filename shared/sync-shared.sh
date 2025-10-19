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
  "Godot/no_fullscreen/index.html"
  "Godot/with_fullscreen/index.html"
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

# JavaScriptファイルの内容を読み込み
JS_CONTENT=$(cat "$SHARED_JS")

for target in "${GODOT_TARGETS[@]}"; do
  if [ ! -f "$target" ]; then
    echo "⚠️  Warning: File not found: $target"
    continue
  fi
  
  # マーカー間のスクリプトを置き換え
  # 一時ファイルを使用
  temp_file="${target}.tmp"
  
  # Perlを使ってマーカー間を置き換え（awkより改行処理が安定）
  perl -i.bak -pe '
    BEGIN {
      # JavaScriptファイルの内容を読み込み
      open(my $js_fh, "<", "'"$SHARED_JS"'") or die "Cannot open '"$SHARED_JS"': $!";
      local $/;
      $js_content = <$js_fh>;
      close($js_fh);
      $in_block = 0;
    }
    
    if (/<!-- START: TsumikiKichi Video Capture Script -->/) {
      # インデントを検出
      /^(\s*)/;
      $indent = $1;
      
      # マーカーと開始タグを出力
      print;
      print "${indent}<!-- This section is automatically updated by sync-shared.sh -->\n";
      print "${indent}<script>\n";
      
      # JavaScriptの内容を行ごとに出力
      foreach my $line (split(/\n/, $js_content)) {
        print "${indent}$line\n";
      }
      
      print "${indent}</script>\n";
      
      $in_block = 1;
      $_ = "";  # 現在行をスキップ
    }
    elsif (/<!-- END: TsumikiKichi Video Capture Script -->/) {
      $in_block = 0;
      # ENDマーカーは出力
    }
    elsif ($in_block) {
      $_ = "";  # ブロック内の既存内容をスキップ
    }
  ' "$target"
  
  # バックアップファイルを削除
  rm -f "${target}.bak"
  
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
