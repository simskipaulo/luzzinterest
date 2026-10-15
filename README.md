# Luzzinterest

Acervo visual da Luzzinterest, com apresentação da marca, peças produzidas e contato pelo grupo de WhatsApp indicado no Instagram. O projeto usa React e TypeScript na interface, C# na preparação do catálogo e arquivos estáticos na publicação. As encomendas são conversadas no WhatsApp.

## Rodar localmente

Instale **Node.js 24**, com npm, e o **SDK .NET 10**. Execute na raiz do repositório:

```powershell
npm ci
npm run dev
```

Abra <http://127.0.0.1:5173>. O comando prepara o catálogo e as imagens antes de iniciar o servidor.

Após alterar JSON ou imagens do acervo, interrompa o servidor com `Ctrl+C` e execute `npm run dev` novamente. A preparação do conteúdo acontece uma vez na inicialização. Para somente reprocessar os arquivos, use `npm run prepare:content`; reinicie também o servidor que já estiver aberto para carregar a nova versão.

Para conferir a versão estática:

```powershell
npm run build
npm run preview
```

O preview fica em <http://127.0.0.1:4173> e serve os arquivos de `build/client`. Execute um novo build depois de atualizar conteúdo ou código.

## Conteúdo e geração

O fluxo de publicação é **JSON → validação em C# → imagens WebP → páginas pré-renderizadas**:

1. `content/site.json` guarda apresentação, manifesto, imagens gerais e contatos; `content/pieces/*.json` guarda o acervo. As imagens originais ficam versionadas em `content/media/`.
2. O gerador .NET valida campos, links, imagens, textos alternativos e duplicidades antes de escrever `.generated/catalog.json` e os arquivos de indexação.
3. O processamento de mídia cria WebPs locais em tamanhos responsivos e o manifesto `.generated/media.json`.
4. O React Router gera HTML para a página inicial, o acervo, cada peça e a página 404. O resultado publicável fica em `build/client/`.

`.generated/`, `public/media/`, `public/robots.txt`, `public/sitemap.xml` e `build/` são resultados gerados e ficam fora do Git. Edite os JSON e originais, em vez desses resultados.

O [guia de conteúdo](docs/conteudo.md) explica todos os campos e como adicionar uma peça. As referências e legendas consultadas ficam em `referencias/instagram/`; coloque novos prints dos destaques em `referencias/instagram/destaques/` e materiais da identidade em `referencias/instagram/marca/`.

O comando opcional `node referencias/instagram/coletar.mjs` tenta atualizar as publicações públicas selecionadas, incluindo dados acessíveis pela incorporação oficial do Instagram. A coleta depende do acesso público disponível e não usa login. Os destaques devem ser fornecidos por prints quando não estiverem acessíveis publicamente.

## Verificar alterações

```powershell
npm run test:catalog
npm run build
npx playwright install chromium
npm run test:e2e
```

Os testes do catálogo cobrem validação e geração em C#. Os testes de navegador usam o build estático com Chromium em perfis desktop e mobile. O Playwright inicia o preview automaticamente quando necessário. O build também executa a verificação de tipos e os limites de tamanho do pacote.

## Endereço público e Azure

`SITE_URL` é opcional no desenvolvimento local. Sem essa variável, o catálogo e o site são gerados sem presumir um domínio; `robots.txt` é criado sem referência a sitemap e o sitemap anterior é removido.

Para gerar os metadados e o sitemap de uma publicação, informe a URL HTTPS real, já confirmada. Em PowerShell:

```powershell
$env:SITE_URL = Read-Host "URL HTTPS real do site"
npm run build
```

O endereço precisa estar configurado para publicar com SEO completo. No workflow do Azure, `SWA_PUBLIC_URL` pode fornecer o endereço real quando `SITE_URL` estiver ausente. Não coloque um domínio ilustrativo nessa configuração.

O desenvolvimento e a validação desta etapa são locais. A infraestrutura Terraform e a publicação são etapas separadas, descritas no [guia do Azure](docs/azure.md).
