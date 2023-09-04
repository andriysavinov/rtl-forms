import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import axios from 'axios';
import MyFormComponent from './MyForm';
import { BASE_URL, postData } from '../../utils';
jest.mock('axios');

describe('MyFormComponent', () => {
	let formData;

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
			fireEvent.change(screen.getByPlaceholderText('Name'), {
				target: { value: formData.name.repeat(10) },
			});
			fireEvent.change(screen.getByPlaceholderText('Email'), {
				target: { value: formData.email },
			});
			fireEvent.click(screen.getByLabelText('Agree to Terms'));
			fireEvent.click(screen.getByLabelText('Male'));

			fireEvent.click(screen.getByText('Submit'));

			await waitFor(() => {
				expect(axios.post).toHaveBeenCalledWith(
					'https://jsonplaceholder.typicode.com/posts',
					expect.objectContaining({
						...formData,
						name: formData.name.repeat(10),
					}),
				);
			});
		});

		it('submits the form with changed gender', async () => {
			render(<MyFormComponent />);
			fireEvent.change(screen.getByPlaceholderText('Name'), {
				target: { value: formData.name },
			});
			fireEvent.change(screen.getByPlaceholderText('Email'), {
				target: { value: formData.email },
			});
			fireEvent.click(screen.getByLabelText('Agree to Terms'));
			fireEvent.click(screen.getByLabelText('Female'));
			fireEvent.click(screen.getByText('Submit'));

			await waitFor(() => {
				expect(axios.post).toHaveBeenCalledWith(
					'https://jsonplaceholder.typicode.com/posts',
					expect.objectContaining({
						...formData,
						gender: 'female',
					}),
				);
			});
		});

		it('submits the form with a complex email', async () => {
			render(<MyFormComponent />);
			fireEvent.change(screen.getByPlaceholderText('Name'), {
				target: { value: formData.name },
			});
			fireEvent.change(screen.getByPlaceholderText('Email'), {
				target: { value: 'test.name+alias@example.co.uk' },
			});
			fireEvent.click(screen.getByLabelText('Agree to Terms'));
			fireEvent.click(screen.getByLabelText('Male'));
			fireEvent.click(screen.getByText('Submit'));

			await waitFor(() => {
				expect(axios.post).toHaveBeenCalledWith(
					'https://jsonplaceholder.typicode.com/posts',
					expect.objectContaining({
						...formData,
						email: 'test.name+alias@example.co.uk',
					}),
				);
			});
		});

		it('resubmits the form after an initial successful submission', async () => {
			render(<MyFormComponent />);
			fireEvent.change(screen.getByPlaceholderText('Name'), {
				target: { value: formData.name },
			});
			fireEvent.change(screen.getByPlaceholderText('Email'), {
				target: { value: formData.email },
			});
			fireEvent.click(screen.getByLabelText('Agree to Terms'));
			fireEvent.click(screen.getByLabelText('Male'));

			fireEvent.click(screen.getByText('Submit'));

			await waitFor(() => {
				expect(axios.post).toHaveBeenCalledWith(
					'https://jsonplaceholder.typicode.com/posts',
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
			fireEvent.change(screen.getByPlaceholderText('Name'), {
				target: { value: '' },
			});
			fireEvent.change(screen.getByPlaceholderText('Email'), {
				target: { value: formData.email },
			});
			fireEvent.click(screen.getByLabelText('Agree to Terms'));
			fireEvent.click(screen.getByLabelText('Male'));
			fireEvent.click(screen.getByText('Submit'));

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
			fireEvent.change(screen.getByPlaceholderText('Name'), {
				target: { value: formData.name },
			});
			fireEvent.change(screen.getByPlaceholderText('Email'), {
				target: { value: 'test.name+aliasexample.co.uk' },
			});
			fireEvent.click(screen.getByLabelText('Agree to Terms'));
			fireEvent.click(screen.getByLabelText('Male'));
			fireEvent.click(screen.getByText('Submit'));

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
			fireEvent.change(screen.getByPlaceholderText('Name'), {
				target: { value: formData.name },
			});
			fireEvent.change(screen.getByPlaceholderText('Email'), {
				target: { value: formData.email },
			});
			fireEvent.click(screen.getByLabelText('Male'));
			fireEvent.click(screen.getByText('Submit'));

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
			fireEvent.change(screen.getByPlaceholderText('Name'), {
				target: { value: formData.name },
			});
			fireEvent.change(screen.getByPlaceholderText('Email'), {
				target: { value: formData.email },
			});
			fireEvent.click(screen.getByLabelText('Agree to Terms'));
			fireEvent.click(screen.getByText('Submit'));

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
			fireEvent.change(screen.getByPlaceholderText('Name'), {
				target: { value: 'Jo' },
			});
			fireEvent.change(screen.getByPlaceholderText('Email'), {
				target: { value: formData.email },
			});
			fireEvent.click(screen.getByLabelText('Agree to Terms'));
			fireEvent.click(screen.getByLabelText('Male'));

			fireEvent.click(screen.getByText('Submit'));

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
