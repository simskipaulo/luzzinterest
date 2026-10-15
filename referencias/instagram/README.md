# Referências da Luzzinterest

`feed/` guarda a origem e as legendas das publicações públicas consultadas. `destaques/` recebe os prints fornecidos pelo usuário; `marca/` recebe logo e materiais de identidade visual. Para novos envios, organize os prints por destaque e mantenha a ordem com nomes numerados. As referências originais não entram automaticamente no pacote publicado.

## Destaques incorporados

Os nove arquivos `destaques/Screenshot_1.png` a `destaques/Screenshot_9.png` estão preservados como recebidos. A [análise](destaques/analise.md) inventaria os prints, transcreve os textos legíveis e distingue informações confirmadas de correspondências visuais. O arquivo [recortes.json](destaques/recortes.json) registra a proveniência dos derivados: imagem de origem, destino e coordenadas de cada recorte.

Foram aproveitados seis assets reais, sem reconstrução por IA:

| Origem | Destino no projeto | Uso |
| --- | --- | --- |
| `Screenshot_1.png` | `content/media/destaque-ghellion-costas.png` | Camisa Ghellion, vista posterior. |
| `Screenshot_1.png` | `content/media/destaque-ghellion-frente.png` | Camisa Ghellion, vista frontal. |
| `Screenshot_2.png` | `content/media/destaque-paranoico-frente.png` | Polo Paranoico, vista frontal. |
| `Screenshot_8.png` | `content/media/destaque-neurose-detalhe.png` | Imagem complementar da Regata Neurose. |
| `Screenshot_9.png` | `content/media/destaque-imortal-uso.png` | Imagem complementar da Jaqueta Imortal em uso. |
| `Screenshot_3.png` | `public/brand/custom-paper.webp` | Textura decorativa do bloco de customização. |

Os cinco recortes de roupa ficam em `content/media/` e passam pelo processamento responsivo de imagens. Foram retirados preços e elementos da interface do Instagram. A textura usa uma área da arte do print 3 sem o texto informativo; ela não substitui os textos acessíveis da página.

Camisa Ghellion e Polo Paranoico ampliaram o acervo de sete para nove peças. Os prints 8–9 acrescentaram vistas às peças existentes. A abertura permanece com Custom Barcellos; a seleção da página inicial reúne Calça Confusão, Regata Neurose, Custom Barcellos e Camisa Ghellion.

Os textos dos prints 3–7 fundamentam a seção opcional `site.customProcess`, configurada em `content/site.json` com `eyebrow`, `title`, `introduction` e uma lista `steps`, cada etapa com `title` e `text`. Quando presente, todos esses textos devem ser não vazios e deve haver ao menos uma etapa; quando ausente, a seção é omitida e os modelos antigos continuam válidos. Consulte o [guia de conteúdo](../../docs/conteudo.md) para editar os dados.

Preços, disponibilidade e condições comerciais antigas permanecem apenas como referência histórica. O site não exibe preços ou disponibilidade; entrega e pagamento são combinados no grupo conhecido, mantido em `whatsappUrl`. O print 7 não revela um código de convite completo, e a menção a Uber Flash no print 6 não deve virar promessa permanente de entrega sem confirmação atual da loja.

## Atualizar referências públicas

O comando `node referencias/instagram/coletar.mjs`, executado na raiz do projeto, tenta atualizar as publicações públicas selecionadas, incluindo legendas e fotos acessíveis pela incorporação oficial do Instagram. Ele não usa login nem garante acesso a stories ou destaques bloqueados. Os prints fornecidos manualmente continuam sendo a fonte dos destaques incorporados.

Fotos selecionadas para publicação ficam em `content/media/` e são associadas aos JSON do acervo. Prefira fornecer originais em maior resolução para substituir cópias públicas reduzidas e preserve os créditos confirmados dos fotógrafos. A curadoria mantém a coleção Hipersensível, as peças customizadas e as colaborações musicais do perfil como referências da identidade.
