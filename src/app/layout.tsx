import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alma Centro de Bienestar",
  description: "Clases y tratamientos para reconectar con tu bienestar.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
