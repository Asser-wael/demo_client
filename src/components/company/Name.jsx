import { useSelector } from "react-redux";

export default function Name() {
  const name = useSelector((state) => state.settings.company.name);
  return name;
}