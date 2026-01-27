import React from "react";
import { MdDeleteForever } from "react-icons/md";

function TodoItem({ id, text, dispatch }) {
  const handleRemove = (id) => {
    dispatch({
      type: "REMOVE",
      payload: id,
    });
  };
  return (
    <div className="todo-item ">
      <div
        style={{
          display: "flex",
          alignContent: "center",
          alignItems: "center",
          justifyContent: "center",
        }}
        className="todo-item-text"
      >
        <input
          style={{
            input: "checkbox",
            width: "20px",
            height: "20px",
            marginLeft: "1rem",
            marginRight: "1rem",
          }}
          type="checkbox"
          name="checkbox"
          id="checkbox"
          className="completed"
        />
        <label htmlFor="checkbox">{text}</label>
      </div>
      <button
        onClick={() => {
          handleRemove(id);
        }}
      >
        Remove
        <MdDeleteForever
          style={{
            fontSize: "2rem",
          }}
        />
      </button>
    </div>
  );
}

export default TodoItem;
