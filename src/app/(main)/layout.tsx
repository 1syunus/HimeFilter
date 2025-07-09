import "../globals.css"
import {Metadata} from "next"

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="antialiased">
      {children}
    </section>
  );
}

export const metadata: Metadata = {
  title: "HimeFilter",
  description: "Crunchyroll browse enhancement"
}
