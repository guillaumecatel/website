import { SITE_DESCRIPTION, SITE_TITLE } from '@/constants'

interface TitleOptions {
  pageTitle?: string // Titre de la page (facultatif pour la home)
  siteTitle?: string // Nom du site (ex. Guillaume Catel)
  siteDescription?: string // Baseline ou description
  sep1?: string // Séparateur entre pageTitle et siteTitle
  sep2?: string // Séparateur entre siteTitle et description
}

/**
 * Set the document title based on the provided options.
 *
 * @param {TitleOptions} options - Options for setting the title.
 * @returns {string} The formatted title string.
 */
export function setTitle({
  pageTitle,
  siteTitle = SITE_TITLE,
  siteDescription = SITE_DESCRIPTION,
  sep1 = ' — ',
  sep2 = ' ¬ ',
}: TitleOptions): string {
  let title = ''

  if (pageTitle) {
    title += pageTitle + sep1
  }

  title += siteTitle

  if (siteDescription) {
    title += sep2 + siteDescription
  }

  return title
}
