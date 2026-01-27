import { useState } from "react";
import { IoMdAddCircle } from "react-icons/io";

function AddTodo({ dispatch }) {
  const [value, setValue] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({
      type: "ADD",
      payload: {
        id: crypto.randomUUID(),
        text: value.toUpperCase(),
        completed: false,
      },
    });
    setValue("");
  };
  return (
    <div className="todo-app">
      <form className="add-todo" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter todo item"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
        />
        <button type="submit">
          <IoMdAddCircle
            style={{
              fontSize: "1.5rem",
            }}
          />{" "}
          Add Todo{" "}
        </button>
      </form>
    </div>
  );
}

export default AddTodo;
