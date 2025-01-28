import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { StatusColumns } from './useTaskBoard';
import { Tarefa } from '@/api/models/Tarefa';
import { TaskColumn } from './TaskColumn';
import React from 'react';

type TaskBoardProps = {
  columns: StatusColumns;
  onDragEnd: (result: DropResult) => void;
  onEdit: (task: Tarefa) => void;
  onDelete: (taskId: string) => void;
};

export const TaskBoard: React.FC<TaskBoardProps> = ({ columns, onDragEnd, onEdit, onDelete }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex justify-between">
        {Object.entries(columns).map(([columnId, tasks]) => (
          <TaskColumn
            key={columnId}
            columnId={columnId}
            tasks={tasks}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </DragDropContext>
  );
};