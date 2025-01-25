interface Dados {
  foto?: string;
  nome?: string;
  cpf?: string;
}

interface MotoristaOptionsProps {
  dados: Dados;
}

export default function UsuarioOptions({ dados }: MotoristaOptionsProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col gap-1">
        <span>{dados?.nome}</span>
        {dados?.cpf && (
          <span><b>CPF: </b>{dados?.cpf}</span>
        )}
        {/* {dados?.numero_cnh && (
          <span><b>N°CNH: </b>{dados?.numero_cnh}</span>
        )}
        {dados?.categoria_cnh && (
          <span><b>Categoria: </b>{dados?.categoria_cnh}</span>
        )} */}
        </div>
    </div>
  );
}