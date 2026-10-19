import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiEye, FiEyeOff, FiMail, FiLock } from 'react-icons/fi'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  // Redirect to the page the user was trying to visit, or home
  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    try {
      await login(email.trim(), password)
      if (rememberMe) {
        localStorage.setItem('iraaya_remember', email.trim())
      } else {
        localStorage.removeItem('iraaya_remember')
      }
      toast.success('Welcome back! 🙏')
      navigate(from, { replace: true })
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Invalid email or password. Please try again.'
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
          <p>Sign in to your account</p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="auth-error" role="alert">
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="input-group">
            <label htmlFor="login-email" className="input-label">
              Email address
            </label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <FiMail />
              </span>
              <input
                id="login-email"
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
            <label htmlFor="login-password" className="input-label">
              Password
            </label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <FiLock />
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="input auth-input--icon auth-input--icon-right"
                placeholder="Enter your password"
                autoComplete="current-password"
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
          </div>

          {/* Remember me */}
          <div className="auth-remember">
            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                className="auth-checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <span className="auth-checkbox-custom" />
              Remember me
            </label>
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
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Switch to signup */}
        <p className="auth-divider">
          Don&rsquo;t have an account?{' '}
          <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
