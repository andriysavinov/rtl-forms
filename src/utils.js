import axios from 'axios';

export const BASE_URL = 'https://jsonplaceholder.typicode.com';

export const postData = async (form) => {
	try {
		const response = await axios.post(`${BASE_URL}/posts`, form);
		return response.data;
	} catch (error) {
		return { error };
	}
};
