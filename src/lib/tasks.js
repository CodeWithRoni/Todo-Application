export function taskReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return { ...state, tasks: [action.task, ...state.tasks] }
    case 'UPDATE':
      return { ...state, tasks: state.tasks.map(task => task.id === action.id ? { ...task, ...action.changes } : task) }
    case 'TOGGLE':
      return { ...state, tasks: state.tasks.map(task => task.id === action.id ? { ...task, completed: !task.completed } : task) }
    case 'DELETE':
      return { ...state, tasks: state.tasks.filter(task => task.id !== action.id) }
    case 'CLEAR_COMPLETED':
      return { ...state, tasks: state.tasks.filter(task => !task.completed) }
    default:
      return state
  }
}

