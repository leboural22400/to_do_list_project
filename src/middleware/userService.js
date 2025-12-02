export async function getUserByID(userID) {
  try {
    const resp = await fetch("http://localhost:8080/api/users/" + userID, {
      mode: "cors",
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((resp) => resp.json());
    return resp;
  } catch (err) {
    return err;
  }
}

export async function getUserByMail(emailUser) {
  try {
    const resp = await fetch(
      "http://localhost:8080/api/users/findByEmail/" + emailUser,
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
    return null;
  }
}

export async function compareUserPasswordByID(password, userID) {
  try {
    const resp = await fetch(
      "http://localhost:8080/api/users/login/" + userID + "/" + password,
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
    return null;
  }
}

export async function createNewUser(body) {
  try {
    return await fetch("http://localhost:8080/api/users/", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((resp) => resp.json())
      .catch((err) => null);
  } catch (err) {
    return null;
  }
}

export async function updateUser(newBody, id) {
  try {
    console.log(newBody);
    const resp = await fetch("http://localhost:8080/api/users/" + id, {
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

export async function destroyUser(id) {
  try {
    const resp = await fetch("http://localhost:8080/api/users/" + id, {
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
