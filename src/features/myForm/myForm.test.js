import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import axios from 'axios';
import MyFormComponent from './MyForm';
import { BASE_URL, postData } from '../../utils';
jest.mock('axios');

describe('MyFormComponent', () => {
	let formData;

	const fireEvents = (name, email, agreement, gender) => {
		fireEvent.change(screen.getByPlaceholderText('Name'), {
			target: { value: name },
		});
		fireEvent.change(screen.getByPlaceholderText('Email'), {
			target: { value: email },
		});

		if (agreement) fireEvent.click(screen.getByLabelText('Agree to Terms'));
		switch (gender) {
			case 'male':
				fireEvent.click(screen.getByLabelText('Male'));
				break;
			case 'female':
				fireEvent.click(screen.getByLabelText('Female'));
				break;
			default:
				break;
		}

		fireEvent.click(screen.getByText('Submit'));
	};

	beforeEach(() => {
		// Common test data for form fields
		formData = {
			name: 'John Doe',
			email: 'john@example.com',
			gender: 'male',
			agreeTerms: true,
		};
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Positive Test Cases', () => {
		it('submits the form with all fields filled correctly', async () => {
			render(<MyFormComponent />);
			await postData(formData);
			expect(axios.post).toHaveBeenCalledWith(`${BASE_URL}/posts`, {
				...formData,
			});
		});

		it('submits the form with a name of any length', async () => {
			render(<MyFormComponent />);
			let longName = formData.name.repeat(10);
			fireEvents(longName, formData.email, true, 'male');

			await waitFor(() => {
				expect(axios.post).toHaveBeenCalledWith(
					`${BASE_URL}/posts`,
					expect.objectContaining({
						...formData,
						name: longName,
					}),
				);
			});
		});

		it('submits the form with changed gender', async () => {
			render(<MyFormComponent />);
			fireEvents(formData.name, formData.email, true, 'female');

			await waitFor(() => {
				expect(axios.post).toHaveBeenCalledWith(
					`${BASE_URL}/posts`,
					expect.objectContaining({
						...formData,
						gender: 'female',
					}),
				);
			});
		});

		it('submits the form with a complex email', async () => {
			render(<MyFormComponent />);
			let complexEmail = 'test.name+alias@example.co.uk';
			fireEvents(formData.name, complexEmail, true, 'male');

			await waitFor(() => {
				expect(axios.post).toHaveBeenCalledWith(
					`${BASE_URL}/posts`,
					expect.objectContaining({
						...formData,
						email: complexEmail,
					}),
				);
			});
		});

		it('resubmits the form after an initial successful submission', async () => {
			render(<MyFormComponent />);
			fireEvents(formData.name, formData.email, true, 'male');

			await waitFor(() => {
				expect(axios.post).toHaveBeenCalledWith(
					`${BASE_URL}/posts`,
					expect.objectContaining({
						...formData,
					}),
				);
			});

			fireEvent.click(screen.getByText('Submit'));

			await waitFor(() => {
				expect(axios.post).toBeCalledTimes(2);
			});
		});
	});

	describe('Negative Test Cases', () => {
		it('displays error message when submitting without a name', async () => {
			render(<MyFormComponent />);
			fireEvents('', formData.email, true, 'male');

			await waitFor(() => {
				expect(axios.post).not.toBeCalled();
			});
			await waitFor(() => {
				expect(
					screen.getByText('Name must be at least 3 characters.'),
				).toBeInTheDocument();
			});
		});

		it('displays error message when submitting with an invalid email address', async () => {
			render(<MyFormComponent />);
			let invalidEmail = 'test.name+aliasexample.co.uk';
			fireEvents(formData.name, invalidEmail, true, 'male');

			await waitFor(() => {
				expect(axios.post).not.toBeCalled();
			});
			await waitFor(() => {
				expect(
					screen.getByText('Email must be valid.'),
				).toBeInTheDocument();
			});
		});

		it('displays error message when submitting without checking the "Agree to Terms" checkbox', async () => {
			render(<MyFormComponent />);
			fireEvents(formData.name, formData.email, false, 'male');

			await waitFor(() => {
				expect(axios.post).not.toBeCalled();
			});
			await waitFor(() => {
				expect(
					screen.getByText('You must agree to the terms.'),
				).toBeInTheDocument();
			});
		});

		it('displays error message when submitting without selecting a gender', async () => {
			render(<MyFormComponent />);
			fireEvents(formData.name, formData.email, true, '');

			await waitFor(() => {
				expect(axios.post).not.toBeCalled();
			});
			await waitFor(() => {
				expect(
					screen.getByText('You must select a gender.'),
				).toBeInTheDocument();
			});
		});

		it('displays error message when submitting with a short name', async () => {
			render(<MyFormComponent />);
			fireEvents('Jo', formData.email, true, 'male');

			await waitFor(() => {
				expect(axios.post).not.toBeCalled();
			});
			await waitFor(() => {
				expect(
					screen.getByText('Name must be at least 3 characters.'),
				).toBeInTheDocument();
			});
		});
	});
});
