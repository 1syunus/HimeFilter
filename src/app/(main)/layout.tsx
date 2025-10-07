import "../globals.css"
import {Metadata} from "next"
import Script from "next/script"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* YouTue Iframe API */}
        <Script
          src="https://www.youtube.com/iframe_api"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "HimeFilter",
  description: "Crunchyroll browse enhancement"
}
