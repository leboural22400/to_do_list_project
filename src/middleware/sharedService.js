export async function findAllSharedByOtherUserID(userID) {
  try {
    const resp = await fetch(
      "http://localhost:8080/api/shared/" + userID + "/sharedWithMe",
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

export async function createNewSharedLink(body) {
  try {
    const resp = await fetch("http://localhost:8080/api/shared/", {
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

export async function destroyShared(idList, idUser) {
  try {
    const resp = await fetch(
      "http://localhost:8080/api/shared/" + idList + "/" + idUser,
      {
        mode: "cors",
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    ).then((resp) => console.log(resp));
    return resp;
  } catch (err) {
    console.log(err);
    return err;
  }
}
