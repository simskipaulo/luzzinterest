# Publicação no Azure

O site é publicado como arquivos estáticos no Azure Static Web Apps (SWA). O C# roda apenas no build para validar e compilar o catálogo; não há API, banco de dados ou servidor C# hospedado. O Terraform cria um Resource Group e um SWA, com plano **Free** e região **eastus2** como padrão. O conteúdo estático é distribuído globalmente.

## Provisionar a infraestrutura

Requisitos: assinatura Azure, Azure CLI, Terraform 1.10 ou superior, Node.js 24 e SDK .NET 10. A versão exata do provider fica registrada em `infra/.terraform.lock.hcl`, que deve ser versionado.

Na raiz do projeto, em PowerShell:

```powershell
az login
Copy-Item infra/terraform.tfvars.example infra/terraform.tfvars
```

Edite `infra/terraform.tfvars` e substitua o ID da assinatura pela sua assinatura pessoal destinada ao site. Selecione-a explicitamente no Azure CLI; não use automaticamente uma assinatura corporativa ou de staging já conectada:

```powershell
az account set --subscription "ID-DA-SUA-ASSINATURA-PESSOAL"
az account show --query "{nome:name,id:id}" --output table
```

Confirme que o ID selecionado é o mesmo de `subscription_id`. Os nomes padrão são `luzzinterest-rg` e `luzzinterest-web`; `prefix`, `resource_group_name` e `static_web_app_name` permitem ajustá-los. Se um recurso já existir fora deste estado, importe-o conscientemente antes de aplicar; não se trata de uma referência automática a um Resource Group existente.

```powershell
terraform -chdir=infra init
terraform -chdir=infra fmt -check
terraform -chdir=infra validate
terraform -chdir=infra plan -out=site.tfplan
```

Confira os recursos e o SKU exibidos no plano. Para provisionar o plano revisado:

```powershell
terraform -chdir=infra apply site.tfplan
terraform -chdir=infra output swa_public_url
```

O último comando retorna o endereço HTTPS real fornecido pelo Azure. Não use um hostname inventado no catálogo, no sitemap ou nos metadados. `sku = "Standard"` é opcional e gera cobrança; não é necessário para esta versão.

## Configurar GitHub Actions

Em **Settings → Secrets and variables → Actions**, configure:

| Tipo | Nome | Valor |
| --- | --- | --- |
| Variable | `SWA_PUBLIC_URL` | Resultado de `terraform -chdir=infra output -raw swa_public_url`, incluindo `https://`. |
| Variable opcional | `SITE_URL` | Origem pública usada no sitemap e nos metadados; quando ausente, o build usa `SWA_PUBLIC_URL`. Use o domínio próprio somente após confirmar DNS e HTTPS. |
| Secret | `AZURE_STATIC_WEB_APPS_API_TOKEN` | Token de implantação do SWA. |

Para o segredo, abra o recurso SWA no portal Azure, escolha **Manage deployment token** e copie o valor diretamente para o campo de secret do GitHub. Não cole o token no terminal, em arquivos, em issues, em conversas ou nos logs. Ele não é exportado pelos outputs deste Terraform. O próprio estado Terraform pode conter dados sensíveis do recurso e deve ser protegido.

As duas variables de URL são opcionais para compilar e testar localmente ou em CI sem deploy. Quando o token está configurado, o workflow exige `SITE_URL` ou `SWA_PUBLIC_URL` antes de publicar; isso impede gerar uma versão pública com domínio fictício. Configure as variables antes do primeiro push de publicação. A URL retornada pelo deploy também aparece no resumo da execução, incluindo o endereço real dos previews.

O workflow `.github/workflows/site.yml`:

- Instala Node.js 24 e .NET 10; executa `npm ci`, os testes C# do catálogo, `npm run build` (incluindo geração e typecheck) e os testes de navegador com Chromium.
- Verifica a existência de `build/client/index.html` e os limites do pacote estático.
- Publica `build/client` em produção nos pushes para `main`; pull requests do mesmo repositório recebem preview. PRs de forks são validados sem acesso ao segredo e sem publicação.
- Encerra o preview quando a PR é fechada. O Free comporta até três ambientes de preview; feche PRs sem uso antes de abrir mais ambientes.
- Permite execução manual para `main`. Sem o segredo, a execução valida o projeto e informa que o deploy foi omitido.

