import type { Metadata } from "next";
import { Bricolage_Grotesque, Public_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const fonteTexto = Public_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const fonteTitulo = Bricolage_Grotesque({
  variable: "--font-titulo",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Despensa CAPE",
  description: "Controle de estoque e validade da cozinha do colégio",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${fonteTexto.variable} ${fonteTitulo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          theme="light"
          position="top-center"
          toastOptions={{
            classNames: {
              toast: "!text-base !text-foreground !border-input",
              error: "!bg-perigo-fundo !text-destructive",
              success: "!bg-ok-fundo",
            },
          }}
        />
      </body>
    </html>
  );
}
