import {
  PiSquaresFourDuotone,
  PiShoppingBagDuotone,
  PiPackageDuotone,
  PiTagDuotone,
  PiUsersDuotone,
  PiStarDuotone,
  PiShieldCheckDuotone,
  PiArrowLeftDuotone,
} from "react-icons/pi";

export const menuItems = [
  { id: 1, title: "Dashboard", icon: <PiSquaresFourDuotone />, to: "/admin" },
  { id: 2, title: "Orders", icon: <PiShoppingBagDuotone />, to: "/admin/orders" },
  { id: 3, title: "Products", icon: <PiPackageDuotone />, to: "/admin/products" },
  { id: 4, title: "Categories", icon: <PiTagDuotone />, to: "/admin/categories" },
  { id: 5, title: "Users", icon: <PiUsersDuotone />, to: "/admin/users" },
  { id: 6, title: "Popular", icon: <PiStarDuotone />, to: "/admin/popular" },
  { id: 7, title: "Trust Page", icon: <PiShieldCheckDuotone />, to: "/admin/trust" },
  { id: 8, title: "Back to Store", icon: <PiArrowLeftDuotone />, to: "/" },
];