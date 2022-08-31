class Tasks {
    static async getTasksList() {
        const response = await fetch('http://localhost:3000/api/tasks', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Access-Control-Allow-Credentials': true
            }
        });

        return await response.json();
    }

    static async getCheckPage(url) {
        const response = await fetch(`http://localhost:3000/api/pagedata?url=${url}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Access-Control-Allow-Credentials': true
            }
        });

        return await response.json();
    }

    static async getFirstPreview(data) {
        const response = await fetch(`http://localhost:3000/api/preview?url=${data}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Access-Control-Allow-Credentials': true
            }
        });

        return await response.json();
    }

    static async getPixelMatch(imgArray) {
        const response = await fetch('http://localhost:3000/api/pixelmatch', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(imgArray)
        });

        return await response.json();
    }

    static async getTextDiff(text) {
        const response = await fetch('http://localhost:3000/api/textdiff', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(text)
        });

        return await response.json();
    }

    static async addTask(newTask) {
        const response = await fetch('http://localhost:3000/api/task', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(newTask)
        });

        return await response.json();
    }

    static async getTask(id) {
        const response = await fetch(`http://localhost:3000/api/task/${id}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Access-Control-Allow-Credentials': true
            }
        });

        return await response.json();
    }

    static async editTask(updatedTask) {
        await fetch(`http://localhost:3000/api/task/${updatedTask.id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(updatedTask)
        });
    }

    static async changeTaskStatus(id) {
        await fetch(`http://localhost:3000/api/task/${id}/done`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Access-Control-Allow-Credentials': true
            }
        });
    }

    static async removeTask(id) {
        await fetch(`http://localhost:3000/api/task/${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Access-Control-Allow-Credentials': true
            }
        });
    }

    static async clearTasksList() {
        await fetch('http://localhost:3000/api/tasks', {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Access-Control-Allow-Credentials': true
            }
        });
    }

}

export default Tasks;