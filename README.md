# NewAITees

![メインビジュアル的な画像のイメージ](./assets/images/247-958349849-0-12.png)

AIアートやプログラミング、ゲーム配信など、多彩な活動を集約した私の個人プロジェクトです。  
アートギャラリーを眺めたり、配信先リンクを通じて一緒に遊んだり、自由に楽しんでください。

各情報はGithub Pagesでも公開中です
[トップページ](https://newaitees.github.io/NewAITees/)

> **[English Version is here](README_EN.md)**

<style>.pp-DL5N46C4CBFKY{text-align:center;border:none;border-radius:0.25rem;min-width:11.625rem;padding:0 2rem;height:2.625rem;font-weight:bold;background-color:#FFD140;color:#000000;font-family:"Helvetica Neue",Arial,sans-serif;font-size:1rem;line-height:1.25rem;cursor:pointer;}</style>
<form action="https://www.paypal.com/ncp/payment/DL5N46C4CBFKY" method="post" target="_blank" style="display:inline-grid;justify-items:center;align-content:start;gap:0.5rem;">
  <input class="pp-DL5N46C4CBFKY" type="submit" value="One time donation" />
  <img src=https://www.paypalobjects.com/images/Debit_Credit_APM.svg alt="cards" />
  <section> Powered by <img src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg" alt="paypal" style="height:0.875rem;vertical-align:middle;"/></section>
</form>

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

Github Pagesで現在ギャラリーを公開中です
[Gallery](https://newaitees.github.io/NewAITees/gallery.html)

---

## プログラミング活動
主にAITuberや、生成AI、ModelContextProtocol（MCP）などの分野にかかわるプログラミング活動を行っています。

例
- [TaskMateAI](https://github.com/NewAITees/TaskMateAI)
    - AI用タスク管理ツール：AIエージェントのタスク管理を効率化するWebアプリケーション
- AItuber用アプリ：バーチャルYouTuber向けのAI応答生成システム
- 生成AI用ツール：Stable Diffusionなどの生成AIモデルを活用した画像生成補助ツール


## 配信活動
現在Twitchにて、AITuberや生成AI、AICodingといった活動を配信しています。
登録していただければ、AI画像を一枚プレゼントします。

[Twitch](https://twitch.tv/japaneseotakuprogrammer)

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
