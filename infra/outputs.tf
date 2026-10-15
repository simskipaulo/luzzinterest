output "resource_group_name" {
  description = "Resource Group criado para o site."
  value       = azurerm_resource_group.site.name
}

output "static_web_app_name" {
  description = "Nome do Static Web App."
  value       = azurerm_static_web_app.site.name
}

output "default_hostname" {
  description = "Hostname real fornecido pelo Azure, sem protocolo."
  value       = azurerm_static_web_app.site.default_host_name
}

output "swa_public_url" {
  description = "URL HTTPS real. Copie para a variável SWA_PUBLIC_URL do repositório."
  value       = "https://${azurerm_static_web_app.site.default_host_name}"
}

output "site_url" {
  description = "URL pública para SITE_URL; use domínio próprio somente depois de validar DNS e HTTPS."
  value       = "https://${coalesce(var.custom_domain, azurerm_static_web_app.site.default_host_name)}"
}

output "custom_domain_validation_token" {
  description = "Token público para o registro DNS TXT, quando necessário. Validação TXT é assíncrona."
  value       = try(azurerm_static_web_app_custom_domain.site[0].validation_token, null)
}
