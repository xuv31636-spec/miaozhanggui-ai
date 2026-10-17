import "./globals.css";

export const metadata = {
  title: "喵掌櫃｜AI 貓咪店長",
  description: "用一隻毒舌又有經營頭腦的貓咪，協助寵物門市發想改善方案。"
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
