import type { Metadata } from "next";
import { Baloo_2 } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BotaoWhatsAppFlutuante } from "@/components/BotaoWhatsAppFlutuante";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "R&R Moda Baby e Infantil",
  description:
    "Enxoval para o bebê, kids e teen. Varejo e atacado. Escolha, adicione ao carrinho e finalize pelo WhatsApp.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${baloo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <BotaoWhatsAppFlutuante />
        </CartProvider>
      </body>
    </html>
  );
}
