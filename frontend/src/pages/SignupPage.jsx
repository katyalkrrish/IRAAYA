import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser } from 'react-icons/fi'

// Returns 0 (empty), 1 (weak), 2 (medium), 3 (strong)
function getPasswordStrength(pw) {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 8)               score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw))             score++
  if (/[^A-Za-z0-9]/.test(pw))      score++
  if (score <= 1) return 1           // weak
  if (score === 2 || score === 3) return 2 // medium
  return 3                           // strong
}

const STRENGTH_LABEL = ['', 'Weak', 'Medium', 'Strong']
const STRENGTH_CLASS = ['', 'strength--weak', 'strength--medium', 'strength--strong']

export default function SignupPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName]               = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword]       = useState(false)
  const [showConfirm, setShowConfirm]         = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  const strength = getPasswordStrength(password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await register(name.trim(), email.trim(), password)
      toast.success('Account created! Welcome to Iraaya 🪔')
      navigate('/', { replace: true })
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Something went wrong. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Animated background orbs */}
      <div className="auth-orbs" aria-hidden="true">
        <span className="auth-orb auth-orb--1" />
        <span className="auth-orb auth-orb--2" />
        <span className="auth-orb auth-orb--3" />
      </div>

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-card__logo">
          <img src="/iraaya-logo.jpg" alt="Iraaya" />
          <p>Create your account</p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="auth-error" role="alert">
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="input-group">
            <label htmlFor="signup-name" className="input-label">
              Full name
            </label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <FiUser />
              </span>
              <input
                id="signup-name"
                type="text"
                className="input auth-input--icon"
                placeholder="Priya Sharma"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="input-group">
            <label htmlFor="signup-email" className="input-label">
              Email address
            </label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <FiMail />
              </span>
              <input
                id="signup-email"
                type="email"
                className="input auth-input--icon"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="input-group">
            <label htmlFor="signup-password" className="input-label">
              Password
            </label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <FiLock />
              </span>
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                className="input auth-input--icon auth-input--icon-right"
                placeholder="Create a strong password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {/* Password strength indicator */}
            {password.length > 0 && (
              <div className="auth-strength">
                <div className="auth-strength__bars">
                  <span className={`auth-strength__bar ${strength >= 1 ? STRENGTH_CLASS[strength] : ''}`} />
                  <span className={`auth-strength__bar ${strength >= 2 ? STRENGTH_CLASS[strength] : ''}`} />
                  <span className={`auth-strength__bar ${strength >= 3 ? STRENGTH_CLASS[strength] : ''}`} />
                </div>
                <span className={`auth-strength__label ${STRENGTH_CLASS[strength]}`}>
                  {STRENGTH_LABEL[strength]}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="input-group">
            <label htmlFor="signup-confirm" className="input-label">
              Confirm password
            </label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <FiLock />
              </span>
              <input
                id="signup-confirm"
                type={showConfirm ? 'text' : 'password'}
                className={`input auth-input--icon auth-input--icon-right ${
                  confirmPassword && password !== confirmPassword ? 'input--error' : ''
                }`}
                placeholder="Repeat your password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showConfirm ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <span className="auth-field-error">Passwords do not match</span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="auth-spinner" />
                Creating account…
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Switch to login */}
        <p className="auth-divider">
          Already have an account?{' '}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}
