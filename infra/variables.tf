variable "subscription_id" {
  description = "ID da assinatura Azure que receberá os recursos."
  type        = string
}

variable "prefix" {
  description = "Prefixo usado nos nomes padrão dos recursos."
  type        = string
  default     = "luzzinterest"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{2,29}$", var.prefix))
    error_message = "Use de 3 a 30 caracteres: letras minúsculas, números e hífens, começando por uma letra."
  }
}

variable "location" {
  description = "Região de gerenciamento do Static Web App; os arquivos estáticos têm distribuição global."
  type        = string
  default     = "eastus2"
}

variable "resource_group_name" {
  description = "Nome opcional do novo Resource Group; padrão: <prefix>-rg."
  type        = string
  default     = null
  nullable    = true
}

variable "static_web_app_name" {
  description = "Nome opcional do Static Web App; padrão: <prefix>-web."
  type        = string
  default     = null
  nullable    = true
}

variable "sku" {
  description = "Plano do Static Web Apps. Free é o padrão; Standard gera cobrança."
  type        = string
  default     = "Free"

  validation {
    condition     = contains(["Free", "Standard"], var.sku)
    error_message = "O plano deve ser Free ou Standard."
  }
}

variable "custom_domain" {
  description = "Domínio opcional, sem protocolo nem caminho. Configure o DNS antes da validação por CNAME."
  type        = string
  default     = null
  nullable    = true

  validation {
    condition     = var.custom_domain == null || can(regex("^[A-Za-z0-9]([A-Za-z0-9.-]*[A-Za-z0-9])?\\.[A-Za-z]{2,}$", var.custom_domain))
    error_message = "Informe somente o domínio, por exemplo www.sua-loja.com.br, ou null."
  }
}

variable "custom_domain_validation_type" {
  description = "cname-delegation para subdomínio; dns-txt-token para domínio raiz ou validação por TXT."
  type        = string
  default     = "cname-delegation"

  validation {
    condition     = contains(["cname-delegation", "dns-txt-token"], var.custom_domain_validation_type)
    error_message = "Use cname-delegation ou dns-txt-token."
  }
}

variable "tags" {
  description = "Tags adicionais dos recursos."
  type        = map(string)
  default     = {}
}
