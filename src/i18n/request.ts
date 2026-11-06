import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

const locales = ["pt-BR", "en-US"];
const defaultLocale = "en-US";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  let locale = cookieStore.get("locale")?.value ?? defaultLocale;

  if (!locales.includes(locale)) locale = defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
