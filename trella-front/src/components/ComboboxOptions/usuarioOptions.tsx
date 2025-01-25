interface Dados {
  foto?: string;
  nome?: string;
  cpf?: string;
}

interface UsuariosOptionsProps {
  dados: Dados;
}

export default function UsuarioOptions({ dados }: UsuariosOptionsProps) {

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col gap-1">
        <span>{dados?.nome}</span>
        {dados?.cpf && (
          <span><b>CPF: </b>{dados?.cpf}</span>
        )}
        </div>
    </div>
  );
}