import React, { useState } from 'react';
import './MyForm.module.css';
import { postData } from '../../utils';

function MyFormComponent() {
	const [form, setForm] = useState({
		name: '',

		email: '',

		agreeTerms: false,

		gender: '',
	});

	const [errors, setErrors] = useState({});

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;

		setForm((prevForm) => ({
			...prevForm,

			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validate if any required fields are empty
		const newErrors = {};

		if (form.name?.length < 3) {
			newErrors.name = 'Name must be at least 3 characters.';
		}

		if (!form.email?.includes('@')) {
			newErrors.email = 'Email must be valid.';
		}

		if (!form.agreeTerms) {
			newErrors.agreeTerms = 'You must agree to the terms.';
		}

		if (!form.gender) {
			newErrors.gender = 'You must select a gender.';
		}

		setErrors(newErrors);

		// Check if there are any errors before submitting
		if (Object.keys(newErrors).length === 0) {
			postData(form);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<input
				type="text"
				name="name"
				value={form.name}
				onChange={handleChange}
				placeholder="Name"
			/>
			{errors.name && <p>{errors.name}</p>}
			<input
				type="email"
				name="email"
				value={form.email}
				onChange={handleChange}
				placeholder="Email"
			/>
			{errors.email && <p>{errors.email}</p>}
			<input
				type="checkbox"
				id="agreeTerms"
				name="agreeTerms"
				checked={form.agreeTerms}
				onChange={handleChange}
			/>{' '}
			<label htmlFor="agreeTerms">Agree to Terms</label>
			{errors.agreeTerms && <p>{errors.agreeTerms}</p>}
			<input
				type="radio"
				id="genderMale"
				name="gender"
				value="male"
				checked={form.gender === 'male'}
				onChange={handleChange}
			/>{' '}
			<label htmlFor="genderMale">Male</label>
			<input
				type="radio"
				id="genderFemale"
				name="gender"
				value="female"
				checked={form.gender === 'female'}
				onChange={handleChange}
			/>{' '}
			<label htmlFor="genderFemale">Female</label>
			{errors.gender && <p>{errors.gender}</p>}
			<button type="submit">Submit</button>
		</form>
	);
}

export default MyFormComponent;
