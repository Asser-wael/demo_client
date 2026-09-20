import { useSelector } from "react-redux";

export default function PhoneNumber({ className = "" }) {
  const phone = useSelector((state) => state.settings.phone);

  if (!phone) return null;

  return (
    <a href={`tel:${phone}`} className={`hover:text-primary transition ${className}`}>
      {phone}
    </a>
  );
}
