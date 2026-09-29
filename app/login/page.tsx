"use client";

import { FormEvent, useEffect, useState } from "react";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../supabase-config";
import { clearSession, initializeSession, saveSession } from "../auth-client";
import { Checkbox } from "@/components/ui/checkbox";
import { Globe2, HelpCircle } from "lucide-react";
import { languages, useLanguage } from "../i18n";

export default function LoginPage() {
  const { language, setLanguage, t } = useLanguage();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signedInEmail, setSignedInEmail] = useState("");
  const [message, setMessage] = useState("");
  const [healthAccepted, setHealthAccepted] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [gender, setGender] = useState<"male"|"female"|"">("");
  const [mfa, setMfa] = useState<{ factorId:string; challengeId:string; qrCode?:string; secret?:string } | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  async function startAdminMfa(accessToken:string) {
    const headers = { apikey:SUPABASE_ANON_KEY, authorization:`Bearer ${accessToken}`, "content-type":"application/json" };
    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers });
    const user = await userResponse.json() as { id?:string; email?:string; factors?:Array<{ id:string; factor_type:string; status:string }> };
    const isRomanAdmin = user.id === "77e8d9e3-e947-4185-955f-28502e4a8deb"
      || ["roman.dossenbach@gmail.com", "pushupmania@gmail.com"].includes(user.email?.toLowerCase() || "");
    if (!isRomanAdmin) return false;
    let factor = user.factors?.find((item) => item.factor_type === "totp" && item.status === "verified");
    let qrCode:string|undefined;
    let secret:string|undefined;
    if (!factor) {
      const unfinished = user.factors?.find((item) => item.factor_type === "totp" && item.status !== "verified");
      if (unfinished) await fetch(`${SUPABASE_URL}/auth/v1/factors/${unfinished.id}`, { method:"DELETE", headers });
      const enrollResponse = await fetch(`${SUPABASE_URL}/auth/v1/factors`, { method:"POST", headers, body:JSON.stringify({ factor_type:"totp", friendly_name:"THE.HUMAN.CHOICE Admin" }) });
      const enrolled = await enrollResponse.json() as { id?:string; totp?:{ qr_code?:string; secret?:string }; msg?:string };
      if (!enrollResponse.ok || !enrolled.id) throw new Error(enrolled.msg || "2FA konnte nicht eingerichtet werden.");
      factor = { id:enrolled.id, factor_type:"totp", status:"unverified" };
      qrCode = enrolled.totp?.qr_code;
      secret = enrolled.totp?.secret;
    }
    const challengeResponse = await fetch(`${SUPABASE_URL}/auth/v1/factors/${factor.id}/challenge`, { method:"POST", headers, body:"{}" });
    const challenge = await challengeResponse.json() as { id?:string; msg?:string };
    if (!challengeResponse.ok || !challenge.id) throw new Error(challenge.msg || "2FA-Code konnte nicht angefordert werden.");
    setMfa({ factorId:factor.id, challengeId:challenge.id, qrCode, secret });
    setMessage(qrCode ? "Authenticator-App einrichten und den sechsstelligen Code eingeben." : "Sechsstelligen Code aus deiner Authenticator-App eingeben.");
    return true;
  }

  async function verifyMfa(event:FormEvent) {
    event.preventDefault();
    if (!mfa || !/^\d{6}$/.test(mfaCode)) { setMessage("Bitte den sechsstelligen Code eingeben."); return; }
    const accessToken = localStorage.getItem("pushup-supabase-access-token") || sessionStorage.getItem("pushup-supabase-access-token");
    if (!accessToken) { setMfa(null); setMessage("Sitzung abgelaufen. Bitte erneut anmelden."); return; }
    setVerifying(true);
    const response = await fetch(`${SUPABASE_URL}/auth/v1/factors/${mfa.factorId}/verify`, { method:"POST", headers:{ apikey:SUPABASE_ANON_KEY, authorization:`Bearer ${accessToken}`, "content-type":"application/json" }, body:JSON.stringify({ challenge_id:mfa.challengeId, code:mfaCode }) });
    const data = await response.json() as { access_token?:string; refresh_token?:string; msg?:string };
    if (!response.ok || !data.access_token) { setMessage(data.msg || "Code ist falsch oder abgelaufen."); setVerifying(false); return; }
    saveSession(data);
    location.href = "/";
  }

  useEffect(() => {
    initializeSession().then(async (user) => {
      setSignedInEmail(user?.email || "");
      if (user) { location.replace("/"); return; }
      const accessToken = localStorage.getItem("pushup-supabase-access-token") || sessionStorage.getItem("pushup-supabase-access-token");
      if (!accessToken) return;
      try {
        await startAdminMfa(accessToken);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "2FA konnte nicht fortgesetzt werden.");
      }
    });
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    if (mode === "signup" && !healthAccepted) {
      setMessage("Bitte bestätige zuerst den Gesundheitshinweis.");
      return;
    }
    if (mode === "signup" && !legalAccepted) {
      setMessage("Bitte stimme den Nutzungsbedingungen und der Datenschutzerklärung zu.");
      return;
    }
    if (mode === "signup" && !gender) { setMessage("Bitte wähle männlich oder weiblich."); return; }
    const endpoint = mode === "signup" ? "/auth/v1/signup" : "/auth/v1/token?grant_type=password";
    const response = await fetch(`${SUPABASE_URL}${endpoint}`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, "content-type": "application/json" },
      body: JSON.stringify({ email, password, ...(mode === "signup" ? { data:{ gender }, options: { emailRedirectTo: location.origin } } : {}) }),
    });
    const data = await response.json() as { access_token?: string; refresh_token?: string; error_description?: string; msg?: string };
    if (!response.ok) {
      const error = data.error_description || data.msg || "Anmeldung fehlgeschlagen.";
      setMessage(error === "Invalid login credentials" ? "E-Mail oder Passwort ist falsch. Falls du noch kein App-Konto hast, wähle «Neues Konto erstellen»." : error);
      return;
    }
    if (data.access_token) {
      saveSession(data);
      try { if (await startAdminMfa(data.access_token)) return; } catch (error) { clearSession(); setMessage(error instanceof Error ? error.message : "2FA konnte nicht gestartet werden."); return; }
      location.href = "/";
    } else {
      setMessage("Registrierung erfolgreich. Bitte bestätige jetzt den Link in deiner E-Mail.");
    }
  }

  function signOut() {
    clearSession();
    setSignedInEmail("");
    setMessage("Du wurdest abgemeldet.");
  }

  async function resetPassword() {
    if (!email) { setMessage("Bitte zuerst deine E-Mail-Adresse eintragen."); return; }
    const response = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setMessage(response.ok ? "Eine E-Mail zum Zurücksetzen des Passworts wurde angefordert." : "Die Passwort-E-Mail konnte nicht angefordert werden.");
  }

  return <main className="loginPage">
    <div className="loginLayout">
    <section className="loginCard">
    <h1>{mode === "login" ? t("signIn") : t("createAccount")}</h1>
    {mfa ? <form onSubmit={verifyMfa} className="mfaPanel">
      <h2>Admin-Zugang bestätigen</h2>
      {mfa.qrCode && <><p>Scanne diesen QR-Code einmalig mit Google Authenticator, Microsoft Authenticator, Authy oder einer vergleichbaren App.</p><img className="mfaQr" src={mfa.qrCode.startsWith("data:") ? mfa.qrCode : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(mfa.qrCode)}`} alt="QR-Code für die Authenticator-App" />{mfa.secret && <p className="mfaSecret">Manueller Schlüssel: <code>{mfa.secret}</code></p>}</>}
      <label><span>Sechsstelliger Sicherheitscode</span><input value={mfaCode} onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, "").slice(0,6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required autoFocus /></label>
      <button className="saveButton" type="submit" disabled={verifying || mfaCode.length !== 6}>{verifying ? "Prüfen …" : "Admin-Anmeldung abschließen"}</button>
      <button type="button" className="mfaCancel" onClick={() => { clearSession(); setMfa(null); setMfaCode(""); setMessage(""); }}>Abbrechen</button>
    </form> : signedInEmail ? <p>Anmeldung wird geöffnet …</p> : <form onSubmit={submit} className="loginForm">
      <label><span>E-Mail</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label>
      <label><span>{t("password")}</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
      {mode === "login" && <p className="persistentLoginNote">Du bleibst angemeldet, bis du dich selbst abmeldest.</p>}
      {mode === "signup" && <section className="healthConsent">
        <strong>{t("healthNotice")}</strong>
        <p>{t("healthText")}</p>
        <label htmlFor="health-consent"><Checkbox id="health-consent" checked={healthAccepted} onCheckedChange={(checked) => setHealthAccepted(checked === true)} /><span>{t("acceptHealth")}</span></label>
      </section>}
      {mode === "signup" && <label className="legalConsent" htmlFor="legal-consent">
        <Checkbox id="legal-consent" checked={legalAccepted} onCheckedChange={(checked) => setLegalAccepted(checked === true)} />
        <span>Ich akzeptiere die <a href="/nutzungsbedingungen" target="_blank">Nutzungsbedingungen</a> und habe die <a href="/datenschutz" target="_blank">Datenschutzerklärung</a> gelesen.</span>
      </label>}
      {mode === "signup" && <fieldset className="genderChoice"><legend>{t("leaderboard")}</legend><label><input type="radio" name="gender" value="male" checked={gender === "male"} onChange={() => setGender("male")} /><span>{t("male")}</span></label><label><input type="radio" name="gender" value="female" checked={gender === "female"} onChange={() => setGender("female")} /><span>{t("female")}</span></label></fieldset>}
      <button className="saveButton" type="submit" disabled={mode === "signup" && (!healthAccepted || !legalAccepted || !gender)}>{mode === "login" ? t("signIn") : t("createAccount")}</button>
      <button type="button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setHealthAccepted(false); setLegalAccepted(false); setMessage(""); }} style={{ padding: "16px", borderRadius: 14, border: "2px solid #c9ff3d", background: "transparent", color: "#c9ff3d", fontWeight: 800 }}>{mode === "login" ? t("newAccount") : t("backLogin")}</button>
      {mode === "login" && <button type="button" onClick={resetPassword} style={{ padding: "12px", border: 0, background: "transparent", color: "#f7faf9", textDecoration: "underline" }}>{t("forgotPassword")}</button>}
    </form>}
    {message && <p className="message" role="status">{message}</p>}
    <nav className="legalNav compact" aria-label="Rechtliche Informationen"><a href="/impressum">Impressum</a><a href="/nutzungsbedingungen">Nutzungsbedingungen</a><a href="/datenschutz">Datenschutz</a></nav>
    </section>
    <aside className="loginSideTools" aria-label="Sprache und Hilfe">
      <label className="languageControl" title="Sprache wählen"><Globe2 size={24} aria-hidden="true"/><select className="languageSelect" value={language} onChange={(e) => setLanguage(e.target.value as typeof language)} aria-label="Sprache wählen">{languages.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</select></label>
      <a className="loginHelpButton" href="/handbuch/index.html" title="Hilfe" aria-label="Hilfe"><HelpCircle size={24}/></a>
    </aside>
    </div>
  </main>;
}
