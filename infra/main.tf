locals {
  resource_group_name = coalesce(var.resource_group_name, "${var.prefix}-rg")
  static_web_app_name = coalesce(var.static_web_app_name, "${var.prefix}-web")
  tags = merge({
    project    = "luzzinterest"
    managed_by = "terraform"
  }, var.tags)
}

resource "azurerm_resource_group" "site" {
  name     = local.resource_group_name
  location = var.location
  tags     = local.tags
}

resource "azurerm_static_web_app" "site" {
  name                          = local.static_web_app_name
  resource_group_name           = azurerm_resource_group.site.name
  location                      = azurerm_resource_group.site.location
  sku_tier                      = var.sku
  sku_size                      = var.sku
  preview_environments_enabled  = true
  public_network_access_enabled = true
  tags                          = local.tags

  # O deploy é feito pelo GitHub Actions com token, sem vínculo criado pelo portal.
  # O Azure preenche estes campos após a primeira publicação.
  lifecycle {
    ignore_changes = [repository_branch, repository_url]
  }
}

resource "azurerm_static_web_app_custom_domain" "site" {
  count = var.custom_domain == null ? 0 : 1

  static_web_app_id = azurerm_static_web_app.site.id
  domain_name       = var.custom_domain
  validation_type   = var.custom_domain_validation_type
}
