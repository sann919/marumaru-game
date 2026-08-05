まるまる惑星マージ
====================

【すぐ試す】
index.html をパソコンのブラウザで開いてください。
左右ボタンで位置調整、「ここに落とす」で落下します。
ゲーム画面を指・マウスで横に動かし、離しても落とせます。

【Amazon Fireタブレットで遊ぶ一番簡単な方法】
このフォルダの中身を GitHub Pages などの静的Webホスティングに公開し、
FireタブレットのSilkブラウザで発行されたURLを開きます。

GitHub Pagesの例：
1. GitHubで新しいリポジトリを作る
2. このフォルダ内の全ファイルをアップロードする
3. Settings → Pages
4. Build and deployment の Source を「Deploy from a branch」
5. Branchを main、フォルダを /(root) にして Save
6. 表示されたURLをFireタブレットのSilkブラウザで開く
7. ブックマークに登録する

【オフラインについて】
Web公開後に一度読み込むと、対応ブラウザではゲーム一式がキャッシュされます。
Silkブラウザのバージョンや端末設定により挙動が異なる場合があります。

【ファイル構成】
index.html            ゲーム本体（CSS・JavaScriptを含む）
manifest.webmanifest  ホーム画面アプリ用設定
sw.js                 オフラインキャッシュ
icon-192.png          アイコン
icon-512.png          アイコン
