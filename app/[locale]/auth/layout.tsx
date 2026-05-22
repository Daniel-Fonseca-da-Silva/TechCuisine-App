import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import type { AbstractIntlMessages } from 'next-intl';

interface Props {
  children: React.ReactNode;
}

export default async function AuthLayout({ children }: Props) {
  const allMessages = await getMessages();
  const messages: AbstractIntlMessages = {
    cookie: allMessages.cookie,
    auth: allMessages.auth,
    HomePage: allMessages.HomePage,
    logo: allMessages.logo,
  };

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
