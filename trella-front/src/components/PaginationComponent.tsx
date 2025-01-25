"use client";

import { useEffect, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "./ui/pagination";

// Define the props for the PaginationComponent
interface PaginationComponentProps {
  maxPageComponent?: number;
  totalPages: number;
  currentPage: number;
  querys: Record<string, string | number>;
  route: string;
  wordQueryPage?: string;
}

// Define the structure of a single page object
interface Page {
  id: number;
  page: number;
  active: boolean;
  link: string | null;
}

export default function PaginationComponent({
  maxPageComponent = 3,
  totalPages,
  currentPage,
  querys,
  route,
  wordQueryPage = "pagina",
}: PaginationComponentProps) {
  const [paginas, setPaginas] = useState<Page[]>([]);

  // Function to generate pagination links
  const paginationFunction = (
    maxPageComponent: number,
    currentPage: number,
    totalPages: number
  ): Page[] => {
    let pages: Page[] = [];
    let metade = Math.floor(maxPageComponent / 2);
    let pinicio = currentPage - metade;
    let pfim = currentPage + metade;

    if (pinicio <= 0) {
      pfim += 1 - pinicio;
      pinicio = 1;
    }

    if (pfim > totalPages) {
      pinicio += totalPages - pfim;
      pfim = totalPages;
    }

    for (let i = pinicio; i <= pfim; i++) {
      if (i <= 0 || i > totalPages) continue;

      let link = gerarLink(querys, i);

      pages.push({
        id: i,
        page: i,
        active: currentPage === i,
        link: link ?? null,
      });
    }

    return pages;
  };

  // Function to generate a link for a specific page
  const gerarLink = (querys: Record<string, string | number>, page: number): string => {
    let link = route;

    if (page) querys = { ...querys, [wordQueryPage]: page };

    let newQuerys = new URLSearchParams(querys as Record<string, string>);

    link = `${link}?${newQuerys.toString()}`;

    return link;
  };

  // Update paginas state when querys, currentPage, or totalPages change
  useEffect(() => {
    setPaginas(paginationFunction(maxPageComponent, currentPage, totalPages));
  }, [querys, currentPage, totalPages, maxPageComponent]);

  // Function to check if a specific page number exists in paginas
  const encontrarNumero = (numero: number): boolean => {
    return paginas.some((n) => Number(n.page) === numero);
  };

  return (
    <Pagination className={"m-4 text-primaryLight"}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            data-test="button-pagina-anterior"
            title={"Ir para página anterior"}
            href={gerarLink(querys, currentPage - 1)}
            aria-disabled={currentPage === 1}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>

        {!encontrarNumero(1) && (
          <PaginationItem>
            <PaginationLink
              data-test={"primeira-pagina"}
              href={gerarLink(querys, 1)}
              title={"Ir para página 1"}
            >
              1
            </PaginationLink>
          </PaginationItem>
        )}

        {!paginas.find((page) => page.page - 1 === 1) && paginas.length >= maxPageComponent && (
          <PaginationEllipsis />
        )}

        {paginas?.map((pagina) => (
          <PaginationItem key={pagina?.id}>
            <PaginationLink
              data-test={`pagina-${pagina.page}`}
              isActive={pagina.active}
              href={pagina?.link ?? "#"}
              title={`Ir para página ${pagina?.page}`}
            >
              {pagina?.page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {!paginas.find((page) => page.page + 1 === totalPages) &&
          paginas.length >= maxPageComponent && <PaginationEllipsis />}

        {!encontrarNumero(totalPages) && (
          <PaginationItem>
            <PaginationLink
              data-test={`ultima-pagina`}
              href={gerarLink(querys, totalPages)}
              title={`Ir para página ${totalPages}`}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationNext
            title={"Ir para próxima página"}
            data-test="button-proxima-pagina"
            href={gerarLink(querys, currentPage + 1)}
            aria-disabled={currentPage === totalPages}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}