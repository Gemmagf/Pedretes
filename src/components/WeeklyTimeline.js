import React from 'react';
import { useUsers } from '../context/UsersContext';

const WeeklyTimeline = ({ projects }) => {
  const { users } = useUsers();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Timeline Setmanal</h3>
      {users.map(user => {
        const assignedHours = projects
          .filter(p => p.assignedTo === user.id)
          .reduce((sum, p) => sum + p.estimatedHours, 0);
        const totalHours = user.baseHours + user.extraHours;
        const percentage = Math.min((assignedHours / totalHours) * 100, 100);

        return (
          <div key={user.id}>
            <span className="font-medium">{user.name} ({assignedHours}/{totalHours}h)</span>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
              <div
                className={`h-3 rounded-full ${percentage > 100 ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeeklyTimeline;
