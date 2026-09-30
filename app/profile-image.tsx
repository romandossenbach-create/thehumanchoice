"use client";
import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { authorizedFetch } from "./auth-client";
export default function ProfileImage({src, ...props}: ImgHTMLAttributes<HTMLImageElement> & {src:string}) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let active = true, objectUrl = "";
    setUrl("");
    authorizedFetch(src, {cache:"no-store"}).then(async response => {
      if (!response.ok) return;
      const blob = await response.blob();
      if (!active) return;
      objectUrl = URL.createObjectURL(blob); setUrl(objectUrl);
    }).catch(() => {});
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [src]);
  return <img {...props} src={url || "/profile-placeholder-globe.png"} />;
}

