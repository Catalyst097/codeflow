import "./globals.css";

export const metadata = {
  title: "CodeFlow by SystemicLogics — Code to Diagram Generator",
  description: "Convert Python, JavaScript, Java and C++ code into beautiful flowcharts instantly. Free tool by SystemicLogics for students and developers.",
  keywords: "code to diagram, flowchart generator, code visualizer, python flowchart, javascript diagram, free coding tool",
  authors: [{ name: "SystemicLogics" }],
  openGraph: {
    title: "CodeFlow by SystemicLogics — Code to Diagram Generator",
    description: "Convert your code into beautiful flowcharts instantly. Free forever.",
    url: "https://www.systemiclogics.com",
    siteName: "SystemicLogics",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeFlow by SystemicLogics",
    description: "Convert your code into beautiful flowcharts instantly. Free forever.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}