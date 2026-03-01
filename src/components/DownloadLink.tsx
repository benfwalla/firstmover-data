'use client';

export default function DownloadLink({ href, filename, children, ...props }: { href: string; filename: string; children: React.ReactNode; [key: string]: any }) {
  return (
    <a
      href={href}
      {...props}
      onClick={(e) => {
        e.preventDefault();
        fetch(href)
          .then(r => r.blob())
          .then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
          });
      }}
    >
      {children}
    </a>
  );
}
