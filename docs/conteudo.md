# Atualizar o conteúdo da Luzzinterest

O conteúdo publicado vem de `content/site.json`, dos arquivos `content/pieces/*.json` e das fotos em `content/media/`. Essa é a fonte única do acervo; os arquivos de `.generated/` e `public/media/` são recriados pelo pipeline.

A curadoria inicial relaciona as peças às imagens identificadas nas publicações consultadas. Mantenha essa correspondência ao editar: imagens de manifesto, processo ou ambientação não devem ser atribuídas a uma peça por suposição. Descrições editoriais podem registrar o que a foto mostra; nomes oficiais, técnicas, composição, autoria e informações de encomenda precisam de confirmação da loja ou da publicação de origem.

## Informações da loja

Edite `content/site.json`. Todos os campos abaixo são obrigatórios; as listas podem estar vazias.

| Campo | Tipo | Uso |
| --- | --- | --- |
| `name` | string | Nome da loja. |
| `tagline` | string | Frase curta de apresentação. |
| `introduction` | string | Descrição da loja. |
| `manifesto` | string[] | Trechos do manifesto, na ordem de exibição. |
| `location` | string | Localização confirmada pela loja. |
| `instagramUrl` | string | URL HTTPS do perfil. |
| `whatsappUrl` | string | URL HTTPS do grupo de WhatsApp indicado na bio. |
| `heroImage` | string | Nome da imagem de abertura, relativo a `content/media/`. |
| `processImages` | string[] | Imagens gerais de processo ou identidade, relativas a `content/media/`. |

Exemplo estrutural completo, somente para consulta neste documento. As frases, os perfis e os arquivos são demonstrativos e devem ser substituídos por dados confirmados; as imagens precisam existir antes da geração:

```json
{
  "name": "Nome confirmado da loja",
  "tagline": "Frase de apresentação confirmada",
  "introduction": "Descrição da loja aprovada para publicação.",
  "manifesto": [
    "Primeiro trecho confirmado do manifesto.",
    "Segundo trecho confirmado do manifesto."
  ],
  "location": "Localização confirmada pela loja",
  "instagramUrl": "https://www.instagram.com/perfil_exemplo/",
  "whatsappUrl": "https://chat.whatsapp.com/EXEMPLO_SUBSTITUIR",
  "heroImage": "exemplo-frente.jpg",
  "processImages": ["exemplo-processo.jpg"]
}
```

O gerador acrescenta `publicUrl` à saída quando `SITE_URL` ou `--site-url` está configurado. Esse campo não precisa ser escrito no JSON de origem.

### Bloco opcional de customização

`site.customProcess` configura a seção que explica como nasce uma custom. O campo é opcional: quando está ausente, a seção é omitida. Os modelos antigos de `site.json`, inclusive o exemplo acima, continuam válidos sem ele.

Quando o objeto está presente, o C# exige `eyebrow`, `title` e `introduction` como strings não vazias, além de ao menos uma etapa em `steps`. Cada etapa precisa de `title` e `text` não vazios. Um objeto vazio ou uma lista de etapas vazia não desativa a seção: é um erro de validação.

Este fragmento demonstra o campo a acrescentar ao objeto de `content/site.json`; mantenha os demais campos obrigatórios:

```json
{
  "customProcess": {
    "eyebrow": "04 / COMO NASCE UM CUSTOM",
    "title": "Cada projeto é único.",
    "introduction": "Compartilhe suas referências e combine a criação com a loja.",
    "steps": [
      {
        "title": "Traga suas referências.",
        "text": "A custom é desenvolvida individualmente, em conversa com você pelo grupo."
      }
    ]
  }
}
```

A versão incorporada a partir dos destaques tem quatro etapas: referências, escolha da peça-base, orçamento individual e combinação de entrega ou retirada. Os textos ficam no JSON e devem refletir as informações confirmadas pela loja. Pagamento, entrega e demais condições são combinados no grupo; não copie preços, disponibilidade ou condições antigas dos prints para a interface.

## Adicionar uma peça

