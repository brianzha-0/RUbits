import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "RUbit's" },
    { name: "description", content: "Getting Out Of Scrambles Easier" },
  ];
}

export default function Home() {
  return <Welcome />;
}