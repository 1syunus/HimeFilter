import "../globals.css"
import {Metadata} from "next"

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="antialiased">
    </section>
  );
}

export const metadata: Metadata = {
  title: "HimeFilter",
  description: "Crunchyroll browse enhancement"
}
