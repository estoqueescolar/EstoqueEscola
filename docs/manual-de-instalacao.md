# Manual de instalação

Duas formas: **local** (para desenvolver e para o plano B da apresentação) e **publicada** (Vercel + Supabase, planos gratuitos).

## 1. Ambiente local

Pré-requisitos: Node.js 20 ou mais novo, Docker Desktop aberto, Git.

```bash
git clone https://github.com/estoqueescolar/EstoqueEscola.git
cd EstoqueEscola
npm install

npx supabase start -x studio,imgproxy,edge-runtime,logflare,vector,supavisor,realtime,storage-api
cp .env.example .env.local
npx supabase status        # copie "anon key" e "service_role key" para o .env.local
npx supabase db reset      # cria as tabelas e carrega os dados de exemplo e as 3 contas de demonstração
npm run dev                # http://localhost:3000
```

Contas locais: `diretora@colegio.local`, `cozinha@colegio.local`, `consulta@colegio.local`, senha `Senha@Local123`.
E-mails locais (confirmação e recuperação de senha) ficam em http://localhost:54724 (Mailpit).

| Porta | Serviço |
|---|---|
| 3000 | Sistema (Next.js) |
| 54721 | API do Supabase local |
| 54722 | Banco Postgres local |
| 54724 | Mailpit (caixa de e-mails local) |

## 2. Publicação

### 2.1 Supabase (banco e login)
1. Crie um projeto em https://supabase.com (plano gratuito). Anote o **Project ID** (Settings → General).
2. No terminal, na pasta do projeto:
   ```bash
   npx supabase login
   npx supabase link --project-ref <PROJECT_ID>
   npx supabase db push                 # aplica as migrações
   ```
3. Dados iniciais:
   - Para demonstração: `npx supabase db push --include-seed` carrega os dados de exemplo e as 3 contas.
     **Troque a senha das contas logo depois**, porque a senha local está escrita no repositório.
   - Para uso real: não carregue o seed. Crie a conta da direção em **Authentication → Users → Add user** e,
     no SQL Editor, rode `update perfis set perfil = 'administrador', nome = 'Nome da diretora' where email = '<e-mail>';`.
4. **Authentication → URL Configuration**: *Site URL* = endereço da Vercel; em *Redirect URLs* adicione `https://<seu-app>.vercel.app/**`.
5. E-mails pelo Gmail: siga [email-gmail.md](email-gmail.md).

> Nunca rode `npx supabase db reset --linked`: ele apaga o banco publicado.

### 2.2 Vercel (site)
1. `npx vercel login` e, na pasta do projeto, `npx vercel link --project despensa-cape`.
2. Variáveis de ambiente (**Production**), em Settings → Environment Variables ou com `npx vercel env add`:

   | Variável | Valor | Tipo |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<PROJECT_ID>.supabase.co` | pública |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | chave *anon* (Settings → API) | pública |
   | `NEXT_PUBLIC_SITE_URL` | `https://<seu-app>.vercel.app` | pública |
   | `SUPABASE_SERVICE_ROLE_KEY` | chave *service_role* | **secreta** (marque *Sensitive*) |

3. Publique: `npx vercel deploy --prod`. Também dá para importar o repositório do GitHub no painel da Vercel:
   cada `git push` na branch `main` publica sozinho.

### 2.3 Conferência
- Abra o endereço, entre com a conta da direção e veja o painel.
- Em **Configurações**, confira o prazo do alerta de validade.
- Em **Relatórios**, baixe um PDF.

## 3. Atualizar uma versão publicada
```bash
git checkout main && git pull
npx supabase db push        # só se houver migração nova
npx vercel deploy --prod
```
Trabalhe em branches (`etapa-...`) e só leve para a `main` o que passou nos testes.