1. Coloque as fotos em `content/media/`, com nomes descritivos, preferencialmente em minúsculas, sem espaços ou acentos: por exemplo, `exemplo-frente.jpg` e `exemplo-costas.jpg`.
2. Crie um arquivo JSON em `content/pieces/`, como `080-peca-exemplo.json`. Os itens são ordenados pelo nome do arquivo; prefixos numéricos ajudam a controlar essa ordem.
3. Preencha os campos do modelo abaixo com informações confirmadas. `id` e `slug` precisam ser únicos. Mantenha o `slug` estável para preservar links compartilhados.
4. Rode a preparação e confira a peça no navegador, incluindo fotos, recortes, créditos e o link de contato.

O exemplo é demonstrativo e fica fora da pasta de conteúdo. Ele mostra o formato completo, mas só passa na validação depois de substituir os dados e adicionar as imagens citadas:

```json
{
  "id": "peca-exemplo",
  "slug": "peca-exemplo",
  "name": "Nome confirmado da peça",
  "description": "Descrição objetiva da peça e de suas intervenções visíveis.",
  "collection": "Coleção ou agrupamento editorial confirmado",
  "category": "Categoria confirmada",
  "featured": false,
  "images": [
    {
      "src": "exemplo-frente.jpg",
      "alt": "Descrição objetiva da frente da peça, com os detalhes que aparecem na foto.",
      "position": "50% 50%"
    },
    {
      "src": "exemplo-costas.jpg",
      "alt": "Descrição objetiva das costas da peça e das intervenções visíveis."
    }
  ],
  "credits": [
    {
      "name": "Nome confirmado da pessoa creditada",
      "url": "https://www.instagram.com/credito_exemplo/"
    }
  ],
  "details": [
    "Detalhe confirmado nas fotos ou pela loja.",
    "Outra característica confirmada da peça."
  ],
  "sourceUrl": "https://www.instagram.com/p/EXEMPLO_SUBSTITUIR/"
}
```

| Campo | Regra |
| --- | --- |
| `id` | Identificador obrigatório e único; duplicidades ignoram diferenças entre maiúsculas e minúsculas. |
| `slug` | Obrigatório e único; letras minúsculas sem acentos, números e hífens entre palavras. Forma a rota `/pecas/slug/`. |
| `name`, `description`, `collection`, `category` | Strings obrigatórias e não vazias. Use textos sustentados pela imagem, pela fonte ou pela loja. |
| `featured` | Boolean obrigatório; `true` seleciona a peça para os destaques e `false` é um valor válido. A página inicial exibe até quatro selecionadas, na ordem dos arquivos. |
| `images` | Lista obrigatória com ao menos uma foto; a ordem define a sequência da galeria. |
| `images[].src` | Caminho relativo a `content/media/`; sem caminho absoluto, URL ou `..`. O arquivo precisa existir. |
| `images[].alt` | Texto alternativo obrigatório e não vazio, descrevendo o que a foto acrescenta. |
| `images[].position` | String opcional em formato CSS de `object-position`, como `50% 50%`; ajuda a ajustar o recorte. Confira o resultado em desktop e mobile. |
| `credits` | Lista obrigatória; use `[]` quando não houver crédito confirmado. Cada entrada exige `name` e URL HTTPS em `url`. |
| `details` | Lista obrigatória de características confirmadas; pode ser `[]`. |
| `sourceUrl` | URL HTTPS obrigatória da publicação de origem. |

Os caminhos de imagem guardam o nome do original, como `exemplo-frente.jpg`. Não use URLs geradas em `/media/` nos JSON. O processamento cria os WebPs responsivos, ajusta a orientação da foto e não amplia imagens pequenas. Trocar o original e executar a preparação atualiza as versões publicadas.

O acervo apresenta peças já produzidas e direciona conversas ao WhatsApp. Não transforme legendas antigas em promessa atual de estoque, disponibilidade, prazo ou preço.

## Validar e visualizar

Na raiz do repositório:

```powershell
npm run prepare:content
npm run test:catalog
npm run build
npm run preview
```

