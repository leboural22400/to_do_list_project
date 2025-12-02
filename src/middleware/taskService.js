export async function getAllTaskByListID(listID) {
  try {
    const resp = await fetch(
      "http://localhost:8080/api/tasks/" + listID + "/all",
      {
        mode: "cors",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    ).then((resp) => resp.json());
    return resp;
  } catch (err) {
    return err;
  }
}

export async function createNewTask(body) {
  try {
    const resp = await fetch("http://localhost:8080/api/tasks/", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((resp) => resp.json());
    return resp;
  } catch (err) {
    return err;
  }
}

export async function updateTask(newBody, id) {
  try {
    console.log(newBody);
    const resp = await fetch("http://localhost:8080/api/tasks/" + id, {
      mode: "cors",
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newBody),
    }).then((resp) => console.log(resp));
    return resp;
  } catch (err) {
    console.log(err);
    return err;
  }
}

export async function destroyTask(id) {
  try {
    const resp = await fetch("http://localhost:8080/api/tasks/" + id, {
      mode: "cors",
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((resp) => console.log(resp));
    return resp;
  } catch (err) {
    console.log(err);
    return err;
  }
}
