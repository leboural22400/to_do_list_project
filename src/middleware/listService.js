export async function getAllListByUserID(userID) {
  try {
    const resp = await fetch(
      "http://localhost:8080/api/lists/" + userID + "/lists",
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

export async function createNewList(body) {
  try {
    const resp = await fetch("http://localhost:8080/api/lists/", {
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

export async function updateList(newBody, id) {
  try {
    console.log(newBody);
    const resp = await fetch("http://localhost:8080/api/lists/" + id, {
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

export async function destroyList(id) {
  try {
    const resp = await fetch("http://localhost:8080/api/lists/" + id, {
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
