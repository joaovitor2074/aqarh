export function createResearcherSlug(name = "") {
  return String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createResearcherAnchor(name = "") {
  const slug = createResearcherSlug(name);
  return slug ? `pesquisador-${slug}` : "";
}

export function createResearcherHref(name = "") {
  const anchor = createResearcherAnchor(name);
  return anchor ? `/equipe#${anchor}` : "/equipe";
}
