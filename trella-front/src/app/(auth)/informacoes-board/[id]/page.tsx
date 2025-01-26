// app/informacoes-board/[id]/page.tsx
import React from 'react';

interface InformacoesBoardProps {
  params: {
    id: string;
  };
}

const InformacoesBoard = ({ params }: InformacoesBoardProps) => {
  const { id } = params;

  return (
    <div>
      <h1>Informações da Board</h1>
      <p>ID da Board: {id}</p>
      {/* Aqui você pode buscar e exibir os detalhes da board com base no `id` */}
    </div>
  );
};

export default InformacoesBoard;