`prepare:content` executa o C# e depois prepara as imagens. O gerador rejeita campos ausentes, JSON inválido, `id` ou `slug` repetidos, URLs inválidas, imagens inexistentes, caminhos fora da pasta de mídia e fotos sem `alt`. Também valida os textos e as etapas de `customProcess`, quando presente. Uma falha de validação em C# encerra o comando com código 1, informa arquivo e campo no terminal e não sobrescreve as saídas anteriores.

Para executar apenas a validação e a geração do catálogo:

```powershell
dotnet run --project tools/CatalogBuilder -- --root .
```

O resultado é `.generated/catalog.json`. O pipeline de mídia também gera `.generated/media.json` e `public/media/`. Os arquivos `public/robots.txt` e `public/sitemap.xml` são produzidos pelo C#; o sitemap só existe com URL pública configurada. Esses resultados ficam fora do Git. Os JSON de origem e os originais de `content/media/` devem ser versionados.

Se estiver usando `npm run dev`, reinicie esse comando depois de editar os arquivos do acervo. Ele prepara o conteúdo apenas na inicialização; rodar `prepare:content` separadamente não substitui a recomendação de reiniciar o servidor já aberto. O preview usa o build anterior até você executar `npm run build` novamente.

`SITE_URL` é opcional localmente. Para publicar os metadados e o sitemap, use a URL HTTPS real confirmada na configuração do build, conforme o [README](../README.md) e o [guia do Azure](azure.md). O argumento `--site-url` tem prioridade sobre a variável de ambiente. Nenhum domínio é presumido quando ambos estão ausentes.

## Referências, Instagram e destaques

- `referencias/instagram/feed/` registra origens, legendas e imagens das publicações públicas consultadas.
- `referencias/instagram/destaques/` recebe os prints que você fornecer. Use uma pasta por destaque e numere os arquivos na ordem: `01-capa.jpg`, `02-processo.jpg`, `03-detalhe.jpg`.
- `referencias/instagram/marca/` recebe logo e outros materiais de identidade visual.

Essas referências não entram automaticamente no site. Depois da análise, selecione as fotos destinadas ao acervo, coloque-as em `content/media/` e associe-as aos JSON correspondentes.

Os nove originais `Screenshot_1.png` a `Screenshot_9.png` foram preservados em `referencias/instagram/destaques/`. A [análise dos prints](../referencias/instagram/destaques/analise.md) registra os textos, as correspondências e a curadoria. O arquivo [recortes.json](../referencias/instagram/destaques/recortes.json) documenta a proveniência de cada derivado, com arquivo de origem, destino e coordenadas do recorte.

Dessa incorporação vieram seis assets: cinco recortes de roupas em `content/media/` — duas vistas da Camisa Ghellion, uma da Polo Paranoico e duas imagens complementares, da Regata Neurose e da Jaqueta Imortal — e a textura `public/brand/custom-paper.webp`, extraída da arte do print 3. Os recortes de roupa não incluem preços nem interface do Instagram; a textura decorativa usa uma área sem o texto informativo. Esses arquivos são derivados reais dos prints, sem reconstrução por IA, e seus originais permanecem disponíveis para conferência.

A incorporação ampliou o acervo de sete para nove peças. A imagem de abertura continuou sendo o Custom Barcellos; os quatro destaques escolhidos foram Calça Confusão, Regata Neurose, Custom Barcellos e Camisa Ghellion. `heroImage` controla a abertura separadamente de `featured`. Preços e disponibilidade históricos não são exibidos; entrega e pagamento são combinados pelo grupo já configurado em `whatsappUrl`.

O coletor opcional é executado com:

```powershell
node referencias/instagram/coletar.mjs
```

Ele percorre uma lista de publicações públicas selecionadas e tenta recuperar legendas e fotos pelo HTML público e pela incorporação oficial do Instagram. Não usa login nem garante acesso a todo o perfil ou aos destaques. Reexecutá-lo pode atualizar os arquivos coletados; revise os resultados e mantenha os créditos confirmados. Para destaques inacessíveis ou fotos em maior resolução, forneça os prints e os originais nas pastas indicadas.
