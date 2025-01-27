import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Tarefa } from '@/api/models/Tarefa';

type TaskCardProps = {
  task: Tarefa;
  index: number;
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, index }) => {
  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            marginBottom: '10px',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            backgroundColor: '#f9f9f9',
            ...provided.draggableProps.style,
          }}
        >
          <h3>{task.titulo}</h3>
          <p>{task.descricao}</p>
          <p>Responsável: {task.responsavel.nome}</p>
        </div>
      )}
    </Draggable>
  );
};