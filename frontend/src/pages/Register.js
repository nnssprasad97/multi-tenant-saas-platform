/**
 * Register Component
 * 
 * This component handles tenant and admin user registration for the Multi-Tenant SaaS platform.
 * It provides a form for new organizations to register with an admin user account.
 * 
 * Features:
 * - Organization name input (tenantName)
 * - Subdomain configuration for multi-tenant isolation
 * - Admin email registration and secure password management
 * - Admin full name registration
 * - Real-time form validation and error handling
 * - API integration with authAPI.registerTenant() endpoint
 * - Navigation to login page after successful registration
 * 
 * The component manages form state using React hooks (useState) and handles
 * asynchronous registration requests with proper error handling and user feedback.
 * 
 * @component
 * @returns {React.ReactElement} Register form component with tenant setup fields
 */
import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        tenantName: '', subdomain: '', adminEmail: '', adminPassword: '', adminFullName: ''
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await authAPI.registerTenant(formData);
            alert('Organization Registered Successfully!');
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="auth-card">
            <h2>Start Your Free Trial</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Organization Name</label>
                    <input type="text" placeholder="Acme Corp" required 
                           onChange={e => setFormData({...formData, tenantName: e.target.value})} />
                </div>
                <div className="form-group">
                    <label>Subdomain</label>
                    <input type="text" placeholder="acme" required 
                           onChange={e => setFormData({...formData, subdomain: e.target.value})} />
                </div>
                <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" placeholder="John Doe" required 
                           onChange={e => setFormData({...formData, adminFullName: e.target.value})} />
                </div>
                <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" placeholder="john@example.com" required 
                           onChange={e => setFormData({...formData, adminEmail: e.target.value})} />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" placeholder="••••••••" required 
                           onChange={e => setFormData({...formData, adminPassword: e.target.value})} />
                </div>
                <button type="submit">Create Account</button>
            </form>
            <Link to="/login" className="text-link">Already have an account? Sign in</Link>
        </div>
    );
};

export default Register;
