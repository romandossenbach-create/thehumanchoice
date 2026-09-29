"use client";

import { ArrowLeft } from "lucide-react";
import { type Language } from "./i18n";

type Props = {
  language: Language;
  setLanguage: (language: Language) => void;
  loginLabel: string;
  logoutLabel: string;
  showAccount?: boolean;
};

export function SubpageHeader({}: Props) {
  return <header className="subpageTopbar">
    <a href="/" className="subpageHome" title="Zurück" aria-label="Zurück"><ArrowLeft size={22}/></a>
  </header>;
}
