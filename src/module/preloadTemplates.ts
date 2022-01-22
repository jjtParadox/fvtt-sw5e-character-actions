export async function preloadTemplates(): Promise<Handlebars.TemplateDelegate[]> {
  const templatePaths: string[] = [
    // Add paths to "modules/fvtt-sw5e-character-actions/templates"
  ];

  return loadTemplates(templatePaths);
}
