import { useEffect, useRef } from "react";

// Loads Google's script once and renders the official Sign-In button into
// this component's div. Kept as one small reusable component since both
// Login and Register need the exact same behavior.
export default function GoogleSignInButton({ onSuccess, onError }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      // Not configured — fail quietly rather than showing a broken button.
      return;
    }

    const renderButton = () => {
      if (!window.google || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response?.credential) {
            onSuccess?.(response.credential);
          } else {
            onError?.("Google sign-in failed");
          }
        },
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
      });
    };

    if (window.google?.accounts?.id) {
      renderButton();
      return;
    }

    const existingScript = document.getElementById("google-identity-script");

    if (existingScript) {
      existingScript.addEventListener("load", renderButton);
      return () => existingScript.removeEventListener("load", renderButton);
    }

    const script = document.createElement("script");
    script.id = "google-identity-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderButton;
    document.body.appendChild(script);
  }, [onSuccess, onError]);

  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    return null;
  }

  return <div ref={buttonRef} className="flex justify-center" />;
}
