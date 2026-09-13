import { useSelector } from "react-redux";

export default function Number() {
  const phone = useSelector((state) => state.settings.phone);

  return (
    <a href={`tel:${phone}`} className="hover:text-primary transition">
      {phone}
    </a>
  );
}