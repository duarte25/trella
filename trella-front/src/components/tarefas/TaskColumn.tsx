import { Droppable } from '@hello-pangea/dnd';
import { Tarefa } from '@/api/models/Tarefa';
import { TaskCard } from './TaskCard';
import React from 'react';

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
          className="border border-gray-500 rounded-lg"
          style={{
            width: "22%",
            height: "80vh",
          }}
        >
          <div className="border-b border-gray-500">
            <h2 className=" text-white font-bold m-2">{columnId}</h2>
          </div>
          <div
            className="overflow-y-auto flex-1 p-2 flex flex-col gap-2"
            style={{
              maxHeight: "calc(80vh - 60px)",
            }}
          >
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
              <></>
            )}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
};