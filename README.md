
# NewAITees

![メインビジュアル的な画像のイメージ](./assets/images/247-958349849-0-12.png)

AIアートやプログラミング、ゲーム配信など、多彩な活動を集約した私の個人プロジェクトです。  
アートギャラリーを眺めたり、配信先リンクを通じて一緒に遊んだり、自由に楽しんでください。

> **[English Version is here ](README_EN.md)**

---

## ギャラリー

### 過去作品例
<div align="center">
  <img src="./assets/gallery/abstract_image/1-349826620-1-2-12-pyramid foodvisor and abstract and gradient.png" alt="abstract work" width="30%" />
  <img src="./assets/gallery/botanical/15-652812947-4-12.png" alt="botanical work" width="30%" />
  <img src="./assets/gallery/bottled_image/27-78418751-3-16.png" alt="bottled images" width="30%" />
  <img src="./assets/gallery/horror/25-1281319717-3-8.png" alt="horror work" width="30%" />
  <img src="./assets/gallery/joke/1-2122497130-2-8.png" alt="joke work" width="30%" />
  <img src="./assets/gallery/monochrome/0-1420753085-45-8-12-nosferatu and warewolf.png" alt="monochrome work" width="30%" />
</div>

**画像をクリックすると拡大表示や詳細が見られるようになる予定です。**  
フィルタリング機能で、カテゴリ別に切り替えられるUIを開発中です。

---

## プログラミング活動

- **Webアプリやツール**  
  Web技術を使って、AIアートの生成補助や管理ツールを作っています。  
- **コードサンプル**  
  フロントエンドやPythonスクリプトなど、ちょっとしたコードを公開中。  
  気になるものがあればForkして遊んでみてください。

---

## ゲーム配信

- **配信スケジュール**  
  時々平日の午前中を中心に、アクション・RPGなど幅広いジャンルのゲームを配信中！  
- **アーカイブ**  
  配信を見逃したときは、Twitchのアーカイブでご覧になれます。

---

## SNS & 連絡先

- **Twitch**: [@JapaneseOtakuProgrammer](https://www.twitch.tv/japaneseotakuprogrammer)  
- **Instagram**: [@NewAITees](https://www.instagram.com/new_ai_tees/)  
- **Email**: NewAITees@gmail.com  

ご意見やご感想、コラボのご相談など、お気軽にご連絡ください。

---

## 開発者向け情報

> こちらはあくまで簡単にまとめたものです。詳しい要件は [PRD](./docs/PRD.md) を参照してください。

- **ローカルで閲覧する場合**  
  ```bash
  git clone https://github.com/yourusername/NewAITees.git
  cd NewAITees

  node gallery-generator.js

  npx http-server . # など、お好みのローカルサーバを利用
  ```
- **多言語対応**  
  `navigator.language`を参考に自動判定し、切り替えUIを設置する予定です。  
- **フィルタリング機能**  
  JSでカテゴリを切り替え、DOM要素の表示・非表示を制御する実装を計画しています。

---

© 2025 NewAITees. All rights reserved.  
作品の再利用・再配布などはご相談をお願いいたします。  