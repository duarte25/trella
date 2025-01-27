import React from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { TaskColumn } from './TaskColumn';
import { StatusColumns } from './useTaskBoard';

type TaskBoardProps = {
  columns: StatusColumns;
  onDragEnd: (result: DropResult) => void;
};

export const TaskBoard: React.FC<TaskBoardProps> = ({ columns, onDragEnd }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {Object.entries(columns).map(([columnId, tasks]) => (
          <TaskColumn key={columnId} columnId={columnId} tasks={tasks} />
        ))}
      </div>
    </DragDropContext>
  );
};