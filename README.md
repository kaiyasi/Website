# Kaiyasi Website

Kaiyasi 的個人入口網站，以數位名片盒呈現 Profile、Selected Work、Journey 與 Contact。正式網址設定為 `https://gonets.top`，內容由 `https://blog.gonets.top/api/profile.json` 提供，並保留建置時快照作為離線備援。

## Development

```sh
npm install
npm run dev
```

正式建置與瀏覽器測試：

```sh
npm run build
npm run test:e2e
```

從 Blog API 更新內建快照：

```sh
npm run sync:profile
```
