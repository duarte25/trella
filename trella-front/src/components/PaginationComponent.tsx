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

interface PaginationComponentProps {
  maxPageComponent?: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void; // Callback para notificar a mudança de página
}

interface Page {
  id: number;
  page: number;
  active: boolean;
}

export default function PaginationComponent({
  maxPageComponent = 3,
  totalPages,
  currentPage,
  onPageChange,
}: PaginationComponentProps) {
  const [paginas, setPaginas] = useState<Page[]>([]);

  // Função para gerar os números de página
  const paginationFunction = (
    maxPageComponent: number,
    currentPage: number,
    totalPages: number
  ): Page[] => {
    const pages: Page[] = [];
    const metade = Math.floor(maxPageComponent / 2);
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

      pages.push({
        id: i,
        page: i,
        active: currentPage === i,
      });
    }

    return pages;
  };

  // Atualiza as páginas quando `currentPage` ou `totalPages` mudam
  useEffect(() => {
    setPaginas(paginationFunction(maxPageComponent, currentPage, totalPages));
  }, [currentPage, totalPages, maxPageComponent]);

  // Função para verificar se um número de página existe
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
            onClick={() => onPageChange(currentPage - 1)}
            aria-disabled={currentPage === 1}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>

        {!encontrarNumero(1) && (
          <PaginationItem>
            <PaginationLink
              data-test={"primeira-pagina"}
              onClick={() => onPageChange(1)}
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
              onClick={() => onPageChange(pagina.page)}
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
              onClick={() => onPageChange(totalPages)}
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
            onClick={() => onPageChange(currentPage + 1)}
            aria-disabled={currentPage === totalPages}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}