As actions estão fixadas por SHA de commit dos repositórios oficiais. Atualizações devem revisar o diff da nova versão antes de trocar o SHA. O token do repositório não é passado à action Azure para comentários automáticos em PRs; o workflow precisa apenas de leitura do código.

Não há `api_location`, Functions ou API para publicar. O campo da action é explicitamente vazio e `skip_app_build: true` publica o artefato já validado, sem recompilar com Oryx.

## Domínio próprio

O endereço gratuito do Azure funciona sem comprar domínio. Para usar um domínio próprio, primeiro provisione o site sem `custom_domain`.

Para um subdomínio, como `www`, crie no provedor de DNS um registro **CNAME** apontando para o output `default_hostname` (sem protocolo nem caminho). Aguarde a propagação, preencha `custom_domain` e mantenha `custom_domain_validation_type = "cname-delegation"`. Revise um novo plano Terraform e aplique-o.

Para um domínio raiz, use `custom_domain_validation_type = "dns-txt-token"`. Após aplicar, consulte `custom_domain_validation_token` e publique o registro TXT indicado pelo Azure, normalmente `_dnsauth` no domínio raiz. Configure também ALIAS/ANAME ou CNAME flattening, conforme suporte do provedor, para direcionar o tráfego ao SWA. O provider não espera a validação TXT terminar: confirme o status no portal e teste HTTPS antes de mudar `SITE_URL` no GitHub. O certificado TLS é emitido e renovado pelo Azure.

Depois de validar o domínio, atualize a variable `SITE_URL` para a origem HTTPS final e publique novamente. Previews usam a origem de produção para os links canônicos; não substitua a URL canônica a cada PR.

## Estado Terraform e cópias de segurança

O backend inicial é **local**: `infra/terraform.tfstate` e seu backup pertencem ao ambiente de quem aplicou. Arquivos de estado, planos, `.terraform/` e `terraform.tfvars` devem permanecer ignorados pelo Git. O arquivo de lock do provider deve permanecer versionado.

Após cada aplicação, copie o estado e o backup para um local privado, com controle de acesso e proteção do disco. Não os coloque no repositório nem em uma pasta pública. Sem o estado, não aplique novamente como se a infraestrutura não existisse: restaure a cópia ou importe os recursos existentes. Apenas uma pessoa ou execução deve operar esse estado local por vez.

Se várias pessoas passarem a provisionar a infraestrutura, migre para backend `azurerm` em Blob Storage privado, com autenticação Entra ID, bloqueio, versionamento e soft delete. Esse armazenamento é um recurso adicional com custo próprio. A migração deve usar `terraform init -migrate-state` depois de revisar a configuração do backend; não use cópias independentes do estado para a mesma infraestrutura.

## Rollback e limites

Para reverter conteúdo ou código, faça `git revert` do commit problemático e envie a correção para `main`; o mesmo workflow valida e republica a versão. Também é possível executar novamente um workflow bem-sucedido do commit desejado, verificando o SHA e as variables atuais antes de publicar. Alterar código não exige reaplicar Terraform.

Se o deploy falhar, consulte a execução do GitHub e mantenha a última publicação disponível. Para problemas de domínio, o output `swa_public_url` fornece uma URL de diagnóstico independente do DNS próprio. Rotacionar o token no portal exige atualizar o secret no GitHub.

O Free não possui SLA e inclui **100 GB de tráfego por mês por assinatura**, **250 MB por ambiente**, **500 MB de armazenamento total entre ambientes** e até **15.000 arquivos** por aplicação. Exceder a quota de tráfego pode interromper o atendimento do site; não há contratação automática de excedente nesse plano. O workflow verifica tamanho por ambiente e quantidade de arquivos, mas o total de previews e o tráfego precisam ser acompanhados no Azure. Mantenha fotos otimizadas e hospede vídeos longos fora deste pacote.

A hospedagem estática não tem cobrança no Free dentro das quotas. Registro de domínio, minutos de CI além das franquias e eventual Blob Storage para estado têm seus próprios custos. Nenhuma Azure Function é criada nesta arquitetura.

Fontes oficiais: [planos SWA](https://learn.microsoft.com/azure/static-web-apps/plans), [quotas](https://learn.microsoft.com/azure/static-web-apps/quotas), [domínio externo](https://learn.microsoft.com/azure/static-web-apps/custom-domain-external), [domínio raiz](https://learn.microsoft.com/azure/static-web-apps/apex-domain-external), [backend Terraform AzureRM](https://developer.hashicorp.com/terraform/language/backend/azurerm).
