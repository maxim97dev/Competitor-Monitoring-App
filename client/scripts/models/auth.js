class Auth {

    static async getAuthStatus() {
        const response = await fetch('http://localhost:3000/authstatus', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Credentials': true
            }
        });

        return await response.json();
    }

}

export default Auth;