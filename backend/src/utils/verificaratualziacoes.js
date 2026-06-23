export default async function handleScrape(baseUrl = "") {
  const response = await fetch(`${baseUrl}/adminjv/scrape/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const responseText = await response.text();
  const data = responseText ? JSON.parse(responseText) : null;

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Erro ${response.status}`);
  }

  return data;
}
