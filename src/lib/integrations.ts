import { Integration } from "@/types/integrations";
import integrationsData from "@/../content/integrations/integrations.json";

/**
 * Get all integrations (apps and tools) from the consolidated JSON file
 */
export function getIntegrations(): Integration[] {
  return integrationsData as Integration[];
}

/**
 * Get integrations filtered by type
 */
export function getIntegrationsByType(type: "app" | "tool"): Integration[] {
  return getIntegrations().filter((integration) => integration.type === type);
}

/**
 * Get a single integration by ID
 */
export function getIntegrationById(id: string): Integration | undefined {
  return getIntegrations().find((integration) => integration.id === id);
}

/**
 * Get all unique categories from all integrations
 */
export function getAllCategories(): string[] {
  const categories = new Set<string>();
  getIntegrations().forEach((integration) => {
    integration.categories.forEach((category) => categories.add(category));
  });
  return Array.from(categories).sort();
}

/**
 * Get integrations filtered by categories
 */
export function getIntegrationsByCategories(categories: string[]): Integration[] {
  if (categories.length === 0) {
    return getIntegrations();
  }
  return getIntegrations().filter((integration) =>
    integration.categories.some((cat) => categories.includes(cat))
  );
}

