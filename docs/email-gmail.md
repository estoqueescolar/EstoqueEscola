# Envio de e-mails pelo Gmail (escolarestoque@gmail.com)

Os e-mails de confirmação de conta e de redefinição de senha saem do Supabase Auth.
No ambiente local eles caem no Mailpit (http://localhost:54724). Em produção, use o Gmail da despensa:

1. Entre em https://myaccount.google.com com escolarestoque@gmail.com.
2. **Segurança → Verificação em duas etapas**: ative (é obrigatório para a senha de app).
3. **Segurança → Senhas de app** (https://myaccount.google.com/apppasswords): crie uma com o nome
   "Despensa CAPE" e copie as 16 letras. Ela não é a senha da conta e pode ser revogada a qualquer momento.
4. No painel do Supabase: **Authentication → Emails → SMTP Settings → Enable custom SMTP**:
   | Campo | Valor |
   |---|---|
   | Sender email | escolarestoque@gmail.com |
   | Sender name | Despensa CAPE |
   | Host | smtp.gmail.com |
   | Port | 587 |
   | Username | escolarestoque@gmail.com |
   | Password | a senha de app do passo 3 |
5. **Authentication → Rate Limits**: ajuste "emails per hour" (o padrão com SMTP próprio é 30; o Gmail
   gratuito aceita cerca de 500 envios por dia).
6. **Authentication → URL Configuration**: Site URL = endereço da Vercel; em Redirect URLs adicione
   `https://<seu-app>.vercel.app/**`.
7. Teste: em /recuperar-senha peça o link para um e-mail seu.

A senha de app **nunca** vai para o código nem para o repositório: fica só no painel do Supabase
(ou em `GMAIL_SENHA_APP` no `.env` local, se quiser testar o Gmail com o Supabase local — ver `supabase/config.toml`).
