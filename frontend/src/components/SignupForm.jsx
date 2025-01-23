import React, { useState } from 'react';

const SignupForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        displayName: '',
        bio: '',
    });
    const [message, setMessage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const csrfResponse = await fetch('/api/csrf-token', {
                credentials: 'include',
            });
            const csrfData = await csrfResponse.json();

            const csrfToken = document.cookie
                .split('; ')
                .find((row) => row.startsWith('XSRF-TOKEN='))
                ?.split('=')[1];

            const { email, username, password, displayName } = formData;

            const response = await fetch('/api/users/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ email, username, password, displayName }),
                credentials: 'include',
            });

            const data = await response.json();
            if (response.ok) {
                setMessage(`Signup successful! Welcome, ${data.user.username}`);
            } else {
                setMessage(data.error || 'Signup failed.');
            }
        } catch (err) {
            console.error('Error during signup:', err);
            setMessage('An error occurred. Please try again.');
        }
    };

    return (
        <div>
            <h2>Signup</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="displayName"
                    placeholder="Display Name"
                    value={formData.displayName}
                    onChange={handleChange}
                    required
                />
                <textarea
                    type="text"
                    name="bio"
                    placeholder="Bio"
                    value={formData.bio}
                    onChange={handleChange}
                />
                <button type="submit">Signup</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default SignupForm;
