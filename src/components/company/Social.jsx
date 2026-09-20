import { useSelector } from "react-redux";

const ICONS = {
  instagram: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle
        cx="17.5"
        cy="6.5"
        r="1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  ),

  tiktok: (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path d="M14 3c.4 2.2 1.9 3.8 4 4.2v2.6c-1.5 0-2.9-.5-4-1.3v6.2a5.4 5.4 0 1 1-5.4-5.4c.3 0 .6 0 .9.1v2.7a2.7 2.7 0 1 0 1.9 2.6V3h2.6z" />
    </svg>
  ),

  facebook: (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.5 1.6-1.5H17V3.7C16.4 3.6 15.4 3.5 14.3 3.5c-2.4 0-4 1.4-4 4.1v2.3H7.5V13h2.8v8h3.2z" />
    </svg>
  ),

  whatsapp: (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path d="M20.5 3.5A10 10 0 0 0 3.9 16L3 21l5.2-.9a10 10 0 0 0 12.3-16.6zM12 19.3a7.3 7.3 0 0 1-3.7-1l-.3-.2-2.7.5.5-2.6-.2-.3A7.3 7.3 0 1 1 12 19.3zm4-5.5c-.2-.1-1.3-.6-1.5-.7-.2-.1-.3-.1-.5.1-.1.2-.5.7-.6.8-.1.1-.2.1-.4 0a6 6 0 0 1-3-2.6c-.2-.4.2-.4.6-1.3.1-.1 0-.3 0-.4l-.6-1.5c-.2-.4-.3-.3-.5-.3h-.4c-.1 0-.4 0-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.1 1.6 2.5 3.9 3.4.5.2.9.3 1.3.4.5-.2 1-.1 1.4.1.4-.1 1.3-.5 1.5-1 .2-.5.2-.9.1-1z" />
    </svg>
  ),
};

export default function Social({ className = "", itemClassName = "text-muted transition hover:text-primary" }) {
  const social = useSelector(
    (state) => state.settings.social
  );

  const items = [
    {
      key: "instagram",
      href: social?.instagram,
    },
    {
      key: "tiktok",
      href: social?.tiktok,
    },
    {
      key: "facebook",
      href: social?.facebook,
    },
    {
      key: "whatsapp",
      href: social?.whatsapp
        ? `https://wa.me/${social.whatsapp}`
        : "",
    },
  ].filter((item) => item.href);

  if (!items.length) return null;

  return (
    <div
      className={`flex items-center gap-4 ${className}`}
    >
      {items.map(({ key, href }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={key}
          className={itemClassName}
        >
          {ICONS[key]}
        </a>
      ))}
    </div>
  );
}