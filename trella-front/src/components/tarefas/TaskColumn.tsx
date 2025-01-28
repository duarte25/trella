import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Tarefa } from '@/api/models/Tarefa';
import { TaskCard } from './TaskCard';

type TaskColumnProps = {
  columnId: string;
  tasks: Tarefa[];
  onEdit: (task: Tarefa) => void;
  onDelete: (taskId: string) => void;
};

export const TaskColumn: React.FC<TaskColumnProps> = ({ columnId, tasks, onEdit, onDelete }) => {
  return (
    <Droppable droppableId={columnId}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="flex flex-col gap-4 border border-gray-400 rounded-lg "
          style={{
            width: '22%',
          }}
        >
          <div className="border-b border-gray-400">
            <h2 className=" text-white font-bold m-2">{columnId}</h2>
          </div>
          {Array.isArray(tasks) && tasks.length > 0 ? (
            tasks.map((task, index) => (
              <TaskCard
                key={`${task._id}-${index}`}
                task={task}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
              />
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