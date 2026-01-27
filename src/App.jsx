import { useReducer } from "react";
import { CiShoppingCart } from "react-icons/ci";

import "./App.css";
import AddTodo from "./components/AddTodo";
import TodoItems from "./components/TodoItems";

const reducer = (state, action) => {
  if (action.type === "ADD") {
    if (!action.payload.text.trim()) {
      alert("Todo item cannot be empty");
      return state;
    } else {
      return [...state, action.payload];
    }
  }

  if (action.type === "REMOVE") {
    return state.filter((item) => item.id !== action.payload);
  }

  return state;
};

const initialTodos = [];

function App() {
  const [todos, dispatch] = useReducer(reducer, initialTodos);
  return (
    <div>
      <h1>Todo Application</h1>
      <AddTodo dispatch={dispatch} />
      {todos.length === 0 ? (
        <h3
          style={{
            fontStyle: "italic",
            textAlign: "center",
            marginTop: "20px",
            color: "white",
          }}
        >
          Enter Your Daily Task!
          <CiShoppingCart
            style={{
              display: "block",
              margin: "0 auto",
              fontSize: "5rem",
            }}
          />
        </h3>
      ) : null}
      <TodoItems todos={todos} dispatch={dispatch} />
    </div>
  );
}

export default App;
