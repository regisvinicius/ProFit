export type Locale = "pt" | "en";

export const translations = {
  pt: {
    menu: "Menu",
    home: "Home",
    logout: "Sair",
    workInProgress: "Em desenvolvimento",
    loading: "Carregando",
    language: "Idioma",
    email: "Email",
    password: "Senha",
    enter: "Entrar",
    entering: "Entrando…",
    enterYourEmail: "Digite seu email",
    enterYourPassword: "Digite sua senha",
    login: "Login",
    loginWithGoogle: "Login com Google",
    loginWithEmail: "Login com Email",
  },
  en: {
    menu: "Menu",
    home: "Home",
    logout: "Log out",
    workInProgress: "Work in progress",
    loading: "Loading",
    language: "Language",
    email: "Email",
    password: "Password",
    enter: "Enter",
    entering: "Entering…",
    enterYourEmail: "Enter your email",
    enterYourPassword: "Enter your password",
    login: "Login",
    loginWithGoogle: "Login with Google",
    loginWithEmail: "Login with Email",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["pt"];
