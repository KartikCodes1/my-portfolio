/** "https://www.linkedin.com/in/kartikindian/" -> "linkedin.com/in/kartikindian" */
export const displayUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
