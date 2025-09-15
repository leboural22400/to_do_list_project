class TaskService {

    fetchTasksByListId(listId) {
        return fetch(`http://localhost:3000/api/tasks/${listId}/tasks`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Tasks fetched:', data);
                return data.success ? data.data : [];
            })
            .catch(error => {
                console.error('Error fetching tasks:', error);
                throw error;
            });
    }

}

export default TaskService;