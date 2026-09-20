import { useSelector } from "react-redux";

export default function Address({ className = "" }) {
  const address = useSelector(
    (state) => state.settings.company?.address
  );

  if (!address) return null;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {address}
    </a>
  );
}
