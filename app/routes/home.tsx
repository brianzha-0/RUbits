import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "RUbit's" },
    { name: "description", content: "Get Out Of Scrambles Even faster and more fun!" },
  ];
}

export default function Home() {
  return <Welcome />;
}