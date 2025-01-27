import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';

interface TaskColumnProps {
  columnId: string;
  tasks: unknown[];
}

export const TaskColumn: React.FC<TaskColumnProps> = ({ columnId, tasks }) => {
  return (
    <Droppable droppableId={columnId}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{
            width: '22%',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
          }}
        >
          <h2>{columnId}</h2>
          {Array.isArray(tasks) && tasks.length > 0 ? (
            tasks.map((task, index) => (
              <TaskCard key={`${task._id}-${index}`} task={task} index={index} />
            ))
          ) : (
            <p>Nenhuma tarefa nesta coluna</p>
          )}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};