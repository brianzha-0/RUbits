import type { Route } from "./+types/home";
import { Welcome } from "../../welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "RUbit's" },
    { name: "description", content: "Get Out Of Scrambles Easily" },
  ];
}

export default function Home() {
  return <Welcome />;
}