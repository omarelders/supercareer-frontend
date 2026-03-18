export type PaginationItem = number | 'ellipsis'

export function buildPaginationItems(
  totalPages: number,
  currentPage: number,
  siblingCount = 1
): PaginationItem[] {
  if (totalPages <= 0) {
    return []
  }

  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages)
  const pages = new Set<number>()
  pages.add(1)
  pages.add(totalPages)

  const start = Math.max(1, safeCurrentPage - siblingCount)
  const end = Math.min(totalPages, safeCurrentPage + siblingCount)
  for (let page = start; page <= end; page += 1) {
    pages.add(page)
  }

  const orderedPages = Array.from(pages).sort((a, b) => a - b)
  const result: PaginationItem[] = []

  for (let index = 0; index < orderedPages.length; index += 1) {
    const page = orderedPages[index]
    const previous = orderedPages[index - 1]

    if (typeof previous === 'number' && page - previous > 1) {
      result.push('ellipsis')
    }

    result.push(page)
  }

  return result
}
