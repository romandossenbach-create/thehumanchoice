"use client";

import { Flame } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "../i18n";
import { SubpageHeader } from "../subpage-header";
import { motivationContent } from "./content";

export default function MotivationPage() {
  const { language, setLanguage, t } = useLanguage();
  const content = motivationContent[language];
  return <main className="worldRecordsPage">
    <SubpageHeader language={language} setLanguage={setLanguage} loginLabel={t("login")} logoutLabel={t("logout")} />
    <section className="worldRecordsHero"><p className="eyebrow"><Flame size={17}/> {t("motivation")}</p><h1>{t("motivationTitle")}</h1><p>{t("motivationIntro")}</p></section>
    <section className="goldenRules" aria-label={content.goldenRulesTitle}>
      <Accordion type="single" collapsible>
        <AccordionItem value="golden-rules">
          <AccordionTrigger className="goldenRulesTrigger"><span><b>10</b> {content.goldenRulesTitle}</span></AccordionTrigger>
          <AccordionContent className="goldenRulesContent">
            <ol>{content.goldenRules.map(([title, text], index) => <li key={title}><span>{index + 1}</span><p><strong>{title}</strong>{text}</p></li>)}</ol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
    <section className="motivationGrid" aria-label={t("motivationTitle")}>{content.quotes.map((quote,index)=><article key={quote}><span>{String(index+1).padStart(2,"0")}</span><p>{quote}</p></article>)}</section>
  </main>;
}
