import TodoItem from "./TodoItem";

function TodoItems({ todos, dispatch }) {
  return (
    <div>
      {todos.map((item) => {
        return <TodoItem {...item} key={todos.id} dispatch={dispatch} />;
      })}
    </div>
  );
}

export default TodoItems